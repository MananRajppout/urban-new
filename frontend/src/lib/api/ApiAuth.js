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

export async function logIn(email, password) {
  let data = {
    email,
    password
  };
  console.log("login data",email)
  return await AxiosInstance.post("/api/login", data, header);
}




export async function signUp(email, password) {
  let data = {
    email,
    password
  };
  return await AxiosInstance.post("/api/register-user", data, header);
}


export async function iosLogIn(data){
  return await AxiosInstance.post("/api/auth/google-ios-login", data, header);
}

//   export async function getPayoutHistory(sortBy: string, sortOrder: string, page: number, perPage: number, status: string) {
//     return await AxiosInstance.get(`/api/get-payouts?sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&perpage=${perPage}&status=${status}`, header) as any as AxiosResult<PayoutHistoryData>;
//   }

//   export async function updatePayoutStatus(payoutId: string, status: string, transactionId: string) {
//     let data = {
//       status,
//       transaction_id: transactionId
//     };
//     return await AxiosInstance.put('/api/update-payout-status/' + payoutId, data, header) as any as AxiosResult<any>;
//   }

