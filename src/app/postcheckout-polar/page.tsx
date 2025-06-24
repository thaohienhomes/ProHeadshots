import { Suspense } from "react";
import PostcheckoutPolarContent from "./PostcheckoutPolarContent";

export default function PostcheckoutPolarPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostcheckoutPolarContent />
    </Suspense>
  );
}
