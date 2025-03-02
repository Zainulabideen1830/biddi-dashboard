'use client';

import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const UpgradeAccountCard = () => {
  return (
    <div className='mt-14 bg-secondary-base rounded-[20px] px-4 sm:px-6 py-8 lg:py-8 lg:px-8 xl:px-12 xl:py-12 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-[6.33px_6.33px_57px_0px_#0000000D]'>
      <div className='flex flex-row md:flex-col gap-10'>
        <div className='flex flex-col gap-2 text-white'>
          <h3 className='text-2xl sm:text-3xl font-semibold'>Upgrade Your Account to biddi Pro+</h3>
          <p className='max-w-[550px] text-sm sm:text-base'>With a biddi Pro+ account you get many additional and convenient features to control your finances.</p>
        </div>
        <Button variant="primary" size="xl" className="flex xl:hidden bg-white hover:bg-white/90 hover:scale-105 transition-all duration-300 rounded-full w-[50px] sm:w-[60px] h-[50px] sm:h-[60px] justify-center items-center">
          <ArrowUpRight className="!size-6 sm:!size-7 text-secondary-base" />
        </Button>
      </div>
      <div className='flex items-center justify-center md:justify-end relative'>
        <div className='xl:absolute top-1/2 left-0 xl:-translate-y-1/2'>
          <Image
            src="/upgra.png"
            alt="pro-plus"
            width={280}
            height={306}
            className='w-[250px] md:w-[220px] lg:w-[280px] max-w-[280px] h-auto'
          />
        </div>
        <div>
          <Button variant="primary" size="xl" className="hidden xl:flex bg-white hover:bg-white/90 hover:scale-105 transition-all duration-300 rounded-full w-[60px] h-[60px] justify-center items-center">
            <ArrowUpRight className="!size-7 text-secondary-base" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeAccountCard; 