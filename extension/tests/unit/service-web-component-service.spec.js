import { expect, jest } from '@jest/globals';
import { callPaydock, createCharge, makePayment, updatePaydockStatus, createVaultToken, getVaultToken } from '../../src/service/web-component-service.js';
import config from '../../src/config/config.js';
import httpUtils from '../../src/utils.js';
import ctp from '../../src/ctp.js';

jest.mock('../../src/config/config-loader.js', () => {
    const originalModule = jest.requireActual('../../src/config/config-loader.js');
    const loaderConfigResult = jest.requireActual('../../test-data/extentionConfig.json');

    return {
        __esModule: true,
        ...originalModule,
        loadConfig: jest.fn(() => loaderConfigResult),
    };
});

jest.mock('../../src/config/config.js');
jest.mock('../../src/utils.js');
jest.mock('../../src/ctp.js', () => ({
    get: jest.fn()
}));

jest.mock('../../src/utils/custom-objects-utils.js');
jest.mock('../../src/service/web-component-service.js', () => {
    const originalModule = jest.requireActual('../../src/service/web-component-service.js');
    return {
        ...originalModule,
        createCharge: jest.fn(),
        callPaydock: jest.fn(),
        createVaultToken: jest.fn(),
        getVaultToken: jest.fn(),
    };
});

describe('Unit::web-component-service.js', () => {
    let makePaymentRequestObj;
    let mockCtpClient;

    beforeEach(() => {
        jest.clearAllMocks();

        // Set up the mock for ctpClient and its methods
        mockCtpClient = {
            fetchByKey: jest.fn(),
            update: jest.fn()
        };

        ctp.get.mockResolvedValue(mockCtpClient);

        makePaymentRequestObj = {
            orderId: 'order-123',
            PaydockTransactionId: 'charge-123',
            PaydockPaymentType: 'card',
            amount: { value: 10000, currency: 'AUD' },
            VaultToken: '',
            CommerceToolsUserId: 'user-123',
            SaveCard: true,
            AdditionalInfo: {
                address_country: "AF",
                address_city: "Woodland Hills",
                address_line: "21051 Warner Center Lane",
                address_line2: "20А",
                address_postcode: "91367",
                billing_first_name: "Yaroslav",
                billing_last_name: "Fedyna",
                billing_email: "sfedynadev@gmail.com",
                billing_phone: "+38093535352",
                BillingInformation: {
                    name: "Yaroslav Fedyna",
                    address: "Woodland Hills, 21051 Warner Center Lane 20А"
                },
                ShippingInformation: {
                    "name": "Yaroslav Fedyna",
                    "address": "Woodland Hills, 21051 Warner Center Lane 20А"
                },
                order_id: "1888cfa6-4f30-48ca-9d81-eae595630a5d",
                charge_id: "4aab0d9e-dcd8-4099-9cbb-2223c5d05bf3"
            }
        };

        config.getPaydockConfig.mockResolvedValue({
            status: 'Failure',
            message: 'Charge creation failed',
            error: { message: 'Charge creation failed' }
        });

        httpUtils.addPaydockLog.mockResolvedValue({});
    });

    test('should handle a successful card payment and return correct response', async () => {
        createVaultToken.mockResolvedValue({ status: 'Success', token: 'vault-token-123', error: null });
        createCharge.mockResolvedValue({ status: 'Success', paydockStatus: 'paid', chargeId: 'charge-456', error: null });
        mockCtpClient.fetchByKey.mockResolvedValue({ body: { version: 1 } });
        mockCtpClient.update.mockResolvedValue({ statusCode: 200 });

        const response = await makePayment(makePaymentRequestObj);
        expect(response.status).toBe('Success');
        expect(response.chargeId).toBe('charge-456');
        expect(httpUtils.addPaydockLog).toHaveBeenCalledTimes(1);
    });

/*test('should handle failure in vault token creation', async () => {
    createVaultToken.mockResolvedValue({ status: 'Failure', message: 'Vault token creation failed', error: null });
    mockCtpClient.fetchByKey.mockResolvedValue({ body: { version: 1 } });
    mockCtpClient.update.mockResolvedValue({ statusCode: 200 });

    const response = await makePayment(makePaymentRequestObj);

    expect(response.status).toBe('Failure');
    expect(response.message).toBe('Vault token creation failed');
});

test('should handle a payment with existing vault token', async () => {
    makePaymentRequestObj.VaultToken = 'existing-vault-token';
    createCharge.mockResolvedValue({ status: 'Success', paydockStatus: 'paid', chargeId: 'charge-789', error: null });
    mockCtpClient.fetchByKey.mockResolvedValue({ body: { version: 1 } });
    mockCtpClient.update.mockResolvedValue({ statusCode: 200 });

    const response = await makePayment(makePaymentRequestObj);

    expect(createVaultToken).not.toHaveBeenCalled();
    expect(createCharge).toHaveBeenCalledWith(expect.objectContaining({
        vaultToken: 'existing-vault-token'
    }), expect.anything());
    expect(response.chargeId).toBe('charge-789');
});
});

describe('Unit::web-component-service.js - updatePaydockStatus', () => {
beforeEach(() => {
    jest.clearAllMocks();
});

test('should update Paydock status successfully', async () => {
    callPaydock.mockResolvedValue({
        response: { status: 200, resource: { data: { _id: 'charge-123' } }, error: null }
    });

    const response = await updatePaydockStatus('/v1/charges/charge-123/capture', 'post', {});

    expect(response.status).toBe('Success');
    expect(response.chargeId).toBe('charge-123');
});

test('should handle failure when updating Paydock status', async () => {
    callPaydock.mockResolvedValue({
        response: { status: 400, error: { message: 'Failed to update' } }
    });

    const response = await updatePaydockStatus('/v1/charges/charge-123/capture', 'post', {});

    expect(response.status).toBe('Failure');
    expect(response.message).toBe('Failed to update');
});
});

describe('Unit::web-component-service.js - getVaultToken', () => {
beforeEach(() => {
    jest.clearAllMocks();
});

test('should retrieve vault token successfully', async () => {
    createVaultToken.mockResolvedValue({
        status: 'Success',
        token: 'vault-token-123',
        error: null
    });

    const result = await getVaultToken({
        data: { token: 'charge-123' },
        userId: 'user-123',
        saveCard: true,
        type: 'card'
    });

    expect(result.status).toBe('Success');
    expect(result.token).toBe('vault-token-123');
});

test('should handle failure during vault token retrieval', async () => {
    createVaultToken.mockResolvedValue({
        status: 'Failure',
        message: 'Vault token retrieval failed',
        error: null
    });

    const result = await getVaultToken({
        data: { token: 'charge-123' },
        userId: 'user-123',
        saveCard: true,
        type: 'card'
    });

    expect(result.status).toBe('Failure');
    expect(result.message).toBe('Vault token retrieval failed');
});
});

describe('Unit::web-component-service.js - createVaultToken', () => {
beforeEach(() => {
    jest.clearAllMocks();
});

test('should create vault token successfully', async () => {
    callPaydock.mockResolvedValue({
        response: { status: 201, resource: { data: { vault_token: 'vault-token-123' } }, error: null }
    });

    const result = await createVaultToken({
        data: { token: 'charge-123' },
        userId: 'user-123',
        saveCard: true,
        type: 'card',
        configurations: {}
    });

    expect(result.status).toBe('Success');
    expect(result.token).toBe('vault-token-123');
});

test('should handle failure during vault token creation', async () => {
    callPaydock.mockResolvedValue({
        response: { status: 400, error: { message: 'Vault token creation failed' } }
    });

    const result = await createVaultToken({
        data: { token: 'charge-123' },
        userId: 'user-123',
        saveCard: true,
        type: 'card',
        configurations: {}
    });

    expect(result.status).toBe('Failure');
    expect(result.message).toBe('Vault token creation failed');
});
*/
});