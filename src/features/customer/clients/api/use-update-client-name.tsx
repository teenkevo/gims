import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.clients)["update-name"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.clients)["update-name"]["$post"]
>;

export const useUpdateClientName = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.clients["update-name"]["$post"]({
        json,
      });
      return await response.json();
    },
  });

  return {
    mutation,
  };
};
