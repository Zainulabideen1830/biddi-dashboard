import ReactECharts from 'echarts-for-react';
import { MoreHorizontal, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GoalProgressCard = ({
  title = 'Goal Progress',
  percentage = 0,
  changePercentage = 0,
  changeText = 'from yesterday',
  metric = 'Total Revenue'
}) => {
  // ECharts option for the circular progress
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      pointer: {
        show: false
      },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: {
          color: '#38BDF8'
        }
      },
      axisLine: {
        lineStyle: {
          width: 16,
          color: [[1, '#384455']]
        }
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      data: [{
        value: percentage,
        detail: {
          show: false
        }
      }],
      title: {
        show: false
      },
      detail: {
        show: false
      }
    }]
  };

  return (
    <Card className="bg-white dark:bg-backgroundSecondary rounded-xl p-4 pb-6 flex flex-col">
      <CardHeader className="flex justify-between flex-row items-center p-0">
        <CardTitle className="">{title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="!size-6 text-[#99B2C6]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Export Data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          <ReactECharts
            option={option}
            style={{ height: '280px' }}
            opts={{ renderer: 'svg' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col justify-center items-center">
            <div className="text-4xl 2xl:text-5xl font-semibold text-secondary-base">{percentage}%</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <div className='bg-[#384455] rounded-full p-1'>
                <ArrowUpRight className="size-3 text-white" />
              </div>
              <span className='text-muted-foreground'>reached</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center flex-wrap gap-2 text-sm">
            <span className="text-[#00B69B] flex items-center gap-1"><TrendingUp className='size-4' /> {changePercentage}%</span>
            <span className="text-[#606060] dark:text-white/90">{changeText}</span>
          </div>
          <div className="inline-flex justify-end mt-2">
            <span className="outline outline-1 outline-[#27344A] text-xs px-2 py-[5px] rounded flex items-center gap-1 text-muted-foreground">
              <span className='size-[14px] rounded-sm bg-secondary-base' />
              {metric}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalProgressCard; 