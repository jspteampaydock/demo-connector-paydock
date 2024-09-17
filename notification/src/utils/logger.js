import loggers from '@commercetools-backend/loggers';
import config from '../config/config.js';

const {createApplicationLogger} = loggers;

let loggerInstance;
let logActions = [];

function getLogger() {
    if (!loggerInstance) {
        loggerInstance = createApplicationLogger({
            name: 'ctp-paydock-integration-notifications',
            level: config.getModuleConfig()?.logLevel || 'info',
        });
    }
    return loggerInstance;
}

function addPaydockLog(data) {
    const date = new Date();

    logActions.push({
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
    })
}

function getLogActions(){
    return logActions;
}

export {getLogger, addPaydockLog, getLogActions};
