import React from "react";
import { FrameMessageExchange } from "./frame-message-exchange";
import { PaymentForm } from "./payment-form";
import { CartInfo, PaymentCollection } from "./types";

// Note: Entrypoint to halk payment form. Can be published as a package
export const HalkbankPayment = ({
  cart,
  language,
  providerId,
  clientId,
  callbackUrl,
  spinner,
  initiatePaymentSession,
  onPaymentResponse,
}: {
  cart: CartInfo;
  language: string;
  providerId: string;
  clientId: string;
  callbackUrl: string;
  spinner: React.ReactNode;
  initiatePaymentSession: (body: {
    provider_id: string;
    data: {
      hash: string;
    };
  }) => Promise<{
    payment_collection: PaymentCollection;
  }>;
  onPaymentResponse?: (response: { error?: any; data?: any }) => void;
}) => {
  const frameName = "paymentFrame";
  const [isLoadingFrame, setIsLoadingFrame] = React.useState(true);
  const [paymentResponse, setPaymentResponse] = React.useState<
    | {
        error?: any;
        data?: any;
      }
    | undefined
  >();

  if (!cart || paymentResponse) {
    return null;
  }

  return (
    <>
      <PaymentForm
        target={frameName}
        cart={cart}
        language={language}
        providerId={providerId}
        clientId={clientId}
        callbackUrl={callbackUrl}
        initiatePaymentSession={initiatePaymentSession}
      />

      {isLoadingFrame && spinner}
      <FrameMessageExchange
        frameName={frameName}
        onLoad={() => setIsLoadingFrame(false)}
        onResponse={(resp) => {
          setPaymentResponse(resp);
          onPaymentResponse?.(resp);
        }}
      />
    </>
  );
};
