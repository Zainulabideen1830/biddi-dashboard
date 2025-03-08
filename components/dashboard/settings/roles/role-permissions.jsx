'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogFooter } from '@/components/ui/dialog'
import { Save, Loader2, AlertCircle } from 'lucide-react'
import { toast } from "react-toastify"
import { usePermissionsStore } from '@/store/permissions-store'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

// Permission categories with their respective permissions
const permissionCategories = [
  {
    id: 'work_details',
    title: 'WORK DETAILS',
    permissions: [
      { id: 'view_work_details', name: 'View' },
      { id: 'edit_work_details', name: 'Edit' },
    ],
  },
  {
    id: 'fixed_costs',
    title: 'FIXED COSTS',
    permissions: [
      { id: 'view_fixed_costs', name: 'View' },
      { id: 'create_fixed_costs', name: 'Create' },
      { id: 'edit_fixed_costs', name: 'Edit' },
      { id: 'delete_fixed_costs', name: 'Delete' },
    ],
  },
  {
    id: 'products_services',
    title: 'PRODUCTS/SERVICES',
    permissions: [
      { id: 'view_products_services', name: 'View' },
      { id: 'create_products_services', name: 'Create' },
      { id: 'edit_products_services', name: 'Edit' },
      { id: 'delete_products_services', name: 'Delete' },
    ],
  },
  {
    id: 'bids',
    title: 'BIDS',
    permissions: [
      { id: 'view_bids', name: 'View' },
      { id: 'create_bids', name: 'Create' },
      { id: 'edit_bids', name: 'Edit' },
      { id: 'view_sensitive_bid_details', name: 'View Sensitive Bid Details' },
    ],
  },
  {
    id: 'users',
    title: 'USERS',
    permissions: [
      { id: 'view_users', name: 'View' },
      { id: 'create_users', name: 'Create' },
      { id: 'edit_users', name: 'Edit' },
      { id: 'delete_users', name: 'Delete' },
    ],
  },
]

export function RolePermissions({ role, onClose }) {
  const { 
    fetchPermissionCategories, 
    updateRolePermissions, 
    isLoading, 
    error, 
    clearError 
  } = usePermissionsStore()
  
  const [permissionCategories, setPermissionCategories] = useState([])
  const [rolePermissions, setRolePermissions] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true)
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    // Clear any previous errors
    clearError()
    setServerError(null)
    
    const loadPermissions = async () => {
      setIsLoadingPermissions(true)
      try {
        // Fetch permission categories and role permissions
        const categories = await fetchPermissionCategories()
        setPermissionCategories(categories || [])
        
        // Initialize permissions based on role
        if (role) {
          const initialPermissions = {}
          
          // If role has permissions property, use it to initialize
          if (role.permissions && Array.isArray(role.permissions)) {
            categories.forEach(category => {
              category.permissions.forEach(permission => {
                // Check if permission is in role.permissions
                const hasPermission = role.permissions.some(p => 
                  p.id === permission.id || p === permission.id
                )
                initialPermissions[permission.id] = hasPermission
              })
            })
          } else {
            // Default permissions based on role name (fallback)
            if (role.name === 'Admin' || role.name === 'admin') {
              // Admin has all permissions
              categories.forEach(category => {
                category.permissions.forEach(permission => {
                  initialPermissions[permission.id] = true
                })
              })
            } else {
              // For other roles, initialize with no permissions
              categories.forEach(category => {
                category.permissions.forEach(permission => {
                  initialPermissions[permission.id] = false
                })
              })
            }
          }
          
          setRolePermissions(initialPermissions)
        }
      } catch (error) {
        console.error('Error loading permissions:', error)
        setServerError(error.message || 'Failed to load permissions. Please try again.')
      } finally {
        setIsLoadingPermissions(false)
      }
    }
    
    loadPermissions()
  }, [role, fetchPermissionCategories, clearError])

  const handlePermissionChange = (permissionId) => {
    // check for both uppercase and lowercase
    if (role?.is_system && (role?.name === 'Admin' || role?.name === 'admin')) {
      // Don't allow changing permissions for the Admin system role
      return
    }
    
    setRolePermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId]
    }))
  }

  const handleSavePermissions = async () => {
    if (!role || !role.id) {
      setServerError('Role information is missing. Please try again.')
      return
    }
    
    setIsSaving(true)
    setServerError(null)
    
    try {
      // Convert rolePermissions object to array of permission IDs
      const permissionIds = Object.entries(rolePermissions)
        .filter(([_, isGranted]) => isGranted)
        .map(([permissionId]) => permissionId)
      
      // Call API to update role permissions
      await updateRolePermissions(role.id, permissionIds)
      
      toast.success(`Permissions for ${role?.name} role have been updated successfully.`)
      
      // Close the dialog
      onClose()
    } catch (error) {
      console.error('Failed to update permissions:', error)
      setServerError(error.message || 'Failed to update permissions. Please try again.')
      toast.error('Failed to update permissions. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectAllInCategory = (categoryId, checked) => {
    // check for both uppercase and lowercase
    if (role?.is_system && (role?.name === 'Admin' || role?.name === 'admin')) {
      // Don't allow changing permissions for the Admin system role
      return
    }
    
    const category = permissionCategories.find(cat => cat.id === categoryId)
    if (!category) return
    
    const updatedPermissions = { ...rolePermissions }
    
    category.permissions.forEach(permission => {
      updatedPermissions[permission.id] = checked
    })
    
    setRolePermissions(updatedPermissions)
  }

  return (
    <div className="space-y-6">
      {serverError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      
      {role?.is_system && role?.name === 'admin' && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-md">
          The Admin role has full access to all features and permissions cannot be modified.
        </div>
      )}
      
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {isLoadingPermissions ? (
          // Loading skeleton
          Array(3).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3 bg-muted dark:bg-backgroundSecondary">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="w-1/2 pl-5"><Skeleton className="h-4 w-20" /></TableHead>
                      <TableHead className="w-1/2 text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array(4).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-b border-border">
                        <TableCell className="py-4 pl-5 font-medium">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-4 mx-auto rounded-sm" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        ) : permissionCategories.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No permission categories found. Please contact your administrator.
          </div>
        ) : (
          permissionCategories.map(category => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="pb-3 bg-muted dark:bg-backgroundSecondary">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{category.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSelectAllInCategory(category.id, true)}
                      disabled={role?.is_system && role?.name === 'admin'}
                    >
                      Select All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSelectAllInCategory(category.id, false)}
                      disabled={role?.is_system && role?.name === 'admin'}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="w-1/2 pl-5">PERMISSION</TableHead>
                      <TableHead className="w-1/2 text-center">ACCESS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.permissions.map((permission) => (
                      <TableRow key={permission.id} className="border-b border-border">
                        <TableCell className="py-4 pl-5 font-medium">
                          <div>
                            <div className="text-sm font-medium">{permission.name}</div>
                            {permission.description && (
                              <div className="text-xs text-muted-foreground mt-1">{permission.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={rolePermissions[permission.id] || false}
                            onCheckedChange={() => handlePermissionChange(permission.id)}
                            disabled={role?.is_system && role?.name === 'admin'}
                            aria-label={`Grant ${permission.name} permission`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <DialogFooter>
        <div className="flex items-center justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleSavePermissions}
            disabled={isSaving || (role?.is_system && role?.name === 'admin') || isLoadingPermissions}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Permissions
              </>
            )}
          </Button>
        </div>
      </DialogFooter>
    </div>
  )
}

export default RolePermissions