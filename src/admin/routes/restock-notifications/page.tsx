import { RouteConfig } from "@medusajs/admin"
import { BellAlert } from '@medusajs/icons';
import { createDataTableColumnHelper, DataTable, Heading, useDataTable, Avatar } from '@medusajs/ui';
import { useAdminCustomQuery } from 'medusa-react';
import { RestockNotification } from '../../../models/restock-notification';
import { useMemo } from 'react';

const RestockNotificationsPage = () => {
  const { data: { restock_notifications }, isLoading: isLoading } = useAdminCustomQuery<undefined, {
    restock_notifications: RestockNotification[]
  }>('restock_notifications', ['restock_notification']);


  const columns = useMemo(() => {
    const columnHelper = createDataTableColumnHelper<typeof restock_notifications[0]>();
    return [
      columnHelper.accessor("variant.product", {
        header: "Product",
        enableSorting: true,
        sortLabel: "variant.product.title",
        cell: ({ getValue }) => {
          const { thumbnail, title } = getValue()
          return (
            <div className="flex items-center">
              <div className="my-1.5 mr-4 flex h-[40px] w-[30px] items-center">
                <img src={thumbnail} alt={title} className="h-full object-contain" />
              </div>
              {title}
            </div>
          )
        }
      }),
      columnHelper.accessor("customer", {
        header: "Customer",
        enableSorting: true,
        sortLabel: "customer.first_name",
        cell: ({ getValue }) => {
          const { first_name, last_name } = getValue()
          return (
            <div>
              <div className="flex w-full items-center py-1.5">
                <div className="h-[24px] w-[24px]">
                  <Avatar fallback={first_name.slice(0, 1)} />
                </div>
                <span className="w-40 truncate pl-2.5">{first_name} {last_name}</span>
              </div>
            </div>
          )
        }
      }),
    ]
  }, [restock_notifications]);

  const table = useDataTable({
    columns,
    data: restock_notifications,
    getRowId: (restockNotification) => restockNotification.id,
    rowCount: restock_notifications.length,
    isLoading: isLoading,
  })

  return (
    <DataTable instance={table}>
      <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <Heading>Restock notifications</Heading>
      </DataTable.Toolbar>
      <DataTable.Table />
    </DataTable>
  )
}

export const config: RouteConfig = {
  link: {
    label: "Restock notifications",
    icon: BellAlert,
  },
}

export default RestockNotificationsPage
