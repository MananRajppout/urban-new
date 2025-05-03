import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import "../../styles/Dialog.css";
import { FaClosedCaptioning, FaCross } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import stripeBadgeTransparent from "@/assets/stripe-badge-transparent.png";

import toast, { useToasterStore } from "react-hot-toast";
import { addPaymentMethod, editPaymentMethod } from "@/lib/api/ApiBilling";


export const AddCreditCardDialog = ({ onClose, fetchPaymentMethods ,paymentId=null}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    console.log(error,'check for error')

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { exp_month, exp_year, last4 ,brand} = paymentMethod.card;

    const formData = new FormData();

    formData.append("payment_method_id", paymentMethod.id);
    formData.append("expiry_month", exp_month);
    formData.append("last4_card_number", last4);
    formData.append("expiry_year", exp_year);
    formData.append("name", brand);
    formData.append("id",paymentId);

    try {
      
      if(paymentId){
        const response = await editPaymentMethod(formData);
        if (response.data.success) {
          toast.success("payment method update successfully");
        } else {
          toast.error("Failed to update payment method");
        }
      }else{
        const response = await addPaymentMethod(formData);
        if (response.data.success) {
          
          toast.success("payment method added successfully");
        } else {
          toast.error("Failed to add payment method");
        }

      }
      fetchPaymentMethods();
      onClose();
    } catch (err) {
      toast.error(err.message);
      setError(err.response ? err.response.data.message : err.message);
    }

    setLoading(false);
  };




  return (
    <div className="dialog-outer" onClick={(e) => close(e.target.className)}>
      <div className="dialog">
        <div className="  rounded-xl p-6 w-full max-w-xl relative ">
          <div
            onClick={onClose}
            className="absolute top-2 right-2  cursor-pointer text-gray-100 "
          >
            <IoMdClose className="w-[30px] h-[30px]" />
          </div>
          <h2 className="center-title">Add Card</h2>
          <form onSubmit={handleSubmit} className="space-y-4 ">
            <div className="border p-2 rounded-md ">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "20px",
                      color: "white",
                    },
                  },
                }}
              />
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <button
              type="submit"
              className={`w-full py-2 px-4  primary flex justify-center  text-white rounded ${
                loading || !stripe
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-600 cursor-pointer"
              }`}
              disabled={loading || !stripe}
            >
              {loading ? "Saving..." : "Add"}
            </button>
            <div className="text-center mt-2">
              <p className="text-sm text-gray-300">
                Guaranteed safe & secure checkout
              </p>
              <div className="flex bg-white rounded-lg justify-center mt-2">
                <img
                  src={stripeBadgeTransparent.src}
                  alt="Visa"
                  className="w-full mx-1"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
