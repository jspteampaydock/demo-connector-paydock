# Paydock Payment Connector for commercetools

## Overview

The Paydock Payment Connector enables seamless integration between your commercetools platform and Paydock, improving your payment management processes. This repository contains three primary modules:

![Live Connection](docs/paydock-connector.png)

### Modules

1. **Extension Module**  
   Acts as middleware to connect commercetools with Paydock. It triggers on payment creation and updates within commercetools to ensure efficient event handling by Paydock.
    - [Integration Guide](extension/docs/IntegrationGuide.md): Steps to integrate this module with commercetools.
    - [How to Run](extension/docs/HowToRun.md): Instructions for deploying and running the extension module.

2. **Merchant Center Custom Application**  
   This application allows you to configure both live and sandbox connections to Paydock. Additionally, you can view logs and orders processed through Paydock.
    - [Integration Guide](merchant-center-custom-application/docs/IntegrationGuide.md): Information on integrating this custom application with commercetools.
    - [How to Run](merchant-center-custom-application/docs/HowToRun.md): Instructions for deploying and running the merchant center custom application.

3. **Notification Module**  
   Handles asynchronous notifications from Paydock about payment status changes (e.g., authorization, charge, refund). It updates the corresponding payment status in commercetools.
    - [Integration Guide](notification/docs/IntegrationGuide.md): Information on integrating this module with commercetools.
    - [How to Run](notification/docs/HowToRun.md): Instructions for deploying and running the notification module.

> **Important**: Both the Extension and Notification modules are required to fully integrate your commercetools setup with Paydock.

---

## Environment Variables

This connector consists of three main components, each with its own set of environment variables:

### Merchant Center Custom Application

#### Standard Configuration Variables

| Variable                | Description                          | Required | Default           | Example                              |
|-------------------------|--------------------------------------|----------|-------------------|--------------------------------------|
| `CUSTOM_APPLICATION_ID`  | The Custom Application ID            | Yes      | N/A               | `CUSTOM_APPLICATION_ID=my-app-id`   |
| `CLOUD_IDENTIFIER`       | The cloud identifier                 | No       | `gcp-eu`          | `CLOUD_IDENTIFIER=gcp-eu`            |
| `ENTRY_POINT_URI_PATH`   | The application entry point URI path | Yes      | N/A               | `ENTRY_POINT_URI_PATH=/my-app`       |
| `APP_REGION`             | The commercetools region             | Yes      | `europe-west1.gcp`| `APP_REGION=europe-west1.gcp`        |
| `APP_PROJECT_KEY`        | The commercetools project key        | Yes      | N/A               | `APP_PROJECT_KEY=my-project-key`     |

#### Secured Configuration Variables

| Variable              | Description                        | Required | Example                        |
|-----------------------|------------------------------------|----------|--------------------------------|
| `APP_CLIENT_ID`        | The commercetools client ID        | Yes      | `APP_CLIENT_ID=my-client-id`   |
| `APP_CLIENT_SECRET`    | The commercetools client secret    | Yes      | `APP_CLIENT_SECRET=my-secret`  |

---

### Extension Service

#### Standard Configuration Variables

| Variable                 | Description                   | Required | Default                                    | Example                                   |
|--------------------------|-------------------------------|----------|--------------------------------------------|-------------------------------------------|
| `COMMERCETOOLS_PROJECT_KEY` | The commercetools project key | Yes      | N/A                                        | `COMMERCETOOLS_PROJECT_KEY=my-project-key`|
| `COMMERCETOOLS_API_URL`   | The commercetools API URL     | Yes      | `https://api.europe-west1.gcp.commercetools.com` | `COMMERCETOOLS_API_URL=https://api.commercetools.com` |
| `COMMERCETOOLS_AUTH_URL`  | The commercetools Auth URL    | Yes       | `https://auth.europe-west1.gcp.commercetools.com` | `COMMERCETOOLS_AUTH_URL=https://auth.commercetools.com` |
| `PAYDOCK_API_LIVE_URL`    | Paydock API live URL          | Yes      | N/A                                        | `PAYDOCK_API_LIVE_URL=https://api.paydock.com` |
| `PAYDOCK_API_SANDBOX_URL` | Paydock API sandbox URL       | Yes      | N/A                                        | `PAYDOCK_API_SANDBOX_URL=https://sandbox-api.paydock.com` |

#### Secured Configuration Variables

| Variable                   | Description                        | Required | Example                               |
|----------------------------|------------------------------------|----------|---------------------------------------|
| `COMMERCETOOLS_CLIENT_ID`   | The commercetools client Id        | Yes      | `COMMERCETOOLS_CLIENT_ID=my-client-id`|
| `COMMERCETOOLS_CLIENT_SECRET`| The commercetools client secret    | Yes      | `COMMERCETOOLS_CLIENT_SECRET=my-secret`|

---

### Notification Service

#### Standard Configuration Variables

| Variable                 | Description                   | Required | Default                                    | Example                                   |
|--------------------------|-------------------------------|----------|--------------------------------------------|-------------------------------------------|
| `COMMERCETOOLS_PROJECT_KEY` | The commercetools project key | Yes      | N/A                                        | `COMMERCETOOLS_PROJECT_KEY=my-project-key`|
| `COMMERCETOOLS_API_URL`   | The commercetools API URL     | Yes      | `https://api.europe-west1.gcp.commercetools.com` | `COMMERCETOOLS_API_URL=https://api.commercetools.com` |
| `COMMERCETOOLS_AUTH_URL`  | The commercetools Auth URL    | Yes      | `https://auth.europe-west1.gcp.commercetools.com` | `COMMERCETOOLS_AUTH_URL=https://auth.commercetools.com` |
| `PAYDOCK_API_LIVE_URL`    | Paydock API live URL          | Yes      | N/A                                        | `PAYDOCK_API_LIVE_URL=https://api.paydock.com` |
| `PAYDOCK_API_SANDBOX_URL` | Paydock API sandbox URL       | Yes      | N/A                                        | `PAYDOCK_API_SANDBOX_URL=https://sandbox-api.paydock.com` |

#### Secured Configuration Variables

| Variable                   | Description                        | Required | Example                               |
|----------------------------|------------------------------------|----------|---------------------------------------|
| `COMMERCETOOLS_CLIENT_ID`   | The commercetools client ID        | Yes      | `COMMERCETOOLS_CLIENT_ID=my-client-id`|
| `COMMERCETOOLS_CLIENT_SECRET`| The commercetools client secret    | Yes      | `COMMERCETOOLS_CLIENT_SECRET=my-secret`|


## Additional Resources

- [Paydock Commercetools Widget](https://github.com/PayDock/e-commerce-commercetools-npm)
- [Official Paydock Website](https://paydock.com/)

---

## Contribution

We encourage contributions! Please refer to the [Contribution Guide](docs/Contributing.md) for detailed information on how to contribute and run the modules locally.

---

## License

This project is licensed under the [MIT License](LICENSE).
