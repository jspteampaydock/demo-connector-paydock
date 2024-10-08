import {
  isValidMetadata,
} from '../paymentHandler/payment-utils.js'
import errorMessages from './error-messages.js'
import {
  hasValidAuthorizationHeader,
} from './authentication.js'

function withPayment(paymentObject) {
  const errors = {}

  return {
    validateMetadataFields() {
      if (!paymentObject.custom) return this
      if (!isValidMetadata(paymentObject.custom.fields.commercetoolsProjectKey) && !isValidMetadata(paymentObject.custom.fields.CommercetoolsProjectKey))
        errors.missingRequiredCtpProjectKey =
            errorMessages.MISSING_REQUIRED_FIELDS_CTP_PROJECT_KEY
      return this
    },
    validateAuthorizationHeader(authToken) {
      if (!hasValidAuthorizationHeader(authToken)) {
        errors.unauthorizedRequest = errorMessages.UNAUTHORIZED_REQUEST
      }
      return this
    },
    hasErrors() {
      return Object.keys(errors).length > 0
    },
    getErrors() {
      return Object.entries(errors).map(([, value]) => ({
        code: _getErrorResponseCode(value),
        message: value,
      }))
    },
  }
}

function _getErrorResponseCode(value) {
  if (
      value === errorMessages.UNAUTHORIZED_REQUEST ||
      value === errorMessages.MISSING_CREDENTIAL
  )
    return 'Unauthorized'
  return 'InvalidField'
}

export { withPayment }
