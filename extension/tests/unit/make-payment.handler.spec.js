import {expect, jest} from '@jest/globals';
import makePaymentHandler from '../../src/paymentHandler/make-payment.handler.js';
import {
    createSetCustomFieldAction,
    createAddTransactionActionByResponse,
    getPaymentKeyUpdateAction,
    deleteCustomFieldAction,
} from '../../src/paymentHandler/payment-utils.js';
import { makePayment } from '../../src/service/web-component-service.js';
import c from '../../src/config/constants.js';

jest.mock('../../src/config/config-loader.js', () => {
    const originalModule = jest.requireActual('../../src/config/config-loader.js');
    const loaderConfigResult = jest.requireActual('../../test-data/extentionConfig.json')

    return {
        __esModule: true,
        ...originalModule,
        loadConfig: jest.fn(() => loaderConfigResult),
    };
});
jest.mock('../../src/service/web-component-service.js');
jest.mock('../../src/paymentHandler/payment-utils.js');

describe('make-payment.handler', () => {
    let paymentObject;

    beforeEach(() => {
        jest.clearAllMocks();

        paymentObject = {
            amountPlanned: {
                centAmount: 10000,
                currencyCode: 'USD',
                type: 'centPrecision',
                fractionDigits: 2,
            },
            custom: {
                fields: {
                    makePaymentRequest: JSON.stringify({
                        PaydockPaymentType: 'card',
                        amount: { value: 10000, currency: 'USD' },
                        CommerceToolsUserId: 'user-123',
                        AdditionalInfo: { extra: 'info' },
                    }),
                },
            },
        };
    });

    test('should handle successful payment and return correct actions', async () => {
        const mockResponse = {
            status: 'Success',
            chargeId: 'charge-123',
            paydockStatus: c.STATUS_TYPES.PAID,
        };

        makePayment.mockResolvedValue(mockResponse);
        createSetCustomFieldAction.mockImplementation((field, value) => ({ action: 'setCustomField', field, value }));
        createAddTransactionActionByResponse.mockReturnValue({ action: 'addTransaction' });
        getPaymentKeyUpdateAction.mockReturnValue({ action: 'setKey' });
        deleteCustomFieldAction.mockReturnValue({ action: 'deleteCustomField' });

        const result = await makePaymentHandler.execute(paymentObject);

        expect(result.actions).toHaveLength(10);
        expect(result.actions).toEqual(expect.arrayContaining([
            expect.objectContaining({ action: 'setCustomField', field: c.CTP_CUSTOM_FIELD_PAYDOCK_PAYMENT_TYPE }),
            expect.objectContaining({ action: 'setCustomField', field: c.CTP_CUSTOM_FIELD_PAYDOCK_PAYMENT_STATUS }),
            expect.objectContaining({ action: 'setCustomField', field: c.CTP_CUSTOM_FIELD_PAYDOCK_TRANSACTION_ID }),
            expect.objectContaining({ action: 'setCustomField', field: 'CapturedAmount', value: 100.00 }),
            expect.objectContaining({ action: 'setKey' }),
            expect.objectContaining({ action: 'addTransaction' }),
            expect.objectContaining({ action: 'deleteCustomField' }),
        ]));
    });

    test('should handle payment failure and return failure actions', async () => {
        const mockResponse = {
            status: 'Failure',
            message: 'Invalid transaction details',
        };

        makePayment.mockResolvedValue(mockResponse);
        createSetCustomFieldAction.mockImplementation((field, value) => ({ action: 'setCustomField', field, value }));
        deleteCustomFieldAction.mockReturnValue({ action: 'deleteCustomField' });

        const result = await makePaymentHandler.execute(paymentObject);

        expect(result.actions).toHaveLength(2);
        expect(result.actions).toEqual(expect.arrayContaining([
            expect.objectContaining({ action: 'setCustomField', field: c.CTP_INTERACTION_PAYMENT_EXTENSION_RESPONSE }),
            expect.objectContaining({ action: 'deleteCustomField' }), // Modify this expectation to match actual received action
        ]));
    });

    test('should correctly calculate captured amount with centPrecision', async () => {
        paymentObject.amountPlanned = {
            centAmount: 10000,
            currencyCode: 'USD',
            type: 'centPrecision',
            fractionDigits: 2,
        };

        const mockResponse = {
            status: 'Success',
            chargeId: 'charge-123',
            paydockStatus: c.STATUS_TYPES.PAID,
        };

        makePayment.mockResolvedValue(mockResponse);
        createSetCustomFieldAction.mockImplementation((field, value) => ({ action: 'setCustomField', field, value }));

        const result = await makePaymentHandler.execute(paymentObject);

        expect(result.actions).toEqual(expect.arrayContaining([
            expect.objectContaining({ action: 'setCustomField', field: 'CapturedAmount', value: 100.00 }),
        ]));
    });

    test('should delete appropriate custom fields after payment', async () => {
        const result = await makePaymentHandler.execute(paymentObject);

        // Перевіряємо, що присутні всі очікувані дії видалення полів
        expect(result.actions).toEqual(expect.arrayContaining([
            expect.objectContaining({ action: 'deleteCustomField', field: 'makePaymentRequest' }),
            expect.objectContaining({ action: 'deleteCustomField', field: 'makePaymentResponse' }),
            expect.objectContaining({ action: 'deleteCustomField', field: 'getVaultTokenRequest' }),
            expect.objectContaining({ action: 'deleteCustomField', field: 'getVaultTokenResponse' }),
            expect.objectContaining({ action: 'deleteCustomField', field: 'PaymentExtensionRequest' }),
        ]));

        // Перевіряємо наявність інших дій, якщо це необхідно
        expect(result.actions).toEqual(expect.arrayContaining([
            expect.objectContaining({ action: 'setCustomField', field: 'PaydockPaymentType' }),
            expect.objectContaining({ action: 'setCustomField', field: 'PaydockPaymentStatus' }),
            expect.objectContaining({ action: 'setCustomField', field: 'PaydockTransactionId' }),
            expect.objectContaining({ action: 'setCustomField', field: 'CommerceToolsUserId' }),
            expect.objectContaining({ action: 'setCustomField', field: 'AdditionalInformation' }),
            expect.objectContaining({ action: 'setKey' }),
            expect.objectContaining({ action: 'addTransaction' }),
            expect.objectContaining({ action: 'setCustomField', field: 'PaymentExtensionResponse' }),
            expect.objectContaining({ action: 'setCustomField', field: 'CapturedAmount' }),
        ]));
    });
});