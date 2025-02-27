import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { SignUpStepper } from '@/components/auth/sign-up-stepper'

const AuthOnboardingLayout = ({ children }) => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-12 h-screen max-h-screen'>
            <div className='hidden md:block w-full h-full max-h-screen relative col-span-6 2xl:col-span-5'>
                <div
                    className='absolute inset-0 mix-blend-multiply'
                    style={{
                        background: 'linear-gradient(146.21deg, #247CFF 60.83%, #00B0F4 160.23%)'
                    }}
                />
                {/* Image text content on the top of the image */}
                <div className='absolute top-0 left-0 w-full h-full flex flex-col py-5 2xl:py-10 text-white'>
                    <div className='custom_container h-full flex flex-col justify-between'>
                        <div>
                            <h1 className='text-2xl xl:text-[32px] 2xl:text-[40px] font-bold max-w-[500px] leading-snug'>
                                Start winning <span className='text-secondary-base'>more jobs, </span>
                                <br />
                                complete them <span className='text-secondary-base'>on time, </span>
                                <br />
                                and increase <span className='text-secondary-base'>your profits! </span>
                                <br />
                            </h1>
                            <p className='text-sm xl:text-base 2xl:text-[18px] max-w-[480px] mt-3 2xl:mt-7 leading-relaxed'>
                                <span className='text-secondary-base font-bold  text-base xl:text-[18px] 2xl:text-[20px]'>$199 per month</span>
                                <br />
                                $199/mo for first user. Additional users start at $20/mo. Tax is added where required by law.
                            </p>
                            <div className='flex flex-col gap-2 mt-3 2xl:mt-7 text-sm xl:text-base 2xl:text-[18px] leading-relaxed'>
                                <div className='flex items-center gap-2'>
                                    <Icon icon="line-md:plus" width="22" height="22" />
                                    <span>All features included - no hidden fees</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Icon icon="line-md:plus" width="22" height="22" />
                                    <span>Personalized onboarding and training</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Icon icon="line-md:plus" width="22" height="22" />
                                    <span>Initial data imports and integration setup assistance</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Icon icon="line-md:plus" width="22" height="22" />
                                    <span>Phone, email and text support</span>
                                </div>
                            </div>
                            <div className='flex items-center gap-2 mt-3 2xl:mt-8'>
                                <span>Already have an account?</span>
                                <Link href='/auth/sign-in' className='text-secondary-base font-bold'>Login</Link>
                            </div>
                        </div>
                        <Image
                            src='/logo-light.svg'
                            alt='logo'
                            width={152}
                            height={152}
                            className='w-[152px] h-auto'
                        />
                    </div>
                </div>
                <Image
                    src='/aut-signup-bg.png'
                    alt='auth-bg'
                    width={500}
                    height={500}
                    priority
                    quality={100}
                    className='w-full h-full object-cover object-[25%_75%]'
                />
            </div>
            <div className='overflow-y-auto col-span-6 2xl:col-span-7 max-h-screen'>
                <div className='text-[#475569] w-full h-full'>
                    <div className='w-full h-full pt-8'>
                        <SignUpStepper />
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
} 

export default AuthOnboardingLayout