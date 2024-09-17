import {
    createSetCustomFieldAction
} from './payment-utils.js'
import c from '../config/constants.js'
import {createStandalone3dsToken} from '../service/web-component-service.js'

async function execute(paymentObject) {
    const paymentExtensionRequest = JSON.parse(paymentObject.custom.fields.PaymentExtensionRequest)
    const response = await createStandalone3dsToken(paymentExtensionRequest?.request)
    if (response.status === 'Failure') {
        return {
            actions: [
                {
                    action: c.CTP_INTERACTION_PAYMENT_EXTENSION_REQUEST,
                    transactionId: paymentExtensionRequest.transactionId,
                    state: "Failure"
                }
            ]
        };
    }

    const actions = []

    actions.push(createSetCustomFieldAction(c.CTP_INTERACTION_PAYMENT_EXTENSION_RESPONSE, response));
    return {
        actions,
    }
}

export default {execute}
