import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.projects)["update-name"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.projects)["update-name"]["$post"]
>;

export const useUpdateProjectName = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.projects["update-name"]["$post"]({
        json,
      });

      return await response.json();
    },
  });

  return {
    mutation,
  };
};
