import { NestPayData } from "./types"

export const HASH_ALGORITHM = "ver3"
export const REFRESH_TIME = "3"
export const STORE_TYPE = "3D_PAY_HOSTING"

export const getSessionContext = (data: NestPayData) => {
  const randomString = Math.random().toString(36).substring(7)

  // The order matters here. The fields need to be sorted alphabetically in ver3. Store key is added in the BE
  const hashContent = [
    data.orderTotal,
    data.clientId,
    data.currencyCode.toString(),
    data.failUrl,
    HASH_ALGORITHM,
    data.language,
    data.cartId,
    data.okUrl,
    REFRESH_TIME,
    randomString,
    STORE_TYPE,
    data.transactionType,
  ].join("|")

  return {
    hashContent,
    randomString,
  }
}
