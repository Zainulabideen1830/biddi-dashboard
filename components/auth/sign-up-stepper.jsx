"use client"

import { usePathname } from 'next/navigation'
import { CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
    { id: 1, name: 'Sign Up', path: '/auth/sign-up' },
    { id: 2, name: 'Company Info', path: '/auth/company-info' },
    { id: 3, name: 'Payment', path: '/auth/payment' }
]

export function SignUpStepper() {
    const pathname = usePathname()

    const getCurrentStepIndex = () => {
        if (pathname.includes('sign-up')) return 0
        if (pathname.includes('company-info')) return 1
        if (pathname.includes('payment')) return 2
        return 0
    }

    const currentStep = getCurrentStepIndex()

    return (
        <div className="mb-10 w-[90%] max-w-xl mx-auto">
            <nav aria-label="Progress">
                <ol className="flex items-center">
                    {steps.map((step, index) => (
                        <li key={step.id} className={`relative flex-1`}>
                            <div className={cn("relative flex flex-col group", index === 1 ? "items-center" : index === 2 ? "items-end" : "items-start")}>
                                <div className="flex flex-col items-center">
                                    <span className="flex items-center">
                                        {index < currentStep ? (
                                            // Completed step
                                            <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-emerald-500 rounded-full">
                                                <CheckIcon className="w-5 h-5 text-white" />
                                            </span>
                                        ) : index === currentStep ? (
                                            // Current step
                                            <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-primary rounded-full text-white">
                                                {step.id}
                                            </span>
                                        ) : (
                                            // Upcoming step
                                            <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-600">
                                                {step.id}
                                            </span>
                                        )}
                                    </span>
                                    {/* if step is completed then make it's color green  */}
                                    <span className={cn('text-sm mt-2 font-medium', index < currentStep ? 'text-emerald-500' : index === currentStep ? 'text-primary' : 'text-gray-500')}>
                                        {step.name}
                                    </span>
                                </div>
                                {/* horizontal line at the right side of first and 2nd step and on the left side of last step */}
                                {index !== steps.length - 1 && (
                                    <div className="absolute top-4 w-full h-0.5 order-2 border-gray-200" aria-hidden="true">
                                        <div className="h-full transition-all duration-300 bg-gray-200" />
                                    </div>
                                )}
                                {index !== 0 && (
                                    <div className="absolute top-4 w-full h-0.5 order-2 border-gray-200" aria-hidden="true">
                                        <div className="h-full transition-all duration-300 bg-gray-200" />
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    )
} 