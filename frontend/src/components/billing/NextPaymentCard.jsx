

import React from 'react';
import { Card, Card2, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

const NextPaymentCard = ({ plan }) => {

  return (
  
    <Card2 className="bg-gray-900 border-gray-800 col-span-full md:col-span-1">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-1">
           <h2 className="text-lg font-medium text-white">Next Payment</h2>
           <div className="flex items-start mt-2">
            <CalendarClock className="w-5 h-5 mr-2 text-accent-teal mt-0.5" />
            <div>
               <div className="text-lg font-medium text-white">{plan[0]?.cost}</div>
               <div className="text-gray-400 text-sm">Due on {plan[0]?.cost.next_payment || "Not Provided"}</div>
             </div>
          </div>

          <div className="border-t border-gray-800 mt-4 pt-4">
  {/* AI Voice Plan */}
  {plan?.filter(p => p.name !== "Phone Number")
    ?.map((p, index) => (
      <div className="flex justify-between items-center mb-2" key={index}>
        <span className="text-gray-400">{p.name}</span>
        <span className="text-white">
          {p.currency.toLowerCase() === "inr" ? `₹${p.cost}` : `$${p.cost}`}
        </span>
      </div>
    ))}

  {/* Phone Numbers Total */}
  {(() => {
    const phonePlans = plan?.filter(p => p.name === "Phone Number");
    const totalPhoneCost = phonePlans?.reduce((acc, p) => acc + p.cost, 0);
    const currency = phonePlans[0]?.currency?.toLowerCase() === "inr" ? "₹" : "$";

    return phonePlans.length > 0 ? (
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400">Phone Numbers ({phonePlans.length})</span>
        <span className="text-white">
          {currency}{totalPhoneCost.toFixed(2)}
        </span>
      </div>
    ) : null;
  })()}

  {/* Total Section */}
  <div className="border-t border-gray-800 pt-2 mt-2">
    <div className="flex justify-between items-center">
      <span className="text-gray-300 font-medium">Total</span>
      <span className="text-white font-medium">
        {(() => {
          const totalCost = plan?.reduce((acc, p) => acc + p.cost, 0);
          const currency = plan[0]?.currency?.toLowerCase() === "inr" ? "₹" : "$";
          return `${currency}${totalCost.toFixed(2)}`;
        })()}
      </span>
    </div>
  </div>
</div>


<div className="mt-4">
  <Dialog>
    <DialogTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-accent-teal border-accent-teal hover:bg-accent-teal/10"
      >
        View Payment Schedule
      </Button>
    </DialogTrigger>
    <DialogContent className="bg-gray-900 border-gray-800">
      <DialogHeader>
        <DialogTitle className="text-white">Payment Schedule</DialogTitle>
        <DialogDescription>
          Your upcoming billing dates and amounts
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2 py-4">
  {plan?.map((payment, i) => (
    <div
      key={i}
      className="flex justify-between items-center p-2 border-b border-gray-800 last:border-0"
    >
      <span className="text-gray-300">{payment.next_payment} ({payment.name})</span>
      <span className="text-white">
        {payment.currency.toUpperCase()} ₹ {payment.cost}
      </span>
    </div>
  ))}
</div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" className="text-white">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>

         </div>
      </CardContent>
    </Card2>
  );
};

export default NextPaymentCard;
