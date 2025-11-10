import { useState } from "react";
import { actionData } from "./queryFunctions";
import { useMutation } from "@tanstack/react-query";

const useActionMutation = ({ onSuccessCallback, onErrorCallback } = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: ({ endPoint, body, method }) => actionData(endPoint, method, body),

    onSuccess: (data, variables) => {
      setLoading(false);
      // Global callback
      if (onSuccessCallback) onSuccessCallback(data, variables);
      // Per-call callback
      if (variables?.onSuccessCallback) variables.onSuccessCallback(data);
    },

    onError: (error, variables) => {
      console.log("<<error", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong";

      setError(errorMsg);
      setLoading(false);

      // Global callback
      if (onErrorCallback) onErrorCallback(errorMsg);
      // Per-call callback
      if (variables?.onErrorCallback) variables.onErrorCallback(errorMsg);
    },
  });

  // ✅ Accept dynamic callbacks per request
  const triggerMutation = ({
    endPoint,
    body,
    method = "post",
    onSuccessCallback,
    onErrorCallback,
  }) => {
    setLoading(true);
    mutation.mutate({ endPoint, body, method, onSuccessCallback, onErrorCallback });
  };

  return { triggerMutation, loading, error };
};

export default useActionMutation;
