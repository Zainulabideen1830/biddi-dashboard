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
    const [resetUrl, setResetUrl] = useState(null)
    const [showResetLink, setShowResetLink] = useState(false)
    const [userEmail, setUserEmail] = useState("");
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

            setResetUrl(result.resetUrl)
            setShowResetLink(true)
            setUserEmail(data.email)
            toast.success('If an account exists with this email, you will receive a password reset link')
            form.reset()
        } catch (error) {
            toast.error(error.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }


    if (showResetLink) {
        return (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                {resetUrl && (
                    <div className="text-sm mb-5">
                        <Link
                            href={resetUrl}
                            target="_blank"
                            className="text-red-700 hover:underline mb-9 italic"
                        >
                            During the development phase, please click here to reset your password
                        </Link>
                    </div>
                )}
                <p className="text-sm text-blue-700">
                    A password reset link has been sent to <strong>{userEmail}</strong>
                    . Please check your inbox and click the reset link.
                </p>
            </div>
        )
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