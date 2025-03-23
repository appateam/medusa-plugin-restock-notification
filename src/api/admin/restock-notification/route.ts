import { Customer, CustomerService, MedusaRequest, MedusaResponse } from '@medusajs/medusa';
import RestockNotificationService from '../../../services/restock-notification';

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const restockNotificationService = req.scope.resolve("restockNotificationService") as RestockNotificationService;

  const restockNotifications = await restockNotificationService.listAll({}, { relations: ['variant', 'variant.product', 'variant.product.publisher', 'variant.product.author'] });

  return res.json({
    restock_notifications: restockNotifications
  })
}
