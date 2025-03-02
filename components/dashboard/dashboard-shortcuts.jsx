'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardShortcuts = () => {
  const shortcuts = [
    { title: 'Start New Bid' },
    { title: 'Add Product / Service' },
    { title: 'Edit Company Info' },
    { title: 'Add Overhead Expense' }
  ];
  
  return (
    <>
      <p className="text-[#809FB8] mt-3 mb-5">Shortcuts</p>
      <div className="flex items-center flex-wrap gap-4">
        {shortcuts.map((shortcut, index) => (
          <Button 
            key={index}
            variant="primary" 
            size="xl" 
            className="shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
          >
            <Plus className="size-4 dark:text-white" />
            <span className='text-white dark:text-white'>{shortcut.title}</span>
          </Button>
        ))}
      </div>
    </>
  );
};

export default DashboardShortcuts; 