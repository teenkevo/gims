import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<
  (typeof client.api.clients)["update-email"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.clients)["update-email"]["$post"]
>;

export const useUpdateClientEmail = () => {
  const router = useRouter();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.clients["update-email"]["$post"]({
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      router.push(`/projects`);
      toast("✅ Successfull operation", {
        description: "Client email has been updated",
      });
    },
    onError: () => {
      toast("❌ Error", {
        description: "Something went wrong",
      });
    },
  });

  return {
    mutation,
  };
};
