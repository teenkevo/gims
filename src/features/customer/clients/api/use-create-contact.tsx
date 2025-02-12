import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.clients)["create-contact"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.clients)["create-contact"]["$post"]
>;

export const useCreateContact = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.clients["create-contact"]["$post"]({
        json,
      });
      return await response.json();
    },
  });

  return {
    mutation,
  };
};
