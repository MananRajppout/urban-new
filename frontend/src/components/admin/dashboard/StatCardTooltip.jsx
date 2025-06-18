import { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';



export default function StatCardTooltip({ title, content }) {
  return (
    <div className="flex items-center gap-1">
      <span>{title}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info size={16} className="cursor-pointer text-gray-400" />
          </TooltipTrigger>
          <TooltipContent className="max-w-sm bg-dark-100 p-2">
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
