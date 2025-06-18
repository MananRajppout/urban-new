'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CustomersTabs({ activeTab, setActiveTab, children }) {
  return (
    <TooltipProvider>
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-dark-200 border-dark-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="all">All Customers</TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-dark-100 p-2 text-white">
              <p>All registered customers regardless of status or plan type</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="active">Active</TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-dark-100 p-2 text-white">
              <p>Customers who have made at least one call in the last 30 days OR have made any payment in the last 30 days</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-dark-100 p-2 text-white">
              <p>Customers who have NOT made any calls in the last 30 days AND have NOT made any payments in the last 30 days</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-dark-100 p-2 text-white">
              <p>Customers on any paid plan (Basic, Professional, or Enterprise)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="free">Free</TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-dark-100 p-2 text-white">
              <p>Customers who are not subscribed to any paid plan</p>
            </TooltipContent>
          </Tooltip>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {children}
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}
