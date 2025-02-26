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
import Link from "next/link"
import { toast } from "react-toastify"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const FormSchema = z.object({
    email: z.string().email({
        message: "Invalid email address.",
    }),
})

const ForgotPasswordForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(data) {
        try {
            setIsLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: data.email }),
                credentials: 'include'
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send reset link')
            }

            toast.success('If an account exists with this email, you will receive a password reset link')
            form.reset()
        } catch (error) {
            toast.error(error.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <p className="text-sm text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending Reset Link...
                        </>
                    ) : (
                        "Send Reset Link"
                    )}
                </Button>
                <div className="text-sm text-center">
                    Remember your password? <Link href="/auth/sign-in" className="text-primary">Sign In</Link>
                </div>
            </form>
        </Form>
    )
}

export default ForgotPasswordForm 