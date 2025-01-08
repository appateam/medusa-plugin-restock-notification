import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm"
import { BaseEntity, Customer, generateEntityId, ProductVariant } from "@medusajs/medusa"

@Entity()
export class RestockNotification extends BaseEntity {
  @Column({ type: "varchar" })
  variant_id: string

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: "variant_id" })
  variant: ProductVariant

  @Column({ type: "varchar" })
  customer_id: string

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customer_id" })
  customer: Customer

  @Column({ type: "varchar" })
  country_code: string | null

  @Column({ type: "varchar" })
  language: string | null

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "restnot");
  }
}

/**
 * @schema restock_notification
 * title: "Restock Notification"
 * description: "Holds a list of customers that wish to be notified when the specified product variant is restocked."
 * x-resourceId: restock_notification
 * properties:
 *   variant_id:
 *     type: string
 *     description: "The ID of the variant that customers have signed up to be notified about."
 *   customer_id:
 *     description: "The ID of the registered customer who wish to be notified about restocks."
 *     type: string
 *   email:
 *     description: "The email of the non-registered customer who wish to be notified about restocks."
 *     type: string
 *   created_at:
 *     type: string
 *     format: date-time
 *     description: "The date time at which the first restock signup was made."
 *   updated_at:
 *     type: string
 *     format: date-time
 *     description: "The date time at which the first last signup was made."
 */
