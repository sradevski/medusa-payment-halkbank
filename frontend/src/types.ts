export interface NestPayData {
  clientId: string
  cartId: string
  orderTotal: string
  currencyCode: number
  language: string
  okUrl: string
  failUrl: string
  transactionType: "Auth"
}

export interface PaymentSession {
  provider_id: string
  status: string
  data?: {
    hash?: string
  }
}

export interface PaymentCollection {
  payment_sessions?: PaymentSession[] | undefined
}

export interface CartInfo {
  id: string
  currency_code: string
  total: number
  payment_collection?: {
    payment_sessions?: PaymentSession[]
  }
}
