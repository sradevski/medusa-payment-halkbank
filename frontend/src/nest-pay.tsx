import React, { useState, useEffect, useRef } from "react"
import { HASH_ALGORITHM, REFRESH_TIME, STORE_TYPE } from "./session-context"
import { NestPayData } from "./types"

interface NestPayProps {
  target: string
  data: NestPayData
  nestpayEndpoint: string
  hash: string
  randomString: string
}

// Nestpay is used by Halkbank
export const NestPay = ({
  target,
  data,
  nestpayEndpoint,
  hash,
  randomString,
}: NestPayProps) => {
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const submitButtonRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (hasSubmitted) {
      return
    }

    if (hash && submitButtonRef.current) {
      submitButtonRef.current?.click?.()
      setHasSubmitted(true)
    }
  }, [hash, hasSubmitted, submitButtonRef])

  return (
    <form method="post" action={nestpayEndpoint} target={target}>
      <input type="hidden" name="clientid" value={data.clientId} />
      <input type="hidden" name="oid" value={data.cartId} />
      <input type="hidden" name="amount" value={data.orderTotal} />
      <input
        type="hidden"
        name="currency"
        value={data.currencyCode.toString()}
      />
      <input type="hidden" name="TranType" value={data.transactionType} />
      <input type="hidden" name="okUrl" value={data.okUrl} />
      <input type="hidden" name="failUrl" value={data.failUrl} />
      {/* If we pass callbackUrl there is an error, it seems you can use it only if the bank allows you too. */}
      {/* <input type='hidden' name='callbackUrl' value={data.callbackUrl} /> */}
      <input type="hidden" name="lang" value={data.language} />
      <input type="hidden" name="refreshtime" value={REFRESH_TIME} />
      <input type="hidden" name="encoding" value="utf-8" />
      <input type="hidden" name="hashAlgorithm" value={HASH_ALGORITHM} />
      <input type="hidden" name="storetype" value={STORE_TYPE} />
      <input type="hidden" name="rnd" value={randomString} />
      <input type="hidden" name="hash" value={hash} />

      <input style={{ display: "none" }} ref={submitButtonRef} type="submit" />
    </form>
  )
}
