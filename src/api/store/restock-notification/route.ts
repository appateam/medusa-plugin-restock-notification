import { Customer, CustomerService, MedusaRequest, MedusaResponse } from '@medusajs/medusa';
import RestockNotificationService from '../../../services/restock-notification';

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  let customer: Customer | null = null;

  if (req.user && req.user.customer_id) {
    const customerService = req.scope.resolve("customerService") as CustomerService;
    customer = await customerService.retrieve(req.user.customer_id);
  }

  if (!customer) {
    return res.sendStatus(403);
  }

  const restockNotificationService = req.scope.resolve("restockNotificationService") as RestockNotificationService;

  const restockNotifications = await restockNotificationService.listForCustomer(customer.id, {}, { relations: ['variant', 'variant.product', 'variant.product.publisher', 'variant.product.author'] });

  return res.json({
    restock_notifications: restockNotifications
  })
}
