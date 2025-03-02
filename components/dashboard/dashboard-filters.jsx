'use client';

import { Calendar, ListFilter } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const DashboardFilters = () => {
  return (
    <div className="flex items-center gap-2">
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
  );
};

export default DashboardFilters; 