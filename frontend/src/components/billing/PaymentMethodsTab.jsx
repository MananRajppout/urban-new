
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { AddCreditCardDialog } from '../Dialog/AddCreditCardDialog';
import { loadStripe } from '@stripe/stripe-js';
import { deletePaymentMethod, editPaymentMethod, getPaymentMethod, makeDefaultCard } from '@/lib/api/ApiBilling';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { fetchPhoneNumbers } from '@/lib/api/ApiAiAssistant';

const PaymentMethodsTab = () => {
  
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
    const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [phoenNumbers,setPhonenumbers]=useState([]);
  const [editPaymentMethod, setEditPaymentMethod] = useState(null);
  const handleOpenDialog = (method = null) => {
 
    setShowDialog(true);
  };

  const handleOpenEditDialog = (method = null) => {
    setEditPaymentMethod(method); 
    setShowDialog(true);
  };
  const handleCloseDialog = () => {
    setEditPaymentMethod(null);
    setShowDialog(false);
  };
    const fetchPaymentMethods = async () => {
      setLoading(true);
      try {
        const response = await getPaymentMethod();
        console.log('check for paymnet method here bro',response)
        if (response?.data?.success) {
          setPaymentMethods(response.data.payment_methods);
        }
      } catch (error) {
        console.error("Failed to fetch payment methods", error);
      } finally {
        setLoading(false);
      }
    };

 


       // Function to handle making a card default
  const handleMakeDefaultCard = async (card_id) => {
    try {
      const response = await makeDefaultCard(card_id); // Call the API to make the card default
      if (response?.success) {
        toast.success("Update Default Card Successfullt");
        fetchPaymentMethods();
      }
    } catch (error) {
      toast.error("Error making default card:");
      console.error("Error making default card:", error);
    }
  };


  


  //delete payment methods here 
  const handleDeleteCard = async (cardId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this card?"
    );
    if (!confirmed) return;

    try {
      const response = await deletePaymentMethod(cardId);
      if (response?.data?.success) {
        fetchPaymentMethods();
        toast.success(response.data.message);
      } else {
        toast.error("Failed to delete payment method");
      }
    } catch (error) {
      console.error("Error deleting payment method", error);
      toast.error("An error occurred while deleting the payment method.");
    }
  };

    useEffect(() => {
      fetchPaymentMethods();

      if (router.query.showDialog) {
        setShowDialog(true);
      }
    }, [router.query.showDialog]);

   
  
  return (
    <div className="glass-panel rounded-lg p-4 sm:p-6">
{showDialog && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <Elements stripe={stripePromise}>
      <AddCreditCardDialog
        onClose={handleCloseDialog}
        fetchPaymentMethods={fetchPaymentMethods}
        paymentId={editPaymentMethod} 
      />
    </Elements>
  </div>
)}

      
{paymentMethods.map((method, index) => (
  <div
    key={method.id || index}
    className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6"
  >
    <div className="w-12 h-8 bg-glass-panel-light/30 rounded flex items-center justify-center shrink-0">
      <CreditCard className="text-accent-teal w-6 h-6" />
    </div>
    <div className="flex-grow w-full">
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <h3 className="text-white font-medium capitalize">
            {method.brand} •••• {method.last4_card_number}
          </h3>
          <p className="text-gray-400 text-sm">
            Expires {String(method.expiry_month).padStart(2, '0')}/{method.expiry_year}
          </p>
        </div>
        {method.is_default && (
          <Badge
            variant="outline"
            className="border-accent-teal text-accent-teal mt-2 sm:mt-0 w-fit"
          >
            Default
          </Badge>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="text-xs h-8 cursor-pointer" onClick={() => handleOpenEditDialog(method._id)}>
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-8 text-red-400 hover:text-red-300 hover:bg-red-900/10 cursor-pointer"
          onClick={()=>handleDeleteCard(method._id)}
        >
          Remove
        </Button>
      
        <Button
                variant="outline"
       
                  className="text-xs h-8 border-brand-green cursor-pointer"
                  
                  onClick={()=>handleMakeDefaultCard(method._id)}
              >
              Make Default Card
              </Button>
      </div>
    </div>
  </div>
))}

   
      <div className="mt-6 pt-6 border-t border-gray-800">
        <Button variant="outline" size="sm" className="text-accent-teal border-accent-teal hover:bg-accent-teal/10"  onClick={handleOpenDialog} >
          <CreditCard className="w-4 h-4 mr-1" /> Add Payment Method
        </Button>
      </div>
  


    
    </div>
  );
};

export default PaymentMethodsTab;
