import { ProductVariantService, SubscriberArgs, SubscriberConfig } from '@medusajs/medusa';
import RestockNotificationService from '../services/restock-notification';

export default async function productVariantUpdated({ data, container }: SubscriberArgs<Record<string, any>>) {
  const restockNotificationService: RestockNotificationService = container.resolve(
    "restockNotificationService"
  )

  const { id, fields } = data;

  if (fields.includes("inventory_quantity")) {
    return await this.manager_.transaction(
      async (m) =>
        await restockNotificationService
          .withTransaction(m)
          .triggerRestock(id)
    )
  }

  return Promise.resolve()
}

export const config: SubscriberConfig = {
  event: ProductVariantService.Events.UPDATED,
  context: {
    subscriberId: "product-variant-updated",
  },
}
