import Image from 'next/image'
import React from 'react'

const AuthLayout = ({ children }) => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 h-screen max-h-screen'>
            <div className='overflow-y-auto py-10 flex items-center'>
                <div className='w-[90%] max-w-md mx-auto text-[#475569] px-1'>
                    {children}
                </div>
            </div>
            <div className='hidden md:block w-full h-full max-h-screen relative'>
                <div className='absolute inset-0 bg-gradient-to-r from-[#247CFF] from-0% to-[#00B0F4] to-100% mix-blend-multiply'></div>
                {/* Logo in the top center of the image */}
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                    <Image
                        src='/logo-light.svg'
                        alt='logo'
                        width={300}
                        height={300}
                        className='w-[300px] h-auto'
                    />
                </div>
                <Image
                    src='/auth-bg.png'
                    alt='auth-bg'
                    width={500}
                    height={500}
                    priority
                    quality={100}
                    className='w-full h-full object-cover'
                />
            </div>
        </div>
    )
}

export default AuthLayout