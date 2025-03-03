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
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useApi } from "@/lib/api"

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
    const [isResending, setIsResending] = useState(false)
    const [countdown, setCountdown] = useState(60)

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
        },
    })

    const api = useApi();

    // Countdown effect
    useEffect(() => {
        let timer;
        if (countdown > 0 && showResetLink) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [countdown, showResetLink]);

    async function onSubmit(data) {
        try {
            setIsLoading(true)
            const result = await api.post('/api/auth/forgot-password', { email: data.email })

            if (result.success) {
                setResetUrl(result.resetUrl)
                setShowResetLink(true)
                setUserEmail(data.email)
                setCountdown(60) // Initialize countdown
                toast.success('If an account exists with this email, you will receive a password reset link')
                form.reset()
            } else {
                toast.error(result.message || "Something went wrong. Please try again.")
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    async function resendResetLink() {
        try {
            setIsResending(true)
            const result = await api.post('/api/auth/forgot-password', { email: userEmail })

            if (result.success) {
                setResetUrl(result.resetUrl)
                setCountdown(60) // Reset countdown
                toast.success('A new password reset link has been sent to your inbox')
            } else {
                throw new Error(result.message || "Failed to resend reset link")
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong. Please try again.")
        } finally {
            setIsResending(false)
        }
    }

    if (showResetLink) {
        return (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                {resetUrl && (
                    <div className="text-sm mb-5">
                        <Link
                            href={resetUrl}
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
                <div className="mt-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resendResetLink}
                        disabled={countdown > 0 || isResending}
                        className="text-xs"
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Resending...
                            </>
                        ) : countdown > 0 ? (
                            `Resend link (${countdown}s)`
                        ) : (
                            "Resend reset link"
                        )}
                    </Button>
                </div>
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