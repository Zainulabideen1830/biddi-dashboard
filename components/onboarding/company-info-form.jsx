"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { useAuthStore } from "@/store/auth-store"
import Loader from "../shared/loader"

const FormSchema = z.object({
    businessName: z.string().min(1, {
        message: "Business Name is required",
    }),
    businessAddress: z.string().min(1, {
        message: "Business Address is required",
    }),
})

const CompanyInfoForm = () => {
    const router = useRouter()
    const { user, isLoading: isAuthLoading, setUser } = useAuthStore();

    // Get the actual user object, handling both flat and nested structures
    const actualUser = user?.user ? user.user : user

    // Helper function to check if user has an active subscription
    const hasActiveSubscription = () => {
        return actualUser?.subscription_status === 'ACTIVE';
    }

    // Helper function to check if user has company info
    const hasCompanyInfo = () => {
        return !!actualUser?.has_company_info;
    }

    // Only redirect to dashboard if user has completed the entire onboarding process
    // (both company info and subscription are set)
    if (hasCompanyInfo() && hasActiveSubscription() && !isAuthLoading) {
        router.push('/dashboard')
        return null; // Return null to prevent rendering the form
    }

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            businessName: "",
            businessAddress: "",
        },
    })
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(data) {
        try {
            setIsLoading(true)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/company-info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                throw new Error('Failed to save company information')
            }

            const result = await response.json()

            // Update the user state with the updated user data
            if (result.user) {
                setUser(result.user)
            }

            toast.success('Company information saved successfully')
            router.push('/auth/payment')
        } catch (error) {
            toast.error(error.message || 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    if (isAuthLoading) {
        return <Loader />
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Business Address</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full flex items-center gap-2" disabled={isLoading}>
                    {isLoading && <Loader2 className="animate-spin" />}
                    Next
                </Button>
            </form>
        </Form>
    )
}

export default CompanyInfoForm 