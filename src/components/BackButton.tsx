"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => router.back()}
        className="text-white hover:underline cursor-pointer absolute top-0 left-0"
      >
        ← Back
      </button>
    </div>
  );
}
