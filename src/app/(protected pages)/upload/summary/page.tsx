import Image from "next/image";
import getUser from "@/action/getUser";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SubmitButton from "./SubmitButton";

// Add this type definition
type StyleItem = {
  backgroundTitle?: string;
  backgroundPrompt?: string;
  clothingTitle?: string;
  clothingPrompt?: string;
};

function getEyeColorClass(color: string) {
  const colorMap: { [key: string]: string } = {
    Hazel: "bg-amber-500",
    Gray: "bg-gray-400",
    "Light brown": "bg-amber-600",
    Blue: "bg-blue-500",
    Green: "bg-green-500",
    "Dark brown": "bg-amber-900",
  };
  return colorMap[color] || "bg-gray-300";
}

async function submitPhotos() {
  "use server";

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    console.error("No authenticated user found");
    return { error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from("userTable")
    .update({
      submissionDate: new Date().toISOString(),
      workStatus: "ongoing",
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user data in Supabase:", error);
    return { error: "Failed to update user data" };
  }

  // Log success message
  console.log(
    "Successfully updated submissionDate and workStatus in Supabase for user:",
    userId
  );

  redirect("/wait"); // Redirect to a thank you page
}

export default async function Page() {
  const userData = await getUser();
  //console.log(userData);
  const user = userData?.[0]; // Assuming the first user in the array

  if (!user) {
    return <div>Error: User data not found</div>;
  }

  const userSelectedStyles =
    user.styles.find((s: any) => s.type === "userSelected")?.styles || [];
  const preSelectedStyles =
    user.styles.find((s: any) => s.type === "preSelected")?.styles || [];

  return (
    <div className="bg-mainWhite min-h-screen p-4 pt-8 md:pt-16 text-center">
      {/* 5-step progress bar */}
      <div className="max-w-[240px] mx-auto mb-5">
        <div className="flex justify-between items-center gap-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step <= 5
                    ? "bg-gradient-to-r from-mainOrange to-mainGreen animate-gradient bg-[length:200%_200%]"
                    : "bg-gray-200"
                }`}
              ></div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-mainBlack mt-2">Step 5 of 5</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-mainBlack mb-2">All done!</h1>
        <p className="text-lg text-mainBlack mb-8">
          No changes can be made once we pass this page over to our AI
          photographer.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-mainBlack mb-4 text-left">
                Your info
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  { label: "Name", value: user.name },
                  { label: "Age", value: user.age },
                  { label: "Body Type", value: user.bodyType },
                  { label: "Height", value: user.height },
                  { label: "Ethnicity", value: user.ethnicity },
                  { label: "Gender", value: user.gender },
                  { label: "Eye color", value: user.eyeColor, color: true },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-2 text-left"
                  >
                    <p className="text-mainBlack text-xs font-medium mb-1">
                      {item.label}
                    </p>
                    <p className="text-mainBlack text-sm">
                      {item.color ? (
                        <span className="flex items-center">
                          <span
                            className={`w-3 h-3 rounded-full mr-2 ${getEyeColorClass(
                              item.value
                            )}`}
                          ></span>
                          {item.value}
                        </span>
                      ) : (
                        item.value
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-mainBlack mb-4 text-left">
                Your styles
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-mainBlack text-sm font-medium mb-2 text-left">
                    Your selection
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    {userSelectedStyles.map(
                      (item: StyleItem, index: number) => (
                        <li
                          key={index}
                          className="text-gray-600 text-sm text-left"
                        >
                          {item.backgroundTitle && item.clothingTitle ? (
                            <>
                              {item.backgroundTitle} - {item.clothingTitle}
                            </>
                          ) : item.backgroundTitle ? (
                            item.backgroundTitle
                          ) : item.clothingTitle ? (
                            item.clothingTitle
                          ) : (
                            'N/A'
                          )}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-mainBlack text-sm font-medium mb-2 text-left">
                    Pre-selected by us
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    {preSelectedStyles.map((item: StyleItem, index: number) => (
                      <li
                        key={index}
                        className="text-gray-600 text-sm text-left"
                      >
                        {item.backgroundTitle && item.clothingTitle ? (
                          <>
                            {item.backgroundTitle} - {item.clothingTitle}
                          </>
                        ) : item.backgroundTitle ? (
                          item.backgroundTitle
                        ) : item.clothingTitle ? (
                          item.clothingTitle
                        ) : (
                          'N/A'
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold text-mainBlack mb-4">
            Your photos
          </h2>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
            {user.userPhotos?.userSelfies.map((photo: any, index: any) => (
              <div
                key={index}
                className="w-full pt-[100%] relative bg-gray-200 rounded-md overflow-hidden"
              >
                <Suspense
                  fallback={
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md"></div>
                  }
                >
                  <Image
                    src={photo}
                    alt={`User photo ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                    loading="lazy"
                    sizes="(max-width: 640px) 20vw, (max-width: 768px) 16.67vw, (max-width: 1024px) 12.5vw, 10vw"
                    quality={80}
                  />
                </Suspense>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4 mb-8">
          <form action={submitPhotos}>
            <SubmitButton />
          </form>

          <p className="text-xs text-gray-500 text-center max-w-xl">
            *By submitting, you agree to our terms, privacy policy, and upload
            requirements. You confirm these are your best photos and understand
            they&apos;ll influence the final result.
          </p>
        </div>
      </div>
    </div>
  );
}
