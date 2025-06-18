'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PaymentsTabs({ activeTab, setActiveTab, children }) {
  return (
    <TooltipProvider>
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-dark-200 border-dark-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="all">All Payments</TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-dark-100 p-2 text-white">
              <p>All payment transactions regardless of status</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-dark-100 p-2 text-white">
              <p>Successfully processed payments</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-dark-100 p-2 text-white">
              <p>Payments that are in progress or awaiting confirmation</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-dark-100 p-2 text-white">
              <p>Payments that were unsuccessful due to errors or declined cards</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-dark-100 p-2 text-white">
              <p>Subscription payments that will be automatically renewed</p>
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
