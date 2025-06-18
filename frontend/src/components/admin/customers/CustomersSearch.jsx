'use client';
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";



export default function CustomersSearch({ searchQuery, setSearchQuery }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-dark-200 border-dark-100 border-none focus:!ring-0 focus:!ring-transparent text-white outline-none"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="bg-dark-200 text-white border-none cursor-pointer">
          <Filter size={16} className="mr-2" />
          Filter
        </Button>
        <Button className="bg-blue-accent hover:bg-blue-600 text-white border-none cursor-pointer">Add Customer</Button>
      </div>
    </div>
  );
}
