"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Copy, Check } from "lucide-react"
import { toast } from "react-toastify"
import { useApi } from "@/lib/api"

export const AddUser = () => {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        role_id: ''
    })
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [roles, setRoles] = useState([])
    const [isLoadingRoles, setIsLoadingRoles] = useState(false)
    const [invitationUrl, setInvitationUrl] = useState('')
    const [isCopied, setIsCopied] = useState(false)
    const api = useApi()

    // Fetch roles when dialog opens
    useEffect(() => {
        if (open) {
            fetchRoles()
        } else {
            // Reset form when dialog closes
            setFormData({ email: '', role_id: '' })
            setErrors({})
            setInvitationUrl('')
        }
    }, [open])

    const fetchRoles = async () => {
        try {
            setIsLoadingRoles(true)
            const response = await api.get('/api/rbac/roles')
            
            if (response.success) {
                setRoles(response.data)
            } else {
                throw new Error(response.message || 'Failed to fetch roles')
            }
        } catch (error) {
            toast.error('Failed to load roles. Please try again.')
            console.error('Error fetching roles:', error)
        } finally {
            setIsLoadingRoles(false)
        }
    }

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
    }

    const handleRoleChange = (value) => {
        setFormData(prev => ({
            ...prev,
            role_id: value
        }))
        
        if (errors.role_id) {
            setErrors(prev => ({
                ...prev,
                role_id: null
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }
        
        if (!formData.role_id) {
            newErrors.role_id = 'Role is required'
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
        
        try {
            const response = await api.post('/api/invitations', formData)
            
            if (response.success) {
                toast.success(`Invitation sent to ${formData.email}`)
                setInvitationUrl(response.invitationUrl)
            } else {
                throw new Error(response.message || 'Failed to send invitation')
            }
        } catch (error) {
            toast.error(error.message || 'Failed to invite user. Please try again.')
            console.error('Error inviting user:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCopyInvitation = () => {
        navigator.clipboard.writeText(invitationUrl)
        setIsCopied(true)
        toast.success('Invitation link copied to clipboard')
        
        // Reset copy state after 2 seconds
        setTimeout(() => {
            setIsCopied(false)
        }, 2000)
    }

    const handleCancel = () => {
        setFormData({ email: '', role_id: '' })
        setErrors({})
        setInvitationUrl('')
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="primary" size="xl">
                    <Plus className='size-4' />
                    Add New User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite User</DialogTitle>
                    <DialogDescription>
                        Send an invitation email to add a new user to your organization.
                    </DialogDescription>
                </DialogHeader>
                {invitationUrl ? (
                    <div className="space-y-4 py-4">
                        <div className="bg-green-50 p-4 rounded-md border border-green-200">
                            <p className="text-green-800 text-sm font-medium">
                                Invitation sent successfully!
                            </p>
                            <p className="text-green-700 text-sm mt-2">
                                An email has been sent to {formData.email} with instructions to join your organization.
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Invitation Link</Label>
                            <div className="flex items-center gap-2">
                                <Input 
                                    value={invitationUrl} 
                                    readOnly 
                                    className="flex-1 text-sm"
                                />
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon"
                                    onClick={handleCopyInvitation}
                                >
                                    {isCopied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                You can also share this link directly with the user.
                            </p>
                        </div>
                        
                        <DialogFooter className="mt-6">
                            <Button type="button" onClick={handleCancel}>
                                Close
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col items-start gap-2">
                                <Label htmlFor="email" className="text-right">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="user@example.com"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div className="flex flex-col items-start gap-2">
                                <Label htmlFor="role" className="text-right">
                                    Role <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.role_id}
                                    onValueChange={handleRoleChange}
                                    disabled={isLoadingRoles}
                                >
                                    <SelectTrigger className={errors.role_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={isLoadingRoles ? 'Loading roles...' : 'Select a role'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role_id && (
                                    <p className="text-xs text-red-500 mt-1">{errors.role_id}</p>
                                )}
                                {formData.role_id && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {roles.find(r => r.id === formData.role_id)?.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <div className="flex items-center justify-end gap-4">
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>   
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Sending...' : 'Invite User'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default AddUser