import {
  AbstractPaymentProvider,
  MedusaError,
  PaymentSessionStatus,
} from "@medusajs/utils";

import { PaymentActions } from "@medusajs/framework/utils";

import {
  MedusaContainer,
  ProviderWebhookPayload,
  WebhookActionResult,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  GetPaymentStatusOutput,
  GetPaymentStatusInput,
} from "@medusajs/types";

import { calculateHash, getField, getStatus, hashValidator } from "./nestpay";

interface HalkbankConfiguration {
  clientId: string;
  clientKey: string;
}

export class HalkbankService extends AbstractPaymentProvider<HalkbankConfiguration> {
  static identifier = "halkbank";
  static PROVIDER = "halkbank";
  protected readonly options: HalkbankConfiguration;

  constructor(container: MedusaContainer, options: HalkbankConfiguration) {
    super(container, options);
    this.options = options;
  }

  initiatePayment(
    context: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const hash = context.data?.hash as string | undefined;
    if (!hash) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No hash provided when initializing session"
      );
    }

    const calculatedHash = calculateHash(this.options.clientKey, hash);
    return Promise.resolve({
      id: "",
      data: { hash: calculatedHash },
    });
  }

  capturePayment(context: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return Promise.resolve({});
  }

  authorizePayment(
    context: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    return Promise.resolve({
      status: PaymentSessionStatus.AUTHORIZED,
      data: {},
    });
  }

  updatePayment(context: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return Promise.resolve({ data: {} });
  }
  cancelPayment(context: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return Promise.resolve({});
  }
  deletePayment(context: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return Promise.resolve({});
  }
  refundPayment(context: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return Promise.resolve({});
  }

  retrievePayment(
    context: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    throw new Error("Now implemented");
  }

  getPaymentStatus(
    context: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    throw new Error("Now implemented");
  }

  getWebhookActionAndData(
    data: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult & { errorMessage?: string }> {
    const isHashValid = hashValidator(this.options.clientKey, data.data);
    const cartId = getField("oid", data.data).value;
    const amount = getField("amount", data.data).value;
    const errorMessage = getField("ErrMsg", data.data).value;

    if (!isHashValid && process.env.SKIP_HASH_VALIDATION !== "true") {
      console.warn(
        `Payment hash validation failed for cart: ${cartId} with amount: ${amount}`
      );

      return Promise.resolve({
        action: PaymentActions.FAILED,
      });
    }

    const status = getStatus(data.data);
    if (status === "FAILED") {
      return Promise.resolve({
        action: PaymentActions.FAILED,
        errorMessage: `Payment failed for cart: ${cartId} with amount: ${amount}. Error: ${errorMessage}`,
      });
    }

    return Promise.resolve({
      action: PaymentActions.AUTHORIZED,
      data: {
        session_id: cartId,
        amount: amount,
      },
    });
  }
}
