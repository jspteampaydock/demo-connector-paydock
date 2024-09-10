import paymentController from './api/payment/payment.controller.js'
import orderController from './api/order/order.controller.js'

const routes = {
  '/extension': paymentController.processRequest,
  '/extension/create-order': orderController.processRequest,
}

export { routes }
