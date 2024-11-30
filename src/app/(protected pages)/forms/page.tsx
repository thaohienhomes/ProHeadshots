import { redirect } from "next/navigation";
import FormJourney from "./FormJourney";

export default async function Page() {
  return (
    <div className="w-full min-h-screen">
      <FormJourney />
    </div>
  );
}
