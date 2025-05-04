# Halkbank Payment Plugin for MedusaJS

This plugin is a payment plugin for MedusaJS that allows you to accept payments from Halkbank MK. Halkbank uses Nestpay as a payment gateway, so the plugin can likely be adjusted to work with other banks that rely on Nestpay.

See [Halkbank Payment Plugin for MedusaJS - Frontend](https://www.npmjs.com/package/@sradevski/medusa-payment-halkbank-react) for the frontend component.

## Installation

> The plugin expects that the payment and cart module are available in the project.

**Install the plugin:**

- `npm i @sradevski/medusa-payment-halkbank`
- `yarn add @sradevski/medusa-payment-halkbank`
- `pnpm install @sradevski/medusa-payment-halkbank`

**Add the plugin to your Medusa project:**

```
  plugins: [
    {
      resolve: "@sradevski/medusa-payment-halkbank",
      options: {}
    },
  ]
```

**Add the Halkbank provider to payment module:**

```ts
  {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@sradevski/medusa-payment-halkbank/providers/halkbank",
            id: "halkbank",
            name: "Halkbank",
            options: {
              clientId: process.env.HALKBANK_CLIENT_ID,
              clientKey: process.env.HALKBANK_CLIENT_KEY,
            },
          },
        ],
      },
    },
```

The backend is ready to accept calls from the frontend component.
