# Halkbank Payment Plugin for MedusaJS

This plugin is a payment plugin for MedusaJS that allows you to accept payments from Halkbank MK. Halkbank uses Nestpay as a payment gateway, so the plugin can likely be adjusted to work with other banks that rely on Nestpay.

## Installation

The plugin expects that the payment and cart module are available in the project.

1. Install the plugin:

- `npm i @sradevski/medusa-payment-halkbank`
- `yarn add @sradevski/medusa-payment-halkbank`
- `pnpm install @sradevski/medusa-payment-halkbank`

2. Add the plugin to your Medusa project:

```
  plugins: [
    {
      resolve: "@sradevski/medusa-payment-halkbank",
      options: {}
    },
  ]
```

3. Add the Halkbank provider to payment module:

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

## Usage

Once you've set up the plugin, you need to set up the storefront to call the payment webhook as provided by the plugin.

TBD
