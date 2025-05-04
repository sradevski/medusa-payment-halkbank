import React, { useEffect, useState } from "react"
import { NestPay } from "./nest-pay"
import { getSessionContext } from "./session-context"
import { CartInfo, PaymentCollection, PaymentSession } from "./types"

//ISO 4217 currency codes
const currencyIds = {
  mkd: 807,
  eur: 978,
  usd: 840,
}

const TRANSACTION_TYPE = "Auth" as const

const PAYMENT_ENDPOINT = "https://epay.halkbank.mk/fim/est3Dgate"

interface PaymentFormProps {
  cart: CartInfo
  target: string
  language: string
  providerId: string
  clientId: string
  callbackUrl: string
  initiatePaymentSession: (body: {
    provider_id: string
    data: {
      hash: string
    }
  }) => Promise<{
    payment_collection: PaymentCollection
  }>
}
const getHash = async (
  cart: CartInfo,
  providerId: string,
  hashContent: string,
  initiatePaymentSession: (body: {
    provider_id: string
    data: {
      hash: string
    }
  }) => Promise<{
    payment_collection: PaymentCollection
  }>
) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: PaymentSession) =>
      paymentSession.provider_id === providerId &&
      paymentSession.status === "pending"
  )

  if (activeSession) {
    return activeSession?.data?.hash as string
  }

  const res = await initiatePaymentSession({
    provider_id: providerId,
    data: {
      hash: hashContent,
    },
  })

  return (
    (res.payment_collection?.payment_sessions?.[0]?.data?.hash as string) ?? ""
  )
}

export const PaymentForm = ({
  target,
  cart,
  language,
  providerId,
  clientId,
  callbackUrl,
  initiatePaymentSession,
}: PaymentFormProps) => {
  // If rendered on the server, it's fine for this to be an empty string.
  // const paymentCallback = window
  //   ? `${window.location.protocol}//${window.location.hostname}/api/paymentResponse`
  //   : ""

  const data = {
    clientId: clientId ?? "",
    cartId: cart.id,
    orderTotal: Math.round(cart.total).toString(),
    currencyCode: currencyIds[cart.currency_code as keyof typeof currencyIds],
    transactionType: TRANSACTION_TYPE,
    language: language,
    // We have to make the request to a sameorigin URL, otherwise it won't display it in the iframe.
    okUrl: callbackUrl,
    failUrl: callbackUrl,
  }

  const [sessionContext] = useState(getSessionContext(data))
  const [hash, setHash] = useState("")
  useEffect(() => {
    getHash(
      cart,
      providerId,
      sessionContext.hashContent,
      initiatePaymentSession
    ).then((res) => {
      setHash(res)
    })
  }, [cart, providerId, sessionContext.hashContent])

  return (
    <NestPay
      target={target}
      nestpayEndpoint={PAYMENT_ENDPOINT}
      data={data}
      hash={hash}
      randomString={sessionContext.randomString}
    />
  )
}
