'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogFooter } from '@/components/ui/dialog'
import { toast } from "react-toastify"
import { usePermissionsStore } from '@/store/permissions-store'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function RoleForm({ role, isEditing = false, onSubmit, onCancel }) {
  const { createRole, updateRole, error, clearError } = usePermissionsStore()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    if (isEditing && role) {
      setFormData({
        id: role.id,
        name: role.name || '',
        description: role.description || '',
        isDefault: role.isDefault || false,
        isSystem: role.isSystem || false
      })
    }
    
    // Clear any previous errors when component mounts or role changes
    setErrors({})
    setServerError(null)
    clearError()
  }, [isEditing, role, clearError])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
    
    // Clear server error when any field is edited
    if (serverError) {
      setServerError(null)
    }
  }

  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      isDefault: checked
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Role name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Role name must be less than 50 characters'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters'
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setServerError(null)
    
    try {
      let result
      
      if (isEditing) {
        result = await updateRole(formData.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          isDefault: formData.isDefault
        })
      } else {
        result = await createRole({
          name: formData.name.trim(),
          description: formData.description.trim(),
          isDefault: formData.isDefault
        })
      }
      
      toast.success(`Role has been ${isEditing ? 'updated' : 'created'} successfully.`)
      
      // Call the onSubmit callback with the form data
      onSubmit(result || formData)
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} role:`, error)
      setServerError(error.message || `Failed to ${isEditing ? 'update' : 'create'} role. Please try again.`)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} role. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 py-4">
        {serverError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="name">
            Role Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter role name"
            className={errors.name ? 'border-red-500' : ''}
            disabled={isEditing && formData.isSystem}
            maxLength={50}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1" id="name-error">{errors.name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the role's purpose and access level"
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
            disabled={isEditing && formData.isSystem}
            maxLength={500}
            aria-invalid={errors.description ? 'true' : 'false'}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1" id="description-error">{errors.description}</p>
          )}
        </div>
        
        {/* <div className="flex items-center space-x-2">
          <Checkbox
            id="isDefault"
            checked={formData.isDefault}
            onCheckedChange={handleCheckboxChange}
            disabled={isEditing && formData.isSystem}
          />
          <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
            Set as default role for new users
          </Label>
        </div> */}
        
        {formData.isDefault && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-md text-sm">
            Note: Setting this role as default will remove the default status from any other role.
          </div>
        )}
        
        {isEditing && formData.isSystem && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-md text-sm">
            System roles cannot be modified. These roles are essential for the system's operation.
          </div>
        )}
      </div>
      <DialogFooter className="flex justify-end gap-3 pt-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitting || (isEditing && formData.isSystem)}
        >
          {isSubmitting 
            ? (isEditing ? 'Updating...' : 'Creating...') 
            : (isEditing ? 'Update Role' : 'Create Role')
          }
        </Button>
      </DialogFooter>
    </form>
  )
}

export default RoleForm 