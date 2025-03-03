"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "react-toastify"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useApi } from "@/lib/api"

const FormSchema = z.object({
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

const ResetPasswordForm = ({ token }) => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const api = useApi();

    // Verify we have the necessary parameters
    useEffect(() => {
        if (!token) {
            toast.error("Invalid password reset link")
            router.push('/auth/forgot-password')
        }
    }, [token, router])

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(data) {
        try {
            setIsLoading(true)

            const result = await api.post('/api/auth/reset-password', {
                token: token,
                password: data.password
            })

            if (result.success) {
                toast.success('Password reset successful, please login again')
                router.replace('/auth/sign-in')
            } else {    
                toast.error(result.message || "Something went wrong. Please try again.")
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong. Please try again.")
            if (error.message?.includes('expired')) {
                router.push('/auth/forgot-password')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting Password...
                        </>
                    ) : (
                        "Reset Password"
                    )}
                </Button>
            </form>
        </Form>
    )
}

export default ResetPasswordForm 