/**
 * UploadPage Component
 * 
 * This component serves as a redirect handler for the /upload route.
 * It automatically redirects users to the /upload/intro page.
 * 
 * @returns {never} This function never returns as it always redirects.
 */
import { redirect } from "next/navigation";

export default function UploadPage() {
  redirect("/upload/intro");
}
