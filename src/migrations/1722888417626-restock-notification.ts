import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm"

export class RestockNotification1722888417626 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'restock_notification',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          isNullable: false,
          isPrimary: true,
        },
        {
          name: 'variant_id',
          type: 'varchar',
          isNullable: false
        },
        {
          name: 'customer_id',
          type: 'varchar',
          isNullable: false
        },
        {
          name: 'country_code',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'language',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'created_at',
          type: 'timestamptz',
          isNullable: false,
          default: 'now()',
        },
        {
          name: 'updated_at',
          type: 'timestamptz',
          isNullable: false,
          default: 'now()',
        }
      ],
      uniques: [
        {
          columnNames: ['variant_id', 'customer_id']
        }
      ],
      foreignKeys: [
        {
          columnNames: ['variant_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'product_variant',
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
        },
        {
          columnNames: ['customer_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'customer',
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
        }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('restock_notification');
  }
}
