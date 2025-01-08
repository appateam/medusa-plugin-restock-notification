import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa';
import RestockNotificationService from '../services/restock-notification';

export default async function restockNotificationExecute({ data, container }: SubscriberArgs<Record<string, any>>) {
  const restockNotificationService: RestockNotificationService = container.resolve(
    "restockNotificationService"
  )

  const { variant_id } = data;

  return await restockNotificationService.restockExecute(variant_id)
}

export const config: SubscriberConfig = {
  event: RestockNotificationService.Events.EXECUTE,
  context: {
    subscriberId: "restock-notification-execute",
  },
}
