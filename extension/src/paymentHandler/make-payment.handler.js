import {
    createSetCustomFieldAction,
    createAddTransactionActionByResponse,
    getPaymentKeyUpdateAction, deleteCustomFieldAction,
} from './payment-utils.js'
import c from '../config/constants.js'
import {makePayment} from '../service/web-component-service.js'

async function execute(paymentObject) {

    const paymentExtensionRequest = JSON.parse(paymentObject.custom.fields.PaymentExtensionRequest)
    const makePaymentRequestObj = paymentExtensionRequest?.request
    let capturedAmount = paymentObject.amountPlanned.centAmount;
    if (paymentObject.amountPlanned.type === 'centPrecision') {
        const fraction = 10 ** paymentObject.amountPlanned.fractionDigits;
        capturedAmount = paymentObject.amountPlanned.centAmount / fraction;
        makePaymentRequestObj.amount.value = capturedAmount;
    }
    let paymentActions = [];
    let actions = []
    const customFieldsToDelete = [
        'PaymentExtensionRequest'
    ];
    const [response] = await Promise.all([makePayment(makePaymentRequestObj,paymentObject)])
    if (response.status === 'Failure') {
        const errorMessage = response.message ?? "Invalid transaction details"
        actions.push(createSetCustomFieldAction(c.CTP_INTERACTION_PAYMENT_EXTENSION_RESPONSE, JSON.stringify({
            status: "Failure",
            message: errorMessage
        })));
        paymentActions = await deleteCustomFields(actions, paymentObject, customFieldsToDelete);
        return {
            actions: paymentActions
        };
    }
    const paydockStatus = response?.paydockStatus ?? makePaymentRequestObj?.PaydockPaymentStatus;
    actions = generateActionsFromResponse(actions, response, makePaymentRequestObj, capturedAmount, paymentObject, paydockStatus);

    if (paydockStatus) {
        const {orderState, orderPaymentState} = getCommercetoolsStatusesByPaydockStatus(paydockStatus);
        actions.push(createSetCustomFieldAction(c.CTP_INTERACTION_PAYMENT_EXTENSION_RESPONSE, JSON.stringify({
            orderPaymentStatus: orderPaymentState,
            orderStatus: orderState
        })));

        if (paydockStatus === c.STATUS_TYPES.PAID) {
            actions.push(createSetCustomFieldAction('CapturedAmount', capturedAmount));
        }
    } else {
        customFieldsToDelete.push(c.CTP_INTERACTION_PAYMENT_EXTENSION_RESPONSE)
    }
    paymentActions = await deleteCustomFields(actions, paymentObject, customFieldsToDelete)
    return {
        actions: paymentActions
    }
}

function generateActionsFromResponse(actions, response, requestBodyJson, capturedAmount, paymentObject, paydockStatus) {
    const paymentMethod = requestBodyJson?.PaydockPaymentType;
    const paydockTransactionId = response?.chargeId ?? requestBodyJson?.PaydockTransactionId;
    const commerceToolsUserId = requestBodyJson?.CommerceToolsUserId;
    const additionalInfo = requestBodyJson?.AdditionalInfo;

    if (paymentMethod) {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_PAYDOCK_PAYMENT_TYPE, paymentMethod));
    }
    if (paydockStatus) {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_PAYDOCK_PAYMENT_STATUS, paydockStatus));
    }
    if (paydockTransactionId) {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_PAYDOCK_TRANSACTION_ID, paydockTransactionId));
    }

    if (commerceToolsUserId) {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_COMMERCE_TOOLS_USER, commerceToolsUserId));
    }

    if (additionalInfo) {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_ADDITIONAL_INFORMATION, JSON.stringify(additionalInfo)));
    }
    const paymentExtensionRequest = JSON.parse(paymentObject.custom.fields.PaymentExtensionRequest)
    const makePaymentRequestObj = paymentExtensionRequest?.request
    const updatePaymentAction = getPaymentKeyUpdateAction(paymentObject.key, makePaymentRequestObj, response);
    if (updatePaymentAction) actions.push(updatePaymentAction);

    const addTransactionAction = createAddTransactionActionByResponse(paymentObject.amountPlanned.centAmount, paymentObject.amountPlanned.currencyCode, response);
    if (addTransactionAction) actions.push(addTransactionAction);

    return actions;
}

function getCommercetoolsStatusesByPaydockStatus(paydockStatus) {
    let orderPaymentState
    let orderState

    switch (paydockStatus) {
        case c.STATUS_TYPES.PAID:
        case c.STATUS_TYPES.P_PAID:
        case c.STATUS_TYPES.REFUNDED:
        case c.STATUS_TYPES.P_REFUND:
            orderPaymentState = 'Paid'
            orderState = 'Complete'
            break
        case c.STATUS_TYPES.AUTHORIZE:
            orderPaymentState = 'Paid'
            orderState = 'Open'
            break
        case c.STATUS_TYPES.CANCELLED:
            orderPaymentState = 'Paid'
            orderState = 'Cancelled'
            break
        case c.STATUS_TYPES.FAILED:
            orderPaymentState = 'Failed'
            orderState = 'Cancelled'
            break
        default:
            orderPaymentState = 'Pending'
            orderState = 'Open'
    }

    return {orderState, orderPaymentState}
}

async function deleteCustomFields(actions, paymentObject, customFieldsToDelete) {
    const customFields = paymentObject?.custom?.fields;
    if (customFields) {
        customFieldsToDelete.forEach(field => {
            if (typeof customFields[field] !== 'undefined' && customFields[field]) {
                actions.push(deleteCustomFieldAction(field));
            }
        });
    }
    return actions
}

export default {execute}
