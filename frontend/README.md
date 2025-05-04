# Halkbank Payment Plugin for MedusaJS

This plugin is a payment plugin for MedusaJS that allows you to accept payments from Halkbank MK. Halkbank uses Nestpay as a payment gateway, so the plugin can likely be adjusted to work with other banks that rely on Nestpay.

See [Halkbank Payment Plugin for MedusaJS - Backend](https://www.npmjs.com/package/@sradevski/medusa-payment-halkbank) for the backend plugin.

## Installation

**Install the frontend component:**

- `npm i @sradevski/medusa-payment-halkbank-react`
- `yarn add @sradevski/medusa-payment-halkbank-react`
- `pnpm install @sradevski/medusa-payment-halkbank-react`

**Import the HalkbankPayment component from the package:**

```
import { HalkbankPayment } from "@sradevski/medusa-payment-halkbank-react"
```

**Render the HalkbankPayment component:**

```
<HalkbankPayment
    cart={cart}
    clientId={process.env.NEXT_PUBLIC_HALKBANK_CLIENT_ID!}
    callbackUrl={`${process.env.NEXT_PUBLIC_HALKBANK_CALLBACK_URL}/${cart.id}`}
    language="mk"
    providerId="pp_halkbank_halkbank"
    initiatePaymentSession={(data) => initiatePaymentSession(cart, data)}
    onPaymentResponse={(resp) => {
        if (resp.error) {
            setError(resp.error)
        } else {
            finalizeCompletedCart(cart)
        }
    }}
    spinner={<Spinner />}
/>
```

**Initiating a payment session using the SDK:**

```
export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: {
    provider_id: string
    data: Record<string, unknown>
  }
) {
  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, await getAuthHeaders())
    .then((resp) => {
      return resp
    })
    .catch(medusaError)
}
```

**The environment variables you need to set will look like this:**

```
NEXT_PUBLIC_HALKBANK_CLIENT_ID=1234567890 // Information you got from Halkbank
NEXT_PUBLIC_HALKBANK_CALLBACK_URL=https://your-domain.com/hooks/halkbank
```

> Don't initiate a payment session early when using halkbank - Only render the HalkbankPayment component once the customer has selected as a payment method. Every time some of the cart data changes, a new session needs to be created, and the old one canceled.
