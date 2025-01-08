import { Customer, CustomerService, MedusaRequest, MedusaResponse } from '@medusajs/medusa';
import RestockNotificationService from '../../../../services/restock-notification';
import { MedusaError } from 'medusa-core-utils';

interface RestockNotificationPostReq {
  country_code?: string;
  language?: string;
  sales_channel_id?: string;
}

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { variantId } = req.params;

  let customer: Customer | null = null;

  if (req.user && req.user.customer_id) {
    const customerService = req.scope.resolve("customerService") as CustomerService;
    customer = await customerService.retrieve(req.user.customer_id);
  }

  if (!customer) {
    return res.sendStatus(403);
  }

  const restockNotificationService = req.scope.resolve("restockNotificationService") as RestockNotificationService;

  const restockNotification = restockNotificationService.retrieve(variantId, customer.id);

  if (!restockNotification) {
    return res.sendStatus(404);
  }

  return res.json({
    restock_notification: restockNotification
  })
}

export const POST = async (
  req: MedusaRequest<RestockNotificationPostReq> & { publishableApiKeyScopes: any },
  res: MedusaResponse
) => {
  const { variant_id: variantId } = req.params;
  const { country_code, language } = req.body;

  let sales_channel_id = req.body.sales_channel_id

  if (req.publishableApiKeyScopes?.sales_channel_ids.length === 1) {
    sales_channel_id = req.publishableApiKeyScopes.sales_channel_ids[0]
  }

  let customer: Customer | null = null;

  if (req.user && req.user.customer_id) {
    const customerService = req.scope.resolve("customerService") as CustomerService;
    customer = await customerService.retrieve(req.user.customer_id);
  }

  if (!customer) {
    return res.sendStatus(403);
  }

  const restockNotificationService = req.scope.resolve("restockNotificationService") as RestockNotificationService;

  try {
    const restockNotification = await restockNotificationService.create(variantId, customer.id, country_code, language, sales_channel_id);

    return res.json({
      restockNotification
    });
  } catch (e) {
    console.error(e);
    if (e.code === '23505') { // ERROR 23505 = duplicate key value violates unique constraint
      return res.sendStatus(200);
    } else if (e instanceof MedusaError && e.type === MedusaError.Types.NOT_ALLOWED) {
      return res.sendStatus(405);
    } else {
      return res.sendStatus(500);
    }
  }
}
