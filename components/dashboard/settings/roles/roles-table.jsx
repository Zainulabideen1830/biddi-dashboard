'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Edit, Plus, Trash2, Shield, Loader2, AlertCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RoleForm } from './role-form'
import { RolePermissions } from './role-permissions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePermissionsStore } from '@/store/permissions-store'
import { toast } from 'react-toastify'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

// Sample roles data for development
const sampleRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full access to all features and settings',
    usersCount: 2,
    isDefault: false,
    isSystem: true
  },
  {
    id: 2,
    name: 'Project Manager',
    description: 'Can manage projects, bids, and view reports',
    usersCount: 5,
    isDefault: true,
    isSystem: false
  },
  {
    id: 3,
    name: 'Limited',
    description: 'Limited access to view and create bids',
    usersCount: 12,
    isDefault: false,
    isSystem: false
  }
]

const RolesTable = () => {
  const {
    fetchRoles,
    deleteRole,
    roles: storeRoles,
    isLoading,
    error,
    clearError
  } = usePermissionsStore()

  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    const loadRoles = async () => {
      clearError()
      setServerError(null)

      try {
        await fetchRoles()
      } catch (error) {
        console.error('Error fetching roles:', error)
        setServerError(error.message || 'Failed to fetch roles. Please try again.')
      }
    }

    loadRoles()
  }, [fetchRoles, clearError])


  useEffect(() => {
    if (storeRoles && storeRoles.length > 0) {
      setRoles(storeRoles)
    }
  }, [storeRoles])

  const handleManagePermissions = (role) => {
    setSelectedRole(role)
    setPermissionsDialogOpen(true)
  }

  const handleEditRole = (role) => {
    setSelectedRole(role)
    setEditDialogOpen(true)
  }

  const handleCreateRole = () => {
    setCreateDialogOpen(true)
  }

  const confirmDeleteRole = (role) => {
    setRoleToDelete(role)
    setDeleteDialogOpen(true)
  }

  const handleDeleteRole = async () => {
    if (!roleToDelete || !roleToDelete.id) {
      setServerError('Role information is missing. Please try again.')
      setDeleteDialogOpen(false)
      return
    }

    setIsDeleting(true)
    setServerError(null)

    try {
      await deleteRole(roleToDelete.id)
      toast.success(`Role "${roleToDelete.name}" has been deleted successfully.`)
      setRoleToDelete(null)
    } catch (error) {
      console.error('Error deleting role:', error)
      setServerError(error.message || 'Failed to delete role. Please try again.')
      toast.error('Failed to delete role. Please try again.')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleRoleCreated = (newRole) => {
    setCreateDialogOpen(false)
  }

  const handleRoleUpdated = (updatedRole) => {
    setEditDialogOpen(false)
  }

  return (
    <>
      {serverError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white dark:bg-backgroundSecondary rounded-lg shadow-sm">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">Roles</h3>
              {isLoading ? (
                <Skeleton className="h-5 w-8 rounded-full" />
              ) : (
                <span className="bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5">
                  {roles.length}
                </span>
              )}
            </div>
            <Button
              variant="primary"
              size="xl"
              onClick={handleCreateRole}
              disabled={isLoading}
            >
              <Plus className='size-4' />
              Add New Role
            </Button>
          </div>
        </div>

        <div className="!flex !overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <figure className="!shrink-0 grow">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="w-[200px] pl-5">ROLE NAME</TableHead>
                  <TableHead className="w-[350px]">DESCRIPTION</TableHead>
                  <TableHead className="w-[150px]">USERS</TableHead>
                  <TableHead className="w-[150px]">STATUS</TableHead>
                  <TableHead className="w-[250px] text-right pr-5">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array(3).fill(0).map((_, index) => (
                    <TableRow key={index} className="border-b border-border">
                      <TableCell className="py-4 pl-5">
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-64" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-9 w-36 rounded-md" />
                          <Skeleton className="h-9 w-9 rounded-md" />
                          <Skeleton className="h-9 w-9 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No roles found. Create your first role to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id} className="border-b border-border">
                      <TableCell className="py-4 pl-5">
                        <span className="text-sm font-medium text-secondary-base">{role.name}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{role.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{role.usersCount || 0} users</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {role.isDefault && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                              Default
                            </Badge>
                          )}
                          {role.is_system && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800">
                              System
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManagePermissions(role)}
                            className="text-xs rounded-[10px] border-gray-200 dark:border-gray-700 bg-transparent"
                          >
                            {role.name === 'admin' ? 'ADMIN PERMISSIONS' : 'MANAGE PERMISSIONS'}
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleManagePermissions(role)}
                            title="Manage Permissions"
                          >
                            <Shield className="size-4 text-muted-foreground" />
                          </Button> */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditRole(role)}
                            disabled={role.isSystem}
                            title={role.isSystem ? "System roles cannot be edited" : "Edit Role"}
                          >
                            <Edit className="size-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDeleteRole(role)}
                            disabled={role.isSystem}
                            title={role.isSystem ? "System roles cannot be deleted" : "Delete Role"}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </figure>
        </div>
      </div>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <RoleForm onSubmit={handleRoleCreated} onCancel={() => setCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <RoleForm
              role={selectedRole}
              isEditing={true}
              onSubmit={handleRoleUpdated}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen} className="w-full">
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRole?.name} Role Permissions</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <RolePermissions
              role={selectedRole}
              onClose={() => setPermissionsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the role "{roleToDelete?.name}".
              Users assigned to this role will need to be reassigned to another role.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default RolesTable   