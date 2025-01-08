import { ProductVariantInventoryService, SubscriberArgs, SubscriberConfig } from '@medusajs/medusa';
import RestockNotificationService from '../services/restock-notification';
import { InventoryItemService, InventoryLevelService } from '@medusajs/inventory/dist/services';

export default async function inventoryLevelUpdated({ data, container }: SubscriberArgs<{ id: string }>) {
  const restockNotificationService: RestockNotificationService = container.resolve(
    "restockNotificationService"
  )

  const inventoryLevelService: InventoryLevelService = container.resolve("inventoryLevelService")

  const productVariantInventoryService: ProductVariantInventoryService = container.resolve(
    "productVariantInventoryService"
  )

  const { id } = data;

  const inventoryLevel = await inventoryLevelService.retrieve(id);

  const variants = await productVariantInventoryService.listVariantsByItem(inventoryLevel.inventory_item_id);

  for (const variant of variants) {
    await restockNotificationService.triggerRestock(variant.id);
  }

  return Promise.resolve()
}

export const config: SubscriberConfig = {
  event: InventoryLevelService.Events.UPDATED,
  context: {
    subscriberId: "inventory-level-updated",
  },
}
