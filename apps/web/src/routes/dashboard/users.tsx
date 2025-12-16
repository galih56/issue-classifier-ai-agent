import { createFileRoute } from "@tanstack/solid-router"
import { createQuery } from "@tanstack/solid-query"
import {
  createSolidTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/solid-table"
import { api } from "@/lib/api-client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash } from "lucide-solid"
import { Show, For } from "solid-js"

type User = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  createdAt: string
  updatedAt: string
}

type UsersResponse = {
  users: User[]
  total: number
}

export const Route = createFileRoute("/dashboard/users")({
  component: UsersPage,
})

function UsersPage() {
  const query = createQuery(() => ({
    queryKey: ["users"],
    queryFn: async () => {
      return await api.get<UsersResponse>("/users")
    },
  }))

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => <div class="font-medium">{info.getValue() as string}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (info) => <span class="capitalize">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: (props) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger as={Button<"button">} variant="ghost" class="h-8 w-8 p-0">
              <span class="sr-only">Open menu</span>
              <MoreHorizontal class="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pencil class="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem class="text-destructive focus:text-destructive">
                <Trash class="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = createSolidTable({
    get data() {
      return query.data?.users ?? []
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold tracking-tight">User Management</h2>
                <p class="text-muted-foreground">
                    Manage your users here.
                </p>
            </div>
            <Button>Add User</Button>
        </div>
      
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <TableRow>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <TableHead>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )}
                  </For>
                </TableRow>
              )}
            </For>
          </TableHeader>
          <TableBody>
            <Show when={query.isLoading}>
                <TableRow>
                    <TableCell colSpan={columns.length} class="h-24 text-center">
                        Loading...
                    </TableCell>
                </TableRow>
            </Show>
            <Show when={query.isError}>
                <TableRow>
                    <TableCell colSpan={columns.length} class="h-24 text-center text-destructive">
                        Error loading users.
                    </TableCell>
                </TableRow>
            </Show>
            <Show when={query.isSuccess && table.getRowModel().rows.length === 0}>
                 <TableRow>
                    <TableCell colSpan={columns.length} class="h-24 text-center">
                        No results.
                    </TableCell>
                </TableRow>
            </Show>
            <For each={table.getRowModel().rows}>
              {(row) => (
                <TableRow data-state={row.getIsSelected() && "selected"}>
                  <For each={row.getVisibleCells()}>
                    {(cell) => (
                      <TableCell>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )}
                  </For>
                </TableRow>
              )}
            </For>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
