'use client';
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";

// Mock data for customers
const customers = [
  {
    id: 1,
    name: "Acme Corp",
    email: "contact@acmecorp.com",
    plan: "Enterprise",
    dateJoined: "2023-05-15",
    status: "active",
    minutesUsed: 5840,
    minutesRemaining: 14160,
  },
  {
    id: 2,
    name: "Globex Inc",
    email: "info@globexinc.com",
    plan: "Professional",
    dateJoined: "2023-07-22",
    status: "active",
    minutesUsed: 3210,
    minutesRemaining: 6790,
  },
  {
    id: 3,
    name: "Initech",
    email: "support@initech.com",
    plan: "Basic",
    dateJoined: "2023-08-05",
    status: "inactive",
    minutesUsed: 450,
    minutesRemaining: 550,
  },
  {
    id: 4,
    name: "Umbrella Corp",
    email: "contact@umbrellacorp.com",
    plan: "No Plan",
    dateJoined: "2023-09-18",
    status: "active",
    minutesUsed: 120,
    minutesRemaining: 0,
  },
  {
    id: 5,
    name: "Stark Industries",
    email: "info@stark.com",
    plan: "Enterprise",
    dateJoined: "2023-04-10",
    status: "active",
    minutesUsed: 9870,
    minutesRemaining: 10130,
  },
  {
    id: 6,
    name: "Wayne Enterprises",
    email: "support@wayne.com",
    plan: "Professional",
    dateJoined: "2023-06-30",
    status: "inactive",
    minutesUsed: 2340,
    minutesRemaining: 7660,
  },
  {
    id: 7,
    name: "Oscorp",
    email: "info@oscorp.com",
    plan: "No Plan",
    dateJoined: "2023-11-05",
    status: "active",
    minutesUsed: 0,
    minutesRemaining: 0,
  },
  {
    id: 8,
    name: "Cyberdyne Systems",
    email: "contact@cyberdyne.com",
    plan: "Basic",
    dateJoined: "2023-10-22",
    status: "active",
    minutesUsed: 780,
    minutesRemaining: 220,
  },
];




export default function CustomersTable({
  searchQuery,
  activeTab,
  sortField,
  sortOrder,
  setSortField,
  setSortOrder,
  data,
  handleDeleteUser
}) {
  const router = useRouter();

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const filteredCustomers = customers
    .filter((customer) => {
      // Filter by search query
      if (
        searchQuery &&
        !customer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter by tab
      if (activeTab === "active" && customer.status !== "active") {
        return false;
      }
      if (activeTab === "inactive" && customer.status !== "inactive") {
        return false;
      }
      if (activeTab === "paid" && customer.plan === "No Plan") {
        return false;
      }
      if (activeTab === "free" && customer.plan !== "No Plan") {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortField === "plan") {
        return sortOrder === "asc"
          ? a.plan.localeCompare(b.plan)
          : b.plan.localeCompare(a.plan);
      }
      if (sortField === "dateJoined") {
        return sortOrder === "asc"
          ? new Date(a.dateJoined).getTime() - new Date(b.dateJoined).getTime()
          : new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime();
      }
      if (sortField === "minutesUsed") {
        return sortOrder === "asc"
          ? a.minutesUsed - b.minutesUsed
          : b.minutesUsed - a.minutesUsed;
      }
      return 0;
    });
  

  

  return (
    <div className="rounded-md border border-dark-100 bg-dark-200">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-dark-200 border-dark-100">
            <TableHead
              className="text-gray-400 cursor-pointer"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center">
                      Customer
                      {getSortIcon("name")}
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm bg-dark-100 p-2">
                      <p>Customer name and email address</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableHead>
            <TableHead
              className="text-gray-400 cursor-pointer"
              onClick={() => handleSort("plan")}
            >
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center">
                      Plan
                      {getSortIcon("plan")}
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm bg-dark-100 p-2">
                      <p>Current subscription plan (Enterprise, Professional, Basic, or No Plan)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableHead>
            <TableHead
              className="text-gray-400 cursor-pointer"
              onClick={() => handleSort("dateJoined")}
            >
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center">
                      Joined
                      {getSortIcon("dateJoined")}
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm bg-dark-100 p-2">
                      <p>Date when the customer first registered</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableHead>
            <TableHead className="text-gray-400">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    Status
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-dark-100 p-2">
                    <p>Account status (active: used service or made payment in last 30 days, inactive: no usage or payment in last 30 days)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead
              className="text-gray-400 cursor-pointer"
              onClick={() => handleSort("minutesUsed")}
            >
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center">
                      Usage
                      {getSortIcon("minutesUsed")}
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm bg-dark-100 p-2">
                      <p>Minutes used and remaining in the customer's current billing cycle</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableHead>
            <TableHead className="text-gray-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data?.map((customer) => (
            <TableRow
              key={customer.id}
              className="hover:bg-dark-100 border-dark-100 cursor-pointer"
            >
              <TableCell className="font-medium">
                <div>
                  <div>{customer.full_name || "Unknown"}</div>
                  <div className="text-sm text-gray-400">{customer.email}</div>
                </div>
              </TableCell>
              <TableCell>
                {customer.voice_ai_status === "inactive" ? (
                  <span className="text-gray-400">No Plan</span>
                ) : (
                  <Badge
                    variant="outline"
                    className={
                      customer.plan === "Enterprise"
                        ? "bg-purple-accent/10 text-purple-accent border-purple-accent/20"
                        : customer.plan === "Professional"
                          ? "bg-blue-accent/10 text-blue-accent border-blue-accent/20"
                          : "bg-green-accent/10 text-green-accent border-green-accent/20"
                    }
                  >
                    {customer.voice_ai_status}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{new Date(customer.created_time).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    customer.is_active
                      ? "bg-green-accent/10 text-green-accent border-green-accent/20"
                      : "bg-red-accent/10 text-red-accent border-red-accent/20"
                  }
                >
                  {customer.is_active ? "active" : "inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <div className="text-sm">
                    {customer.voiceMinutes?.used?.toFixed(2)} / {(customer.voiceMinutes?.used + customer.voiceMinutes?.remaining)?.toFixed(2)} mins
                  </div>
                  <div className="w-full bg-dark-100 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-accent h-2 rounded-full"
                      style={{
                        width: `${(customer.minutesUsed /
                            (customer.voiceMinutes?.used + customer.voiceMinutes?.remaining)) *
                          100
                          }%`,
                      }}
                    />
                  </div>
                </div>

              </TableCell>
              <TableCell className="text-right flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteUser(customer._id)}
                  className="bg-transparent text-red-500 mr-2 border-none cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/super-admin/customers/${customer._id}`);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">View details</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredCustomers.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          <p>No customers found</p>
        </div>
      )}
    </div>
  );
}
