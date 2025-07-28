import RFIModule from "@/features/customer/rfi/components/rfi";

export default async function RFIPage() {
  return (
    <div className="flex flex-col">
      <div className="flex h-full flex-col">
        <RFIModule />
      </div>
    </div>
  );
}
