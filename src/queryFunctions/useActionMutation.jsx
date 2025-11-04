import { useState } from "react";
import { actionData } from "./queryFunctions";
import { useMutation } from "@tanstack/react-query";

const useActionMutation = ({ onSuccessCallback, onErrorCallback }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: ({ endPoint, body, method }) =>
      actionData(endPoint, method, body),
    onSuccess: (data) => {
      setLoading(false);
      if (onSuccessCallback) onSuccessCallback(data);
    },

    onError: (error) => {
      console.log(error,"<<error");
      
      const errorMsg = error?.response?.data?.message ||error?.response?.data?.error|| "Something went wrong";
      setError(errorMsg);
      setLoading(false);
      if (onErrorCallback) onErrorCallback(errorMsg);
    },
  });

  // 👉 Accept endPoint dynamically
  const triggerMutation = ({ endPoint, body, method = "post" }) => {
    setLoading(true);
    mutation.mutate({ endPoint, body, method });
  };
  return { triggerMutation, loading, error };
};

export default useActionMutation;
