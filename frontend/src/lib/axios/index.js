import axios from "axios";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const AxiosInstance = axios.create({
  baseURL: serverUrl,
});

// todo the below code return undefine
// console.log("host-------: ", process.env.SERVER_URL)

// Function to get the bearer token from localStorage
function getBearerToken() {
  return localStorage.getItem("access_token");
}

// Adding token to every request
AxiosInstance.interceptors.request.use(
  async function (config) {
    // await delay(2000) // temp for testing purpose

    // skip on the api
    if (
      config.url == "/api/fetch-price-models" ||
      config.url.includes("api/fetch-blog")
    ) {
      return config;
    }

    const token = getBearerToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// error handling to every request

AxiosInstance.interceptors.response.use(
  (response) => {
    // Return the response data on success
    const res = {
      data: response.data,
      code: response.status,
      message: response.data.message,
    };
    return res;
  },
  (error) => {
    console.log({ error });

    let res = {
      data: error.response?.data,
      code: 0,
      message: error.response?.data?.message,
      error: error,
    };

    if (error.response) {
      // The request was made, and the server responded with an error status

      // The request was made, and the server responded with an error status
      if (error.response.status == 401 || error.response.status == 403) {
        localStorage.removeItem("access_token");
        // window.location.href = "/signin";
      }

      res.code = error.response.status;
      res.message = error.response.data.message;
    } else if (error.request) {
      // The request was made, but no response was received from the server
      const errorMessage = "No response received from the server";
      // Example status code for request timeout

      res.code = 408;
      res.message = errorMessage;
    } else {
      // Something else happened while setting up the request that triggered an error

      res.code = 500;
      res.message = error.message;
    }

    return res;
  }
);

export default AxiosInstance;
