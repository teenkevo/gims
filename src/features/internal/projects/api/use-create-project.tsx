import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.projects.create)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.projects.create)["$post"]
>;

export const useCreateProject = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.projects.create["$post"]({ json });
      return await response.json();
    },
  });

  return mutation;
};
