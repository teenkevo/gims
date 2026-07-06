import ContentLoading from "@/components/layout/content-loading";

export function SecurityTabLoading() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <ContentLoading text="Loading" />
    </div>
  );
}
