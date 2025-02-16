import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.clients)["add-client-to-project"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.clients)["add-client-to-project"]["$post"]
>;

export const useAddClientToProject = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.clients["add-client-to-project"][
        "$post"
      ]({
        json,
      });
      return await response.json();
    },
  });

  return {
    mutation,
  };
};
