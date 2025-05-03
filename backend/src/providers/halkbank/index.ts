import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import { HalkbankService } from "./payment-halkbank";

const services = [HalkbankService];

export default ModuleProvider(Modules.PAYMENT, {
  services,
});
