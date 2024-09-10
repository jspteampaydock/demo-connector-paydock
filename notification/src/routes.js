import { handleNotification } from './api/notification/notification.controller.js'

const routes = {
  '/notification': handleNotification
}

export { routes }
