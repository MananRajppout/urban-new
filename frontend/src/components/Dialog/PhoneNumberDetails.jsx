import { useState } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
Dialog;
import {
  Phone,
  Calendar,
  Clock,
  User,
  Tag,
  DollarSign,
  AlertTriangle,
  Phone as PhoneIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  IndianRupee,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";
import { makeOutboundCall2, updatePhoneNumber } from "@/lib/api/ApiAiAssistant";
import { formatDuration } from "@/lib/utils";

const aiAgents = [
  { id: 1, name: "Customer Support Agent" },
  { id: 2, name: "Sales Assistant" },
  { id: 3, name: "Technical Support" },
  { id: 4, name: "Appointment Scheduler" },
];

const PhoneNumberDetails = ({
  open,
  onOpenChange,
  phoneNumber,
  onTerminate,
  formData,
  agentsWithAssignedPhoneNumber,
  updatePhNo,
}) => {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [inboundDialogOpen, setInboundDialogOpen] = useState(false);
  const [outboundDialogOpen, setOutboundDialogOpen] = useState(false);
  const [outboundNumber, setOutboundNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!phoneNumber) return null;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  console.log("phoneNumber", phoneNumber);

  const handleTerminate = () => {
    onTerminate(phoneNumber.phone_number);
    onOpenChange(false);
    toast.success(`${phoneNumber.number} has been terminated`);
  };

  const handleAgentAssign = (agentId) => {
    setSelectedAgent(agentId);
    toast.success(`Agent assigned successfully to ${phoneNumber.number}`);
  };

  // const handleOutboundCall = () => {
  //   if (!outboundNumber) {
  //     toast.error("Please enter a phone number");
  //     return;
  //   }

  //   setIsLoading(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     setOutboundDialogOpen(false);
  //     toast.success(`Calling ${outboundNumber}...`);
  //   }, 1500);
  // };
  async function handleOutboundCall(phoneNumber) {
    const from = formData?.phone_number;

    const to = outboundNumber;

    const res = await makeOutboundCall2(from, to);
    if (res.data) {
      toast.success(`calling from ${from} -> ${to}`);
      // setOpenCallHandlerDialog("");
      onOpenChange(false);
    } else {
      toast.error("Failed to call");
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-[#121218] border-[#2a2a35] text-white sm:max-w-md p-0 flex flex-col">
          <ScrollArea className="h-[calc(100vh-2rem)] px-6 pt-6">
            <SheetHeader>
              <SheetTitle className="text-white flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent-teal/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-accent-teal" />
                </div>
                <span>{phoneNumber.number}</span>
              </SheetTitle>
              <SheetDescription className="text-gray-400">
                Phone number details and management
              </SheetDescription>
            </SheetHeader>

            <div className="pt-6 space-y-5">
              {/* Top Actions - Assign Agent & Call Buttons */}
              <div className="space-y-4">
                <div className="bg-[#1a1a24] rounded-lg p-4 border border-[#2a2a35]">
                  <label className="text-sm text-gray-400 mb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-accent-teal" />
                    Assign AI Agent
                    <Info className="w-3 h-3 text-gray-500 cursor-help" />
                  </label>
                  <Select
                    value={formData?.agent_id}
                    onValueChange={(value) => updatePhNo(value)}
                  >
                    <SelectTrigger className="bg-[#232330] border-[#2a2a35] text-white">
                      <SelectValue placeholder="Select an AI agent" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#232330] border-[#2a2a35] text-white">
                      {agentsWithAssignedPhoneNumber.map((agent) => (
                        <SelectItem
                          key={agent._id}
                          value={agent._id}
                          className="text-white focus:text-white focus:bg-accent-teal/20"
                        >
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-accent-teal text-black hover:bg-accent-teal/90"
                    onClick={() => setInboundDialogOpen(true)}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Inbound Call
                  </Button>
                  {/* <Button 
                    className="flex-1 bg-accent-purple text-white hover:bg-accent-purple/90"
                    onClick={() => handleOutboundCall(phoneNumber.number)}
                  >
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Outbound Call
                  </Button> */}

                  <Button
                    className="flex-1 bg-accent-purple text-white hover:bg-accent-purple/90"
                    onClick={() => setOutboundDialogOpen(true)}
                  >
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Outbound Call
                  </Button>
                </div>
              </div>

              {/* Phone Details Cards */}
              <div className="grid grid-cols-1 gap-4 pb-6">
                {/* Status */}
                <div className="flex items-center gap-3 bg-[#1a1a24] p-3 rounded-lg border border-[#2a2a35]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      phoneNumber.status === "active"
                        ? "bg-sentiment-positive/20 text-sentiment-positive"
                        : "bg-sentiment-positive/20 text-sentiment-positive"
                      // : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="font-medium text-white">
                      {phoneNumber.status}
                    </p>
                  </div>
                </div>

                {/* Purchase Date */}
                <div className="flex items-center gap-3 bg-[#1a1a24] p-3 rounded-lg border border-[#2a2a35]">
                  <div className="w-8 h-8 rounded-full bg-accent-teal/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-accent-teal" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Purchased On</p>
                    <p className="font-medium text-white">
                      {formatDate(phoneNumber?.date_purchased)}
                    </p>
                  </div>
                </div>

                {/* Minutes Used */}
                <div className="flex items-center gap-3 bg-[#1a1a24] p-3 rounded-lg border border-[#2a2a35]">
                  <div className="w-8 h-8 rounded-full bg-accent-teal/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-accent-teal" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Minutes Used</p>
                    <p className="font-medium text-white">
                      {formatDuration(phoneNumber.total_call_duration)}
                    </p>
                  </div>
                </div>

                {/* Assigned Agents */}
                <div className="flex items-center gap-3 bg-[#1a1a24] p-3 rounded-lg border border-[#2a2a35]">
                  <div className="w-8 h-8 rounded-full bg-accent-teal/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-accent-teal" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      Current Assigned Agents
                    </p>
                    <p className="font-medium text-white">
                      {phoneNumber.agent_name ? phoneNumber.agent_name : "None"}
                    </p>
                  </div>
                </div>

                {/* Type */}
                <div className="flex items-center gap-3 bg-[#1a1a24] p-3 rounded-lg border border-[#2a2a35]">
                  <div className="w-8 h-8 rounded-full bg-accent-teal/10 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-accent-teal" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Type</p>
                    <p className="font-medium text-white">
                      {phoneNumber.number_type
                        ? phoneNumber.number_type
                        : phoneNumber.country === "IN"
                        ? "Local"
                        : "Toll Free"}
                    </p>
                  </div>
                </div>

                {/* Cost & Next Payment */}
                <div className="flex items-center gap-3 bg-[#1a1a24] p-3 rounded-lg border border-[#2a2a35]">
                  <div className="w-8 h-8 rounded-full bg-accent-teal/10 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-accent-teal" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Cost</p>
                    <p className="font-medium text-white">
                      {phoneNumber.country === "IN"
                        ? "₹499 per month"
                        : "₹199per month"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Next payment:{" "}
                      {new Date(phoneNumber.renewal_date).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="px-6 py-4 border-t border-[#2a2a35] mt-auto">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Terminate Number
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#121218] border-[#2a2a35] text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">
                    Terminate Phone Number
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Are you sure you want to terminate this phone number? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#2a2a35] text-white hover:bg-[#1a1a24]">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleTerminate}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Terminate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={inboundDialogOpen} onOpenChange={setInboundDialogOpen}>
        <DialogContent className="bg-[#121218] border-[#2a2a35] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-accent-teal" />
              Inbound Call Instructions
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-[#1a1a24] p-5 rounded-lg border border-[#2a2a35]">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-accent-teal/10 flex items-center justify-center">
                  <PhoneIcon className="w-7 h-7 text-accent-teal" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Make an Inbound Call
                </h3>
                <p className="text-gray-400">
                  To make an inbound call, simply dial the number from any
                  phone:
                </p>
                <div className="bg-[#232330] py-3 px-5 rounded-lg mt-2 font-mono text-accent-teal">
                  {phoneNumber.number}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Your call will be connected to the assigned AI agent.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setInboundDialogOpen(false)}
              className="w-full bg-accent-teal text-black hover:bg-accent-teal/90"
            >
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={outboundDialogOpen} onOpenChange={setOutboundDialogOpen}>
        <DialogContent className="bg-[#121218] border-[#2a2a35] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-accent-purple" />
              Make an Outbound Call
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="outbound-number"
                className="text-sm text-gray-400"
              >
                Enter phone number with country code
              </label>
              <Input
                id="outbound-number"
                placeholder="+1 (555) 123-4567"
                value={outboundNumber}
                onChange={(e) => setOutboundNumber(e.target.value)}
                className="bg-[#232330] border-[#2a2a35] text-white"
              />
              <p className="text-xs text-gray-500">
                The call will be made using{" "}
                <span className="text-accent-teal">{phoneNumber.number}</span>
                and connected to the assigned AI agent.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOutboundDialogOpen(false)}
              className="border-[#2a2a35] text-white hover:bg-[#1a1a24]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOutboundCall}
              className="bg-accent-purple text-white hover:bg-accent-purple/90"
              disabled={isLoading}
            >
              {isLoading ? "Calling..." : "Call Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhoneNumberDetails;
