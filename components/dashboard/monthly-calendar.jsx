'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Check, CircleCheckBig, MoreHorizontal, Receipt, WalletCards } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const updates = [
    {
        id: 1,
        title: 'Estimate 26573 marked as paid',
        description: 'Lorem ipsum dolor sit amet consectetuer',
        icon: WalletCards
    },
    {
        id: 2,
        title: 'Estimate accepted for Project Name',
        description: 'Lorem ipsum dolor sit amet consectetuer',
        icon: CircleCheckBig
    },
    {
        id: 3,
        title: 'Invoice sent to Libby',
        description: 'Lorem ipsum dolor sit amet consectetuer',
        icon: Receipt
    },
    {
        id: 4,
        title: 'Estimate sent to Libby',
        description: 'Lorem ipsum dolor sit amet consectetuer',
        icon: Receipt
    }
];

const MonthlyCalendar = () => {
    return (
        <section className='mt-16'>
            <Card className="bg-white dark:bg-backgroundSecondary max-w-[900px]">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl font-semibold">Your Month at a Glance</CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="size-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Export Calendar</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">There is no event yet</p>
                        <Calendar
                            mode="single"
                            className="w-full"
                            classNames={{
                                months: "w-full",
                                month: "w-full space-y-4",
                                // caption: "flex justify-between pt-1 relative items-center",
                                caption_label: "text-sm font-medium",
                                nav: "space-x-1 flex items-center",
                                nav_button: cn(
                                    buttonVariants({ variant: "outline" }),
                                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                                ),
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex w-full",
                                head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                cell: "h-9 w-full relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                                day: cn(
                                    buttonVariants({ variant: "ghost" }),
                                    "h-9 w-full p-0 font-normal aria-selected:opacity-100"
                                ),
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_today: "bg-accent text-accent-foreground",
                                day_outside: "text-muted-foreground opacity-50",
                                day_disabled: "text-muted-foreground opacity-50",
                                day_hidden: "invisible",
                            }}
                            fixedWeeks
                            showOutsideDays
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium">Latest updates</h4>
                            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                                View all
                            </Button>
                        </div>
                        <div className="space-y-7">
                            {/* increase the visibily of shadow in the dark mode */}
                            {updates.map((update) => (
                                <div key={update.id} className="flex gap-3 shadow-[0px_5px_6px_0px_#EFF1F9CC] dark:shadow-[0px_5px_6px_0px_#000000] rounded-md p-3">
                                    <div className="">
                                        <update.icon className='size-5 text-secondary-base' />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#626679] dark:text-white mb-1">{update.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{update.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
};

export default MonthlyCalendar; 