import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<
  (typeof client.api.projects)["update-name"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.projects)["update-name"]["$post"]
>;

export const useUpdateProjectName = () => {
  const router = useRouter();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.projects["update-name"]["$post"]({
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      router.push(`/projects`);
      toast("✅ Successfull operation", {
        description: "Project name has been updated",
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
