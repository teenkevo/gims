import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.clients)["remove-client-from-project"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.clients)["remove-client-from-project"]["$post"]
>;

export const useRemoveClientFromProject = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.clients["remove-client-from-project"][
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
