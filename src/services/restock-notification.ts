import { MedusaError } from "medusa-core-utils"
import {
  buildQuery,
  EventBusService,
  FindConfig,
  ProductVariantInventoryService,
  ProductVariantService,
  TransactionBaseService
} from '@medusajs/medusa';
import { RestockNotification } from '../models/restock-notification';
import { ProductVariant } from '@medusajs/medusa/dist/models';
import { PricedVariant } from '@medusajs/medusa/dist/types/pricing';

class RestockNotificationService extends TransactionBaseService {
  static Events = {
    EXECUTE: "restock-notification.execute",
    RESTOCKED: "restock-notification.restocked",
  }

  protected eventBusService: EventBusService
  protected productVariantService: ProductVariantService
  protected productVariantInventoryService: ProductVariantInventoryService

  protected options: {
    trigger_delay?: number
    inventory_required?: number
  }

  constructor(container, options) {
    super(container)
    this.eventBusService = container.eventBusService
    this.productVariantService = container.productVariantService
    this.productVariantInventoryService = container.productVariantInventoryService
    this.options = options
  }

  /**
   * Lists all restock notifications
   * @param selector - an object that defines rules to filter restock notifications by
   * @param config - object that defines the scope for what should be returned
   * @return {Promise<RestockNotification[]>} The restock notification
   */
  async listAll(
    selector = {},
    config: FindConfig<RestockNotification> = {
      relations: [],
      skip: 0,
      take: 20,
    }
  ): Promise<RestockNotification[]> {
    return this.atomicPhase_(async (manager) => {
      const restockRepo = manager.getRepository(RestockNotification)
      const query = buildQuery(selector, config)
      return await restockRepo.find({ ...query });
    })
  }

  /**
   * Lists restock notifications with a given variant ID.
   * @param {string} variantId - the variant ID to retrieve restock notifications for
   * @param selector - an object that defines rules to filter restock notifications by
   * @param config - object that defines the scope for what should be returned
   * @return {Promise<RestockNotification[]>} The restock notification
   */
  async list(
    variantId: string,
    selector = {},
    config: FindConfig<RestockNotification> = {
      relations: [],
      skip: 0,
      take: 20,
    }
  ): Promise<RestockNotification[]> {
    return this.atomicPhase_(async (manager) => {
      const restockRepo = manager.getRepository(RestockNotification)
      const query = buildQuery(selector, config)
      return await restockRepo.find({
        ...query,
        where: {
          variant_id: variantId,
        }
      })
    })
  }

  /**
   * Lists restock notifications with a given customer ID.
   * @param {string} customerId - the customer ID to retrieve restock notifications for
   * @param selector - an object that defines rules to filter restock notifications by
   * @param config - object that defines the scope for what should be returned
   * @return {Promise<RestockNotification[]>} The restock notification
   */
  async listForCustomer(
    customerId: string,
    selector = {},
    config: FindConfig<RestockNotification> = {
      relations: [],
      skip: 0,
      take: 20,
    }
  ): Promise<RestockNotification[]> {
    return this.atomicPhase_(async (manager) => {
      const restockRepo = manager.getRepository(RestockNotification)
      const query = buildQuery(selector, config)
      return await restockRepo.find({
        ...query,
        where: {
          customer_id: customerId,
        }
      })
    })
  }

  /**
   * Retrieve restock notification with a given variant ID and customer ID.
   * @param {string} variantId - the variant ID to retrieve restock notification for
   * @param {string} customerId - the customer ID to retrieve restock notification for
   * @return {Promise<RestockNotification | null>} The restock notification
   */
  async retrieve(variantId: string, customerId: string): Promise<RestockNotification | null> {
    const restockRepo = this.activeManager_.getRepository(RestockNotification)
    return await restockRepo.findOneBy({ variant_id: variantId, customer_id: customerId });
  }

  async create(variantId: string, customerId: string, countryCode: string | null = null, language: string | null = null, salesChannelId: string | null = null) {
    return this.atomicPhase_(async (manager) => {
      const restockRepo = manager.getRepository(RestockNotification)

      let variant: ProductVariant | PricedVariant = await this.productVariantService.retrieve(variantId)

      const variants =
        await this.productVariantInventoryService.setVariantAvailability(
          [variant],
          salesChannelId
        )

      if (variants.length) {
        variant = variants[0]
      }

      if (variant.inventory_quantity > 0) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          "You cannot sign up for restock notifications on a product that is not sold out"
        )
      }

      const created = restockRepo.create({
        variant_id: variant.id,
        customer_id: customerId,
        country_code: countryCode,
        language: language
      })

      return await restockRepo.save(created)
    })
  }

  /**
   * Checks if anyone has signed up for restock notifications on a given variant
   * and emits a restocked event to the event bus. After successful emission the
   * restock notification is deleted.
   * @param {string} variantId - the variant id to trigger restock for
   * @return The resulting restock notification
   */
  async triggerRestock(variantId) {
    const delay = this.options?.trigger_delay ?? 0
    if (delay) {
      return await this.eventBusService.emit(
        RestockNotificationService.Events.EXECUTE,
        { variant_id: variantId },
        { delay }
      )
    }

    return await this.restockExecute(variantId)
  }

  async restockExecute(variantId) {
    return await this.atomicPhase_(async (manager) => {
      const restockRepo = manager.getRepository(RestockNotification)

      const restockNotifications = await this.list(variantId, {}, { relations: ['customer'] })
      if (!restockNotifications) {
        return
      }

      const variant = await this.productVariantService.retrieve(variantId, { relations: ['product'] })

      const hasInventory = await this.productVariantInventoryService.confirmInventory(variant.id, this.options?.inventory_required ?? 1)

      if (hasInventory) {
        await this.eventBusService
          .withTransaction(manager)
          .emit(RestockNotificationService.Events.RESTOCKED, {
            variant,
            restockNotifications
          })
        await restockRepo.delete({ variant_id: variantId })
      }
    })
  }
}

export default RestockNotificationService
