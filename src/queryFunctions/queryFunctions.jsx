import axios from "axios";
import base_url from "../utils/BaseUrl"
import { useUserStore } from "../stores/useUserStore";

 

const api = axios.create({
  baseURL: base_url,
});

api.interceptors.request.use(
  async (config) => {
    // ✅ Always fetch the latest token dynamically
    const token = useUserStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const { redirected403, setRedirected403 } = useDataStore.getState();

//     if (error.response?.status === 403 && !redirected403) {
//       setRedirected403(true); // ✅ only once
//       window.location.href = "/access-denied";
//     }

//     return Promise.reject(error);
//   }
// );
       
// GET
export const fetchData = async (endPoint) => {
  const response = await api.get(endPoint);
  return response.data;
};

// POST PUT DELETE
// POST PUT DELETE
export const actionData = async (endPoint, method, body) => {
  const isFormData = body instanceof FormData;
  const hasBody = method !== "get" && method !== "delete" && body;

  const config = {
    url: endPoint,
    method,
  };

  if (hasBody) {
    config.data = body;
  }

  // ✅ Set proper headers based on content type
  if (isFormData) {
    config.headers = {
      "Content-Type": "multipart/form-data",
    };
  } else if (body) {
    config.headers = {
      "Content-Type": "application/json",
    };
  }

  console.log("API CALL →", endPoint, isFormData ? "FormData" : "JSON");

  const response = await api.request(config);
  return response.data;
};

