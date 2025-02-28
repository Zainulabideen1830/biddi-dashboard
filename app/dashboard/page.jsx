'use client';

import { useAuthStore } from '@/store/auth-store';
import RequireAuth from '@/components/auth/require-auth';
import SignOutButton from '@/components/auth/sign-out-button';
import { Calendar, ListFilter, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import GoalProgressCard from '@/components/dashboard/goal-progress-card';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import SectionHeading from '@/components/shared/section-heading';
import MetricsCards from '@/components/dashboard/metrics-cards';
import MonthlyCalendar from '@/components/dashboard/monthly-calendar';

const DashboardPage = () => {
  const { user } = useAuthStore();

  console.log('[dashboard] user: ', user);

  return (
    <div className="pb-20">
      <div className='custom_container pb-5 pt-6'>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <SectionHeading title="Dashboard" className="text-secondary-base dark:text-white" />
          {/* filters */}
          <div className="flex items-center gap-2">
            {/* dropdwon with filter icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white dark:bg-backgroundSecondary">
                  <ListFilter className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Calendar className="size-4" />
                  <span>Today</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* dropdown to select date range: selected date range is displayed in the button(for example Nov 20, 2020 - Dec 19, 2020) */}
            <DropdownMenu className='text-sm'>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white dark:bg-backgroundSecondary">
                  <Calendar className="size-4" />
                  <span>Nov 20, 2020 - Dec 19, 2020</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Calendar className="size-4" />
                  <span>Nov 20, 2020 - Dec 19, 2020</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <Separator />

      <div className='custom_container'>
        <p className="text-[#809FB8] mt-3 mb-5">Shortcuts</p>
        <div className="flex items-center flex-wrap gap-4">
          <Button variant="primary" size="xl" className="shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
            <Plus className="size-4 dark:text-white" />
            <span className='text-white dark:text-white'>Start New Bid</span>
          </Button>
          <Button variant="primary" size="xl" className="shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
            <Plus className="size-4 dark:text-white" />
            <span className='text-white dark:text-white'>Add Product / Service</span>
          </Button>
          <Button variant="primary" size="xl" className="shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
            <Plus className="size-4 dark:text-white" />
            <span className='text-white dark:text-white'>Edit Company Info</span>
          </Button>
          <Button variant="primary" size="xl" className="shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
            <Plus className="size-4 dark:text-white" />
            <span className='text-white dark:text-white'>Add Overhead Expense</span>
          </Button>
        </div>
      </div>

      <div className="custom_container mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GoalProgressCard
            title="Year Goal Progress"
            percentage={88}
            changePercentage={8.5}
            changeText="Up from yesterday"
            metric="Total Revenue"
          />
          <GoalProgressCard
            title="Quarter Goal Progress"
            percentage={88}
            changePercentage={8.5}
            changeText="Up from yesterday"
            metric="Total Revenue"
          />
          <GoalProgressCard
            title="Month Goal Progress"
            percentage={88}
            changePercentage={8.5}
            changeText="Up from yesterday"
            metric="Total Revenue"
          />
        </div>

        <div className='mt-14 bg-secondary-base rounded-[20px] px-4 sm:px-6 py-8 lg:py-8 lg:px-0 xl:px-12 xl:py-12 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-[6.33px_6.33px_57px_0px_#0000000D]'>
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

        <MonthlyCalendar />

        <MetricsCards />
      </div>
    </div>
  );
}

export default DashboardPage;