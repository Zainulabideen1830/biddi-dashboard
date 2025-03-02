// frontend/components/auth/sign-in-form.jsx
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
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "react-toastify"
import { useAuthStore } from "@/store/auth-store"

const FormSchema = z.object({
    email: z.string().email({
        message: "Invalid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
})

const SignInForm = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)

    const { setUser, checkAuth } = useAuthStore()
    
    // Remove the useEffect that redirects authenticated users
    // This is now handled by the AuthGuard component

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: searchParams.get('email') || "",
            password: "",
        },
    })

    async function onSubmit(data) {
        try {
            setIsLoading(true)
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include'
            })
    
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Failed to sign in')
            }
    
            // Update auth store with user data
            setUser(result.user)
            
            // Verify auth state is updated
            const isAuthValid = await checkAuth()
            
            if (!isAuthValid) {
                throw new Error('Failed to verify authentication')
            }
            
            toast.success('Signed in successfully!')
            form.reset()

            // Redirect based on user onboarding status
            if (!result.user.has_company_info) {
                router.push('/auth/company-info')
                return
            }
            
            if (!result.user.subscription_status || result.user.subscription_status !== 'ACTIVE') {
                router.push('/auth/payment')
                return
            }
    
            // If user has completed onboarding, go to dashboard
            router.push('/dashboard')
        } catch (error) {
            if (error.message.includes('not verified')) {
                toast.error('Please verify your email before signing in')
                router.push(`/auth/verify-email/resend?email=${encodeURIComponent(data.email)}`)
                return
            }
            
            toast.error(error.message || 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input 
                                    type="email" 
                                    {...field} 
                                    disabled={isLoading}
                                    className="bg-white"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input 
                                    type="password" 
                                    {...field} 
                                    disabled={isLoading}
                                    className="bg-white"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex items-center justify-between">
                    <Link
                        href="/auth/forgot-password"
                        className="text-sm underline"
                        tabIndex={isLoading ? -1 : 0}
                    >
                        Forgot Password?
                    </Link>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </div>
                <div className="text-sm">
                    Don't have an account?{" "}
                    <Link 
                        href="/auth/sign-up" 
                        className="text-primary hover:underline"
                        tabIndex={isLoading ? -1 : 0}
                    >
                        Sign Up
                    </Link>
                </div>
            </form>
        </Form>
    )
}

export default SignInForm