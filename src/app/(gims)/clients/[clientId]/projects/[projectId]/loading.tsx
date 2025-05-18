"use client";
import { MoonLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex justify-center space-x-2 items-center h-screen">
      <MoonLoader color="#16a34a" />
      <p className=" text-lg">GIMS</p>
    </div>
  );
}
