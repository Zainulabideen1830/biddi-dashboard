'use client'

import { create } from 'zustand'
import { useAuthStore } from './auth-store'
import { apiCall } from '@/lib/api'

/**
 * Permissions store for managing user permissions
 */
export const usePermissionsStore = create((set, get) => {
  // Get the API base URL from environment variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
  
  return {
  // State
  permissions: {},
  roles: [],
  permissionCategories: [],
  isLoading: false,
  error: null,

  // Actions
  fetchPermissions: async () => {
    const { authFetch, isAuthenticated, user } = useAuthStore.getState()
    
    if (!isAuthenticated) {
      set({ permissions: {}, roles: [], error: 'Not authenticated' })
      return
    }
    
    set({ isLoading: true, error: null })
    
    try {
      // Fetch user permissions
      const response = await authFetch(`${API_BASE_URL}/api/rbac/users/me/permissions`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch permissions')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch permissions')
      }
      
      // Format permissions by category
      const permissionsByCategory = {}
      data.data.forEach(permission => {
        const { permission: p, granted } = permission
        
        if (!permissionsByCategory[p.category]) {
          permissionsByCategory[p.category] = {}
        }
        
        permissionsByCategory[p.category][p.name] = granted
      })
      
      // Fetch user's primary role
      const roleResponse = await authFetch(`${API_BASE_URL}/api/rbac/users/me/primary-role`)
      let primaryRole = null
      
      if (roleResponse.ok) {
        const roleData = await roleResponse.json()
        if (roleData.success && roleData.data) {
          primaryRole = roleData.data
        }
      }
      
      // For backward compatibility, also fetch roles
      const rolesResponse = await authFetch(`${API_BASE_URL}/api/rbac/users/me/roles`)
      let roles = []
      
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        if (rolesData.success && rolesData.data) {
          roles = rolesData.data
        }
      }
      
      set({ 
        permissions: permissionsByCategory, 
        primaryRole,
        roles,
        isLoading: false 
      })
    } catch (error) {
      console.error('Error fetching permissions:', error)
      set({ 
        error: error.message || 'Failed to fetch permissions',
        isLoading: false 
      })
    }
  },
  
  // Helper functions
  hasPermission: (permissionName) => {
    const { permissions, roles } = get()
    
    // Admin role has all permissions
    if (roles.some(role => role.name === 'admin')) {
      return true
    }
    
    // Check if user has the permission directly
    for (const category in permissions) {
      const permissionFound = permissions[category].find(p => p.name === permissionName && p.granted)
      if (permissionFound) {
        return true
      }
    }
    
    // Check if any of the user's roles have the permission
    // This would require additional API calls or storing role permissions
    // For now, we'll rely on the backend check via the PermissionGuard component
    
    return false
  },
  
  hasRole: (roleName) => {
    const { roles } = get()
    return roles.some(role => role.name === roleName)
  },
  
  isAdmin: () => {
    const { roles } = get()
    return roles.some(role => role.name === 'admin')
  },
  
  reset: () => {
    set({ permissions: {}, roles: [], isLoading: false, error: null })
  },

  fetchRoles: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/rbac/roles`, {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().tokens?.accessToken}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch roles')
      }
      
      const data = await response.json()
      
      set({ roles: data.data, isLoading: false })
    } catch (error) {
      console.error('Error fetching roles:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  fetchPermissionCategories: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/rbac/permissions/categories`, {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().tokens?.accessToken}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch permission categories')
      }
      
      const data = await response.json()
      
      set({ permissionCategories: data.data, isLoading: false })
      return data.data
    } catch (error) {
      console.error('Error fetching permission categories:', error)
      set({ error: error.message, isLoading: false })
      
      // Return mock data for development if API is not available
      const mockCategories = [
        {
          id: 'work_details',
          title: 'WORK DETAILS',
          permissions: [
            { id: 'view_work_details', name: 'View', description: 'View work details' },
            { id: 'edit_work_details', name: 'Edit', description: 'Edit work details' },
          ],
        },
        {
          id: 'fixed_costs',
          title: 'FIXED COSTS',
          permissions: [
            { id: 'view_fixed_costs', name: 'View', description: 'View fixed costs' },
            { id: 'create_fixed_costs', name: 'Create', description: 'Create fixed costs' },
            { id: 'edit_fixed_costs', name: 'Edit', description: 'Edit fixed costs' },
            { id: 'delete_fixed_costs', name: 'Delete', description: 'Delete fixed costs' },
          ],
        },
        {
          id: 'products_services',
          title: 'PRODUCTS/SERVICES',
          permissions: [
            { id: 'view_products_services', name: 'View', description: 'View products and services' },
            { id: 'create_products_services', name: 'Create', description: 'Create products and services' },
            { id: 'edit_products_services', name: 'Edit', description: 'Edit products and services' },
            { id: 'delete_products_services', name: 'Delete', description: 'Delete products and services' },
          ],
        },
        {
          id: 'bids',
          title: 'BIDS',
          permissions: [
            { id: 'view_bids', name: 'View', description: 'View bids' },
            { id: 'create_bids', name: 'Create', description: 'Create bids' },
            { id: 'edit_bids', name: 'Edit', description: 'Edit bids' },
            { id: 'view_sensitive_bid_details', name: 'View Sensitive Bid Details', description: 'View sensitive bid details' },
          ],
        },
        {
          id: 'users',
          title: 'USERS',
          permissions: [
            { id: 'view_users', name: 'View', description: 'View users' },
            { id: 'create_users', name: 'Create', description: 'Create users' },
            { id: 'edit_users', name: 'Edit', description: 'Edit users' },
            { id: 'delete_users', name: 'Delete', description: 'Delete users' },
          ],
        },
      ]
      
      return mockCategories
    }
  },

  fetchUserPermissions: async (userId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/rbac/users/${userId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().tokens?.accessToken}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch user permissions')
      }
      
      const data = await response.json()
      
      // Group permissions by category
      const permissionsByCategory = {}
      
      data.data.forEach(userPermission => {
        const { permission, granted } = userPermission
        const { category } = permission
        
        if (!permissionsByCategory[category]) {
          permissionsByCategory[category] = []
        }
        
        permissionsByCategory[category].push({
          id: permission.id,
          name: permission.name,
          description: permission.description,
          granted
        })
      })
      
      return permissionsByCategory
    } catch (error) {
      console.error('Error fetching user permissions:', error)
      set({ error: error.message, isLoading: false })
      return {}
    } finally {
      set({ isLoading: false })
    }
  },

  updateUserPermissions: async (userId, permissions) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/rbac/users/${userId}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().tokens?.accessToken}`
        },
        body: JSON.stringify({ permissions })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update user permissions')
      }
      
      const data = await response.json()
      
      set({ isLoading: false })
      return data.data
    } catch (error) {
      console.error('Error updating user permissions:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  createRole: async (roleData) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/rbac/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().tokens?.accessToken}`
        },
        body: JSON.stringify(roleData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create role')
      }
      
      const data = await response.json()
      
      // Update roles list
      await get().fetchRoles()
      
      set({ isLoading: false })
      return data.data
    } catch (error) {
      console.error('Error creating role:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateRole: async (roleId, roleData) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/rbac/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().tokens?.accessToken}`
        },
        body: JSON.stringify(roleData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update role')
      }
      
      const data = await response.json()
      
      // Update roles list
      await get().fetchRoles()
      
      set({ isLoading: false })
      return data.data
    } catch (error) {
      console.error('Error updating role:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteRole: async (roleId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/rbac/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().tokens?.accessToken}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete role')
      }
      
      // Update roles list
      await get().fetchRoles()
      
      set({ isLoading: false })
      return true
    } catch (error) {
      console.error('Error deleting role:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  updateRolePermissions: async (roleId, permissionIds) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/rbac/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().tokens?.accessToken}`
        },
        body: JSON.stringify({ permissions: permissionIds })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update role permissions')
      }
      
      const data = await response.json()
      
      // Update roles list to reflect permission changes
      await get().fetchRoles()
      
      set({ isLoading: false })
      return data.data
    } catch (error) {
      console.error('Error updating role permissions:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null })
}
}) 