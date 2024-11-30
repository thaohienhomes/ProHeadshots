// app/postcheckout/page.tsx
import { Suspense } from "react";
import PostcheckoutContent from "./PostcheckoutContent";

export default function Postcheckout() {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<p>Loading payment status...</p>}>
        <PostcheckoutContent />
      </Suspense>
    </div>
  );
}
