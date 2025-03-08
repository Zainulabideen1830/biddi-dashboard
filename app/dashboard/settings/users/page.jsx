'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTable } from '@/components/dashboard/settings/users/users-table'
import { InvitationsTable } from '@/components/dashboard/settings/users/invitations-table'
import { AddUser } from '@/components/dashboard/settings/users/add-user'

export default function UsersPage() {
  return (
    <div className="custom_container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users and their roles in your organization</p>
        </div>
        <AddUser />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-6">
          <UsersTable />
        </TabsContent>
        <TabsContent value="invitations" className="mt-6">
          <InvitationsTable />
          {/* <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Pending Invitations</h2>
              <p className="text-muted-foreground">Manage invitations sent to users</p>
            </div>
            <InvitationsTable />
          </div> */}
        </TabsContent>
      </Tabs>
    </div>
  )
}