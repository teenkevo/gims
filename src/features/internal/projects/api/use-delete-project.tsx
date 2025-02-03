import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.projects.delete)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.projects.delete)["$post"]
>;

export const useDeleteProject = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.projects.delete["$post"]({ json });
      return await response.json();
    },
  });

  return {
    mutation,
  };
};
