import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, Card2, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { useToast } from '@/hooks/use-toast';
import { Coins, Plus, AlertTriangle, CreditCard, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';



import { Alert, AlertDescription, AlertTitle} from '../ui/alert';
import { Progress } from '@radix-ui/themes';
import { useRouter } from 'next/router';

// Mock data - in a real app, this would come from your backend
const mockUserBalance = {
  balance: 0.00,  // Changed to 0 to simulate zero balance
  usedMinutes: 20,
  remainingMinutes: 0,
  lowBalanceThreshold: 10.00
};

const formSchema = z.object({
  amount: z
    .number()
    .min(5, { message: "Minimum top-up amount is $5" })
    .max(1000, { message: "Maximum top-up amount is $1000" })
});

const UserBalanceCard = () => {
  const { toast } = useToast();
const router=useRouter()
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 20
    },
  });

  const handleTopUp = async (values) => {
    setIsProcessing(true);
    
    // Mock API call - in a real app, this would be a call to your Stripe integration
    setTimeout(() => {
      // Mock successful payment
      setIsProcessing(false);
      setIsTopUpDialogOpen(false);
      toast({
        title: "Payment Successful",
        description: `$${values.amount.toFixed(2)} added to your balance.`,
      });
      form.reset({ amount: 20 });
    }, 2000);
  };

  const handlePurchasePlan = () => {
    router.push('/')
  };

  const isZeroBalance = mockUserBalance.balance === 0 && mockUserBalance.remainingMinutes === 0;
  
  // Calculate usage percentage for the progress bar
  const totalMinutes = mockUserBalance.usedMinutes + mockUserBalance.remainingMinutes;
  const usagePercentage = (mockUserBalance.usedMinutes / totalMinutes) * 100 || 0;

  return (
    <>
      {/* {isZeroBalance && (
        <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Minutes Remaining</AlertTitle>
          <AlertDescription>
            You have exhausted all your API call minutes. Please purchase a new plan to continue using our services.
            <Button 
              onClick={handlePurchasePlan} 
              variant="outline" 
              className="ml-4 border-red-500 text-red-500 hover:bg-red-500/10"
            >
              Purchase Plan
            </Button>
          </AlertDescription>
        </Alert>
      )} */}

      <Card2 className="bg-gray-900 border-gray-800 overflow-hidden relative">
        <div className={`h-1 ${mockUserBalance.balance <= mockUserBalance.lowBalanceThreshold ? 'bg-amber-500' : 'bg-accent-teal'}`}></div>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Coins className="mr-2 h-5 w-5 text-accent-teal" />
                API Credits Balance
              </CardTitle>
              <CardDescription>Pre-paid credits for API usage</CardDescription>
            </div>
            <div className={`text-2xl font-bold mt-5 ${mockUserBalance.balance <= mockUserBalance.lowBalanceThreshold ? 'text-amber-500' : 'text-accent-teal'}`}>
              ${mockUserBalance.balance.toFixed(2)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-3">
          {/* Added Coming Soon label */}
          <div className="absolute top-3 right-3 inline-flex items-center space-x-1 rounded-md bg-purple-700/90 px-2 py-0.5 text-xs font-semibold text-purple-300 select-none pointer-events-none">
            <span>Coming Soon</span>
          </div>
{/* 
          {mockUserBalance.balance <= mockUserBalance.lowBalanceThreshold && (
            <div className="flex items-center bg-amber-500/10 text-amber-500 px-3 py-2 rounded-md text-sm">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Low balance. Please top up soon to avoid service interruption.</span>
            </div>
          )} */}
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Voice API Usage:</span>
              <span className="text-gray-300">{mockUserBalance.usedMinutes} min / {totalMinutes} min</span>
            </div>
            <Progress value={usagePercentage} className="h-2 bg-gray-800" indicatorClassName="bg-accent-teal" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-accent-teal" />
                <span className="text-sm text-gray-400">Remaining</span>
              </div>
              <div className="text-lg font-medium text-white mt-1">~{mockUserBalance.remainingMinutes} min</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-accent-teal" />
                <span className="text-sm text-gray-400">Cost per min</span>
              </div>
              <div className="text-lg font-medium text-white mt-1">$1.00</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-1">
          <Button 
            onClick={() => setIsTopUpDialogOpen(true)}
            className="w-full bg-accent-teal hover:bg-accent-teal/80 text-black"
          >
            <Plus className="w-4 h-4 mr-2" /> Top Up Balance
          </Button>
        </CardFooter>
      </Card2>

      <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
        <DialogContent className="bg-glass-panel border-subtle-border text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Credit to Your Account</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add funds to your pre-paid balance for API usage.
              Each voice minute costs $1.00.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleTopUp)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (USD)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          type="number"
                          className="bg-glass-panel-light/30 border-subtle-border pl-7"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2 p-3 bg-glass-panel-light/20 rounded-lg">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Current Balance:</span>
                  <span>${mockUserBalance.balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">New Balance After Top-up:</span>
                  <span className="text-white font-medium">${(mockUserBalance.balance + (form.watch('amount') || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Voice Minutes Added:</span>
                  <span className="text-white font-medium">~{Math.floor(form.watch('amount') || 0)} min</span>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsTopUpDialogOpen(false)}
                  type="button"
                  className="border-subtle-border text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-accent-teal hover:bg-accent-teal/80 text-black"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Add Credit'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserBalanceCard;
