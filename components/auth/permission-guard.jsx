'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissionsStore } from '@/store/permissions-store'
import { useAuthStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'

/**
 * Permission Guard Component
 * Renders children only if user has the required permission or role
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {string} props.permission - Permission name to check
 * @param {string} props.role - Role name to check
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have permission
 */
export default function PermissionGuard({ 
  children, 
  permission, 
  role,
  fallback = null 
}) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { 
    fetchPermissions, 
    hasPermission, 
    hasRole, 
    isAdmin,
    isLoading 
  } = usePermissionsStore()
  
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // If not authenticated, don't bother checking permissions
    if (!isAuthenticated) {
      setIsChecking(false)
      setIsAuthorized(false)
      return
    }

    const checkAccess = async () => {
      setIsChecking(true)
      
      try {
        // Admin role has all permissions
        if (role === 'admin' || permission === 'admin') {
          const userIsAdmin = isAdmin()
          setIsAuthorized(userIsAdmin)
          setIsChecking(false)
          return
        }
        
        // Check role if specified
        if (role) {
          const checkRole = async () => {
            try {
              // First check local state
              if (hasRole(role)) {
                return true
              }
              
              // If not found in local state, fetch from API
              await fetchPermissions()
              return hasRole(role)
            } catch (error) {
              console.error('Error checking role:', error)
              return false
            }
          }
          
          const hasRequiredRole = await checkRole()
          setIsAuthorized(hasRequiredRole)
          setIsChecking(false)
          return
        }
        
        // Check permission if specified
        if (permission) {
          const checkPermission = async () => {
            try {
              // First check local state
              if (hasPermission(permission)) {
                return true
              }
              
              // If not found in local state, fetch from API
              await fetchPermissions()
              return hasPermission(permission)
            } catch (error) {
              console.error('Error checking permission:', error)
              return false
            }
          }
          
          const hasRequiredPermission = await checkPermission()
          setIsAuthorized(hasRequiredPermission)
          setIsChecking(false)
          return
        }
        
        // If no permission or role specified, allow access
        setIsAuthorized(true)
        setIsChecking(false)
      } catch (error) {
        console.error('Error checking permissions:', error)
        setIsAuthorized(false)
        setIsChecking(false)
      }
    }
    
    checkAccess()
  }, [
    isAuthenticated, 
    permission, 
    role, 
    hasPermission, 
    hasRole, 
    isAdmin, 
    fetchPermissions
  ])

  // Show loading state while checking permissions
  if (isChecking || isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not authorized, show fallback or null
  if (!isAuthorized) {
    return fallback
  }

  // If authorized, show children
  return children
}

/**
 * HasPermission Component
 * Renders children only if user has the required permission
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {string} props.permission - Permission name to check
 */
export function HasPermission({ children, permission }) {
  return (
    <PermissionGuard permission={permission}>
      {children}
    </PermissionGuard>
  )
}

/**
 * HasRole Component
 * Renders children only if user has the required role
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if user has role
 * @param {string} props.role - Role name to check
 */
export function HasRole({ children, role }) {
  return (
    <PermissionGuard role={role}>
      {children}
    </PermissionGuard>
  )
}

/**
 * IsAdmin Component
 * Renders children only if user is an admin
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if user is admin
 */
export function IsAdmin({ children }) {
  return (
    <PermissionGuard role="admin">
      {children}
    </PermissionGuard>
  )
} 