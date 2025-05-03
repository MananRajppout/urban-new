import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "sonner";
import { debounce } from "lodash";
import { useRouter } from 'next/router';
import { buyPlivoNumber, searchPhoneNumbers } from '@/lib/api/ApiAiAssistant';
import { getPaymentSession } from '@/lib/api/ApiExtra';
import { loadStripe } from '@stripe/stripe-js';

const countryOptions = [
  { id: 'US', name: 'USA', price: '₹299 per month' },
  { id: 'IN', name: 'India', price: '₹799 per month' },
  // { id: 'mt', name: 'Malta', price: '$10 per month + $120 upfront' },
];

const AddNumberDialog = ({ open, onOpenChange, onNumberPurchased, getBoughtPhoneNumber }) => {
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();






 

  // Enhanced Search Function with Debounce
  const handleSearch = useCallback(
    debounce((term) => {
      const searchTermLowerCase = term.toLowerCase();
      setFilteredCountries(
        countries.filter(
          (country) =>
            country && country.name.toLowerCase().includes(searchTermLowerCase)
        )
      );
    }, 300),
    [countries]
  );

  


  // Close Dialog
  function onDialogClose() {
    onOpenChange(false);
    
  }

  async function save() {
    if (!selectedCountry) {
      toast.error("Please select your country code");
      return;
    }
    try {
     
      setIsLoading(true);

  
  
      const res = await buyPlivoNumber(selectedCountry);
      console.log("res", res.code);
      if (
        res.code === 400 
       
      ) {
        toast.error( "Please add a credit card to buy a number.");
        handleAddClick();
      } else if (res.code === 500 ) {
  
        toast.error(res.message + "Insufficient balance");
      } else if (res.code == 200) {
        toast.success(res.message);
      } else {
        toast.error("please check your number");
      }
    
      getBoughtPhoneNumber();
      onDialogClose();
      // getPhoneNumbersForPurchase();
    } catch (error) {
      console.log(error);
    } finally {

      setIsLoading(false);
    }
  }


    async function makePayment(pricing_id) {
      if (!selectedCountry) {
        toast.error("Please select your country code");
        return;
      }
      // setselectedModelId(pricing_id);

      setIsLoading(true);
      const res = await getPaymentSession({ country_iso: selectedCountry });
      if (!res.data) {
        toast.error("Something went wrong");
        setselectedModelId(null);
        return;
      }
      // const stripePublicKey = "pk_test_51OZruHG2IW0ZBJvXA8Grc1gAqvc38VzWteVc04aq9bzDgQ7WR8IvWpIRvDJok4WczhDnaRUZqAXqCbvPgwJ0IoP200K5fGDPq1"
      // const stripePublicKey =
      //   "pk_test_51OZruHG2IW0ZBJvXA8Grc1gAqvc38VzWteVc04aq9bzDgQ7WR8IvWpIRvDJok4WczhDnaRUZqAXqCbvPgwJ0IoP200K5fGDPq1";
      const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
  
      const stripe = await loadStripe(stripePublicKey);
      const result = stripe.redirectToCheckout({
        sessionId: res.data.stripeSessionId,
      });
   

      getBoughtPhoneNumber();
      onDialogClose();
    }
  

  // this function do navigate on the payment method
  const handleAddClick = () => {
    router.push("/ai-assistant/billing?showDialog=true"); // Navigate to the desired route
  };

  // Copy to Clipboard
  function copy(text) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  const countryDropdownItems = useMemo(() => {
    return countries.map((country) => ({
      name: country.name,
      value: country.code,
      icon: country.flag,
    }));
  }, [countries]);

 

 

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-glass-panel-light/30 border-subtle-border text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Purchase New Phone Number</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="country" className="text-sm text-gray-300">Choose Country</label>
            <Select
              value={selectedCountry}
              onValueChange={setSelectedCountry}
            >
              <SelectTrigger id="country" className="bg-glass-panel-light/30 border-subtle-border text-white">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="bg-glass-panel-light border-subtle-border text-white">
                {countryOptions.map((country) => (
                  <SelectItem key={country.id} value={country.id} className="text-white focus:text-white focus:bg-accent-teal/20">
                    <div className="flex justify-between w-full">
                    {/* <img
                            src={country.icon}
                            alt={country.name}
                            className="w-4 h-4"
                          /> */}
                      <span>{country.name}</span>
                      <span className="text-accent-teal ml-2">{country.price}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="border-subtle-border text-white hover:bg-glass-panel-light/40"
          >
            Cancel
          </Button>
          <Button 
            onClick={makePayment} 
            className="bg-accent-teal text-black hover:bg-accent-teal/90"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Purchase"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNumberDialog;
