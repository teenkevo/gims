import { Metadata } from "next";
import { Header } from "@/features/landing/header";
import { Landing } from "@/features/landing/landing";
import { Beta } from "@/features/landing/beta";

export const metadata: Metadata = {
  title: "GIMS by GETLAB: Unlock the power of your geotechnical data.",
  description:
    "Improve Lab Automation, Increase Data Quality, Accelerate R&D and Stay Cutting Edge.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
  openGraph: {
    title: "GIMS by GETLAB: Unlock the power of your geotechnical data.",
    description:
      "Unlock the power of your Geotechnical Data. Improve Lab Automation, Increase Data Quality, Accelerate R&D and Stay Cutting Edge.",
    images: [
      {
        url: "https://res.cloudinary.com/teenkevo-cloud/image/upload/v1719500024/GIMS-og-image_anv5il.png",
      },
    ],
  },
};

export default function Page() {
  return (
    <section className="relative w-full">
      {/* <Header /> */}
      {/* <Landing /> */}
      <Beta />
    </section>
  );
}
