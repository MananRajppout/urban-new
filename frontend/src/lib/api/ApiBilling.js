import { Heart } from "lucide-react";
import AxiosInstance from "../axios";


/*
Note: response structure
{
  data: null | any,
  code: number,
  message: string
}

*/
const header = {
  headers: {
    "Content-Type": "application/json",
  },
};


//add payment method from here 
export async function addPaymentMethod(formData) {
    return await AxiosInstance.post(`/api/add-payment-methods`, formData);
  }
  
  //fetch all the added payment method here
  export async function getPaymentMethod() {
    return await AxiosInstance.get(`/api/fetch-payment-methods`);
  }

  // Frontend API call delete or remove payment method
  export async function deletePaymentMethod(card_id) {
    return await AxiosInstance.delete(`/api/delete-payment-method`, {
      data: { card_id },
    });
  }

  //get he payment history here 
  export const getPaymentHistory = async (startDate, endDate, page = 1) => {
    try {
      const response = await AxiosInstance.get("/api/payment/history", {
        params: {
          start_date: startDate,
          end_date: endDate,
          page,
        },
    
      });

      return response.data;
    } catch (err) {
      console.error("Error fetching payment history:", err);
      throw err;
    }
  };
  

  //make default card here 
  export async function makeDefaultCard(card_id) {
    try {
      const response = await AxiosInstance.post('/api/make-default-card', {
        card_id: card_id,
        header
      });
      return response.data; // Success response ko return karo
    } catch (error) {
      console.error("Error while making the card default:", error);
      throw error; // Error handle karne ke liye throw kar sakte hain
    }
  }


  //edit payment data 

  export async function editPaymentMethod(formData) {
    return await AxiosInstance.put(`/api/edit-payment-methods`, formData,header);
  }
  


