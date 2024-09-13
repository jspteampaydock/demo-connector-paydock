import loggers from '@commercetools-backend/loggers';
import config from '../config/config.js';

const {createApplicationLogger} = loggers;

let loggerInstance;

function getLogger() {
    if (!loggerInstance) {
        loggerInstance = createApplicationLogger({
            name: 'ctp-paydock-integration-notifications',
            level: config.getModuleConfig()?.logLevel || 'info',
        });
    }
    return loggerInstance;
}

async function addPaydockLog(paymentId, version, data) {
    const date = new Date();

    const updateActions = [
        {
            "action": "addInterfaceInteraction",
            "type": {
                "key": "paydock-payment-log-interaction"
            },
            "fields": {
                "createdAt": date.toISOString(),
                "chargeId": data.chargeId,
                "operation": data.operation,
                "status": data.status,
                "message": data.message
            }
        }
    ];

    const ctpClient = await config.getCtpClient();
    const result = await ctpClient.update(
        ctpClient.builder.payments,
        paymentId.id,
        version,
        updateActions
    );

    return result?.body?.version;
}

export {getLogger, addPaydockLog};
