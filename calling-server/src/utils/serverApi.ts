import axios, { Axios, AxiosResponse } from "axios";
import env from "../config/env.js";

// Create an Axios instance
const serverApi = axios.create({
  baseURL: env.BACKEND_SERVER_URL,
});

serverApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("serverApi error", error.response?.data);
    return {
      error: error.response?.data,
      message: error.response?.data?.message,
    };
  }
);

export default serverApi;
