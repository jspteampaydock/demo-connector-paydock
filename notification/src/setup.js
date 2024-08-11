import {serializeError} from "serialize-error";
import config from './config/config.js'

async function setupNotificationResources() {
    try {
        const moduleConfig = config.getModuleConfig()
        const ctpClient = await config.getCtpClient()
        if (moduleConfig.apiNotificationnBaseUrl) {
            await createCustomObjectNotificationUrl(ctpClient, moduleConfig.apiNotificationnBaseUrl)
        }
    } catch (error) {
        throw Error(`Error: ${JSON.stringify(serializeError(error))}`)
    }
}


async function createCustomObjectNotificationUrl(ctpClient, notificationUrl) {

    const objectNotificationUrlDraft = {
        container: "paydock-notification",
        key: "url",
        value: notificationUrl
    };
    try {
        return await ctpClient.create(ctpClient.builder.customObjects, objectNotificationUrlDraft);
    } catch (error) {
        throw Error(`Error: ${JSON.stringify(serializeError(error))}`)
    }
}

export {
    setupNotificationResources
}


