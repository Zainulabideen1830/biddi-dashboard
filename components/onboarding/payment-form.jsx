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
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import Loader from "../shared/loader"
import { useAuthStore } from "@/store/auth-store"
import {  useApi } from "@/lib/api"

const FormSchema = z.object({
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvc: z.string().optional(),
    plan: z.enum(["trial", "monthly", "annually"]),
    userCount: z.number().min(1).default(1),
}).refine((data) => {
    // If plan is not trial, require payment fields
    if (data.plan !== "trial") {
        return data.cardNumber && data.expiryDate && data.cvc;
    }
    return true;
}, {
    message: "Payment information is required for paid plans",
    path: ["cardNumber"], // This will show the error on the cardNumber field
});

const PaymentForm = () => {
    const api = useApi();
    const { updateUser } = useAuthStore()
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            cardNumber: "",
            expiryDate: "",
            cvc: "",
            plan: "trial",
            userCount: 1,
        },
    })
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(data) {
        try {
            setIsLoading(true)

            const result = await api.post('/api/auth/subscription', { ...data, plan: data.plan.toUpperCase() })

            // Update the user state with the updated user data
            if (result.success) {
                if (result.user) {
                    // Only update the user data, preserving authentication state
                    updateUser(result.user)
                }
                
                // Add a small delay to ensure state is updated
                await new Promise(resolve => setTimeout(resolve, 100))
                
                toast.success(data.plan === 'trial' ?
                    'Free trial activated successfully!' :
                    'Payment processed successfully!'
                )
                
                // Redirect to dashboard
                router.push('/dashboard')
            } else {
                throw new Error('User data not returned from server')
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    const watchPlan = form.watch("plan")
    const watchUserCount = form.watch("userCount")

    const calculatePrice = () => {
        const basePrice = watchPlan === "monthly" ? 199 : watchPlan === "annually" ? 159 : 0
        const additionalUserPrice = watchPlan === "monthly" ? 20 : watchPlan === "annually" ? 192 : 0
        const additionalUsers = Math.max(0, watchUserCount - 1)
        return basePrice + (additionalUsers * additionalUserPrice)
    }

    // if (isAuthLoading) {
    //     return <Loader />
    // }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                    <FormLabel>Select A Plan</FormLabel>
                    <div className="space-y-4 mt-1">
                        <FormField
                            control={form.control}
                            name="plan"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="space-y-4">
                                        <div
                                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${watchPlan === "trial" ? "border-secondary-base" : ""
                                                }`}
                                            onClick={() => form.setValue("plan", "trial")}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-secondary-base">14-DAY FREE TRIAL</h3>
                                                    <p className="text-sm font-medium my-1">$0 for 14 days</p>
                                                    <p className="text-sm text-gray-500">
                                                        Full access to all features. No credit card required.
                                                    </p>
                                                </div>
                                                <input
                                                    type="radio"
                                                    checked={watchPlan === "trial"}
                                                    onChange={() => form.setValue("plan", "trial")}
                                                    className="h-4 w-4 text-secondary-base transition-all duration-300"
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${watchPlan === "monthly" ? "border-secondary-base" : ""
                                                }`}
                                            onClick={() => form.setValue("plan", "monthly")}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-secondary-base">PAY MONTHLY</h3>
                                                    <p className="text-sm font-medium my-1">$199 per month</p>
                                                    <p className="text-sm text-gray-500">
                                                        $199/mo for the first user. Additional users start at $20/mo.
                                                    </p>
                                                </div>
                                                <input
                                                    type="radio"
                                                    checked={watchPlan === "monthly"}
                                                    onChange={() => form.setValue("plan", "monthly")}
                                                    className="h-4 w-4 text-secondary-base transition-all duration-300"
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${watchPlan === "annually" ? "border-secondary-base" : ""
                                                }`}
                                            onClick={() => form.setValue("plan", "annually")}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-secondary-base">PAY ANNUALLY</h3>
                                                    <p className="text-sm font-medium my-1">$159 per month</p>
                                                    <p className="text-sm text-gray-500">
                                                        $1,908/yr for the first user. Additional users start at $192/yr.
                                                    </p>
                                                </div>
                                                <input
                                                    type="radio"
                                                    checked={watchPlan === "annually"}
                                                    onChange={() => form.setValue("plan", "annually")}
                                                    className="h-4 w-4 text-secondary-base transition-all duration-300"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {watchPlan !== "trial" && (
                    <div>
                        <FormLabel>Payment Information</FormLabel>
                        <div className="grid grid-cols-6 gap-4 mt-1">
                            <FormField
                                control={form.control}
                                name="cardNumber"
                                render={({ field }) => (
                                    <FormItem className="col-span-4">
                                        {/* <FormLabel>Card Number</FormLabel> */}
                                        <FormControl>
                                            <Input placeholder="4242 4242 4242 4242" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expiryDate"
                                render={({ field }) => (
                                    <FormItem className="col-span-1">
                                        {/* <FormLabel>MM/YY</FormLabel> */}
                                        <FormControl>
                                            <Input placeholder="MM/YY" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cvc"
                                render={({ field }) => (
                                    <FormItem className="col-span-1">
                                        {/* <FormLabel>CVC</FormLabel> */}
                                        <FormControl>
                                            <Input placeholder="CVC" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <FormLabel>Select Users</FormLabel>
                    <div className="flex items-center gap-2 mt-1">
                        <span>I want to start with a total of</span>
                        <select
                            value={watchUserCount}
                            onChange={(e) => form.setValue("userCount", parseInt(e.target.value))}
                            className="border rounded px-2 py-1"
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                        <span>user</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Your first user is included in your base price.
                    </p>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    //only trial plan should be able to proceed for now
                    disabled={isLoading || watchPlan !== "trial"}
                >
                    {isLoading && <Loader2 className="animate-spin mr-2" />}
                    {watchPlan === "trial" ? "Start Free Trial" : `Pay $${calculatePrice()}.00`}
                </Button>
            </form>
        </Form>
    )
}

export default PaymentForm 