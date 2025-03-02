'use client';

import { useAuthStore } from '@/store/auth-store';
import { Separator } from '@/components/ui/separator';
import GoalProgressCard from '@/components/dashboard/goal-progress-card';
import SectionHeading from '@/components/shared/section-heading';
import MetricsCards from '@/components/dashboard/metrics-cards';
import MonthlyCalendar from '@/components/dashboard/monthly-calendar';
import DashboardFilters from '@/components/dashboard/dashboard-filters';
import DashboardShortcuts from '@/components/dashboard/dashboard-shortcuts';
import UpgradeAccountCard from '@/components/dashboard/upgrade-account-card';

const DashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="">
      <div className='custom_container pb-5'>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <SectionHeading title="Dashboard" className="text-secondary-base dark:text-white" />
          <DashboardFilters />
        </div>
      </div>
      <Separator />

      <div className='custom_container'>
        <DashboardShortcuts />
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

        <UpgradeAccountCard />

        <MonthlyCalendar />

        <MetricsCards />
      </div>
    </div>
  );
}

export default DashboardPage;