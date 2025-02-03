import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.projects)["update-dates"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.projects)["update-dates"]["$post"]
>;

export const useUpdateProjectDates = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.projects["update-dates"]["$post"]({
        json,
      });
      return await response.json();
    },
  });

  return {
    mutation,
  };
};
