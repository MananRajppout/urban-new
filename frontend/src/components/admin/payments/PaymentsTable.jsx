'use client';

import { useRouter } from "next/navigation";
import { CreditCard, Check, AlertTriangle, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock data for payments
const payments = [
  {
    id: 1,
    date: "2023-07-15",
    customer: "Acme Corp",
    customerId: 1,
    amount: 499.99,
    status: "completed",
    method: "Credit Card",
    description: "Enterprise Plan - Annual",
    nextBilling: "2024-07-15",
  },
  {
    id: 2,
    date: "2023-07-14",
    customer: "Globex Inc",
    customerId: 2,
    amount: 249.99,
    status: "completed",
    method: "Credit Card",
    description: "Professional Plan - Semi-Annual",
    nextBilling: "2024-01-14",
  },
  {
    id: 3,
    date: "2023-07-10",
    customer: "Initech",
    customerId: 3,
    amount: 99.99,
    status: "failed",
    method: "Credit Card",
    description: "Basic Plan - Monthly",
    nextBilling: null,
  },
  {
    id: 4,
    date: "2023-07-08",
    customer: "Umbrella Corp",
    customerId: 4,
    amount: 19.99,
    status: "completed",
    method: "PayPal",
    description: "Phone Number Purchase",
    nextBilling: null,
  },
  {
    id: 5,
    date: "2023-07-05",
    customer: "Stark Industries",
    customerId: 5,
    amount: 499.99,
    status: "pending",
    method: "Bank Transfer",
    description: "Enterprise Plan - Annual",
    nextBilling: "2024-07-05",
  },
  {
    id: 6,
    date: "2023-07-01",
    customer: "Wayne Enterprises",
    customerId: 6,
    amount: 249.99,
    status: "completed",
    method: "Credit Card",
    description: "Professional Plan - Semi-Annual",
    nextBilling: "2024-01-01",
  },
  {
    id: 7,
    date: "2023-06-28",
    customer: "Cyberdyne Systems",
    customerId: 8,
    amount: 49.99,
    status: "completed",
    method: "PayPal",
    description: "Additional Minutes - 1000",
    nextBilling: null,
  },
  {
    id: 8,
    date: "2023-06-25",
    customer: "Acme Corp",
    customerId: 1,
    amount: 29.99,
    status: "completed",
    method: "Credit Card",
    description: "Phone Number Purchase",
    nextBilling: null,
  },
];



export default function PaymentsTable({
  searchQuery,
  activeTab,
}) {
  const router = useRouter();

  const filteredPayments = payments.filter((payment) => {
    if (
      searchQuery &&
      !payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !payment.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (activeTab === "completed" && payment.status !== "completed") {
      return false;
    }
    if (activeTab === "pending" && payment.status !== "pending") {
      return false;
    }
    if (activeTab === "failed" && payment.status !== "failed") {
      return false;
    }
    if (activeTab === "recurring" && !payment.nextBilling) {
      return false;
    }

    return true;
  });

  return (
    <Card className="bg-dark-200 border-dark-100">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-dark-200 border-dark-100">
            <TableHead className="text-gray-400">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Date</TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-dark-100 p-2">
                    <p>The date when the payment was processed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="text-gray-400">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Customer</TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-dark-100 p-2">
                    <p>The customer who made the payment</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="text-gray-400">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Description</TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-dark-100 p-2">
                    <p>Payment purpose or item purchased</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="text-gray-400">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Amount</TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-dark-100 p-2">
                    <p>The payment amount in USD</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="text-gray-400">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Status</TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-dark-100 p-2">
                    <p>Payment status (completed, pending, or failed)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="text-gray-400">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Method</TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-dark-100 p-2">
                    <p>Payment method used (Credit Card, PayPal, Bank Transfer)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="text-gray-400">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Next Billing</TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-dark-100 p-2">
                    <p>Next scheduled payment date for recurring subscriptions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPayments.map((payment) => (
            <TableRow 
              key={payment.id} 
              className="hover:bg-dark-100 border-dark-100 cursor-pointer"
              onClick={() => router.push(`/admin/customers/${payment.customerId}`)}
            >
              <TableCell>
                {new Date(payment.date).toLocaleDateString()}
              </TableCell>
              <TableCell className="font-medium">{payment.customer}</TableCell>
              <TableCell>{payment.description}</TableCell>
              <TableCell>${payment.amount.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {payment.status === "completed" ? (
                    <Check size={16} className="text-green-accent" />
                  ) : payment.status === "pending" ? (
                    <CalendarClock size={16} className="text-yellow-accent" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-accent" />
                  )}
                  <Badge
                    variant="outline"
                    className={
                      payment.status === "completed"
                        ? "bg-green-accent/10 text-green-accent border-green-accent/20"
                        : payment.status === "pending"
                        ? "bg-yellow-accent/10 text-yellow-accent border-yellow-accent/20"
                        : "bg-red-accent/10 text-red-accent border-red-accent/20"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-gray-400" />
                  {payment.method}
                </div>
              </TableCell>
              <TableCell>
                {payment.nextBilling ? (
                  new Date(payment.nextBilling).toLocaleDateString()
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredPayments.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          <p>No payments found</p>
        </div>
      )}
    </Card>
  );
}
