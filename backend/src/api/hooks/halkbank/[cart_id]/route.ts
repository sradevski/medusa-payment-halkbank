import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { HttpTypes, WebhookActionResult } from "@medusajs/types";
import {
  ContainerRegistrationKeys,
  Modules,
  PaymentActions,
} from "@medusajs/framework/utils";
import { processPaymentWorkflow } from "@medusajs/core-flows";

const getPage = (data: any) => {
  // Since the `origin` field can only be set to one domain, we need to perform a handshake procedure to ensure the source of the data.
  return `
	<html>
	<script>
		(function () {
			const receiveMessage = (event) => {
				if (event.data && event.data.type === 'handshake_end') {
					const hostMatch = event.origin.match(new RegExp('https://([^:/]+)([:/]*)(.*)$'))
          const host = hostMatch && hostMatch[1];
          window.parent.postMessage(${JSON.stringify({
            type: "data",
            data,
          })}, '*');
				}
			}
			window.addEventListener("message", receiveMessage, false);
			window.parent.postMessage(${JSON.stringify({ type: "handshake_start" })}, "*");
		})()
	</script>
	</html>
	`;
};

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const paymentService = req.scope.resolve(Modules.PAYMENT);
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const cart = (
    await query.graph({
      entity: "cart",
      fields: [
        "id",
        "payment_collection.id",
        "payment_collection.amount",
        "payment_collection.payment_sessions.*",
      ],
      filters: {
        id: req.params.cart_id,
      },
    })
  ).data[0] as any as HttpTypes.StoreCart | undefined;

  if (!cart) {
    return res.end(getPage({ error: "Cart not found" }));
  }

  if (!cart.payment_collection?.payment_sessions?.length) {
    return res.end(getPage({ error: "No payment sessions found" }));
  }

  try {
    const processedEvent: WebhookActionResult & { errorMessage?: string } =
      await paymentService.getWebhookActionAndData({
        provider: "halkbank_halkbank",
        payload: {
          data: req.body as Record<string, unknown>,
          rawData: req.rawBody as string,
          headers: req.headers,
        },
      });

    if (processedEvent?.action === PaymentActions.FAILED) {
      res.end(getPage({ error: processedEvent.errorMessage }));
    }

    if (!processedEvent.data) {
      return res.end(
        getPage({ error: "No data found after processing the webhook" })
      );
    }

    // We don't get the session ID in the webhook, only the cart ID. We ensure the session ID is set here.
    // We don't support split payments yet, so there is an assumption that there is only one payment session.
    const pendingSessionId = cart.payment_collection.payment_sessions?.find(
      (session) => session.status === "pending"
    )?.id;

    if (!pendingSessionId) {
      return res.end(getPage({ error: "No pending payment session found" }));
    }

    processedEvent.data.session_id = pendingSessionId;

    await processPaymentWorkflow(req.scope).run({
      input: processedEvent,
    });

    res.end(getPage({ data: processedEvent.data }));
  } catch (err) {
    logger.error(err);
    res.end(getPage({ error: err.message }));
  }
};
