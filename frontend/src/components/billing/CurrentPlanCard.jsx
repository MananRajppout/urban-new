import { useRouter } from "next/navigation";
import { Card, Card2, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowUpRight } from "lucide-react";

const CurrentPlanCard = ({ plan }) => {
  const router = useRouter();

  console.log(plan);
  const handleUpgradePlan = () => {
    router.push("/subscription-plans?tab=voice");
  };

  return (
    <Card2 className="bg-gray-900 tw-bg-opcacity-1 border-gray-800 col-span-full md:col-span-2">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-col justify-between items-start gap-12">
          <div className="space-y-1">
            <h2 className="text-lg font-medium text-white">Current Plan</h2>
            <div className="text-2xl font-bold text-accent-teal">
              {plan?.name} Plan
            </div>
            <div className="text-gray-400 text-sm  whitespace-nowrap">
              Voice AI • ₹ {plan?.cost} billed {plan?.period}y
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-full sm:mt-6">
    <Button
      variant="outline"
      size="sm"
      className="border-accent-teal text-accent-teal hover:bg-accent-teal/10 w-full sm:w-auto"
      onClick={handleUpgradePlan}
    >
      Upgrade Plan
      <ArrowUpRight className="ml-1 w-4 h-4" />
    </Button>

    {/* Payment Method Info */}
    <div className="flex flex-row items-start gap-1">
      
        <CreditCard className="w-4 h-4 mr-1" />
        <span>{plan?.paymentMethod}</span>
      <div className="text-xs text-gray-400 whitespace-nowrap">
        Default payment method
      </div>
        </div>
        </div>


        </div>

        {/* <div className="mt-4 pt-4 border-t border-gray-800"> */}
          {/* <div className="text-sm text-gray-400">
            Your subscription includes:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols- gap-3 mt-2">
            {plan?.benefits?.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-2 text-gray-300"
              >
                <div className="w-1 h-1 rounded-full bg-accent-teal mt-1"></div>
                <span className="whitespace-normal">{benefit}</span>
              </div>
            ))}
          </div> */}
        {/* </div> */}
      </CardContent>
    </Card2>
  );
};

export default CurrentPlanCard;
