import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <div className="bg-mainWhite min-h-screen p-4 pt-8 md:pt-16 text-center">
      {/* 5-step progress bar */}
      <div className="max-w-[240px] mx-auto mb-5">
        <div className="flex justify-between items-center gap-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step === 1
                    ? "bg-gradient-to-r from-mainOrange to-mainGreen animate-gradient bg-[length:200%_200%]"
                    : "bg-gray-200"
                }`}
              ></div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-mainBlack mt-2">Step 1 of 5</p>
      </div>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-mainBlack mb-2">
          Let&apos;s get your headshots done
        </h1>
        <p className="text-base text-mainBlack mb-8">
          This won&apos;t take very long. Let&apos;s get started.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: (
                <Image
                  src="/icons/time.svg"
                  alt="Time icon"
                  width={36}
                  height={36}
                  className="mx-auto"
                />
              ),
              title: "Takes a few minutes",
              description:
                "Make sure you have some available time before you get started.",
            },
            {
              icon: (
                <Image
                  src="/icons/rested.svg"
                  alt="Rested icon"
                  width={36}
                  height={36}
                  className="mx-auto"
                />
              ),
              title: "Be rested and dressed up",
              description:
                "We will require you to take, or upload, a few selfies. Make sure you look fresh.",
            },
            {
              icon: (
                <Image
                  src="/icons/sun.svg"
                  alt="Sun icon"
                  width={36}
                  height={36}
                  className="mx-auto"
                />
              ),
              title: "Good lightning",
              description:
                "For the best results, make sure the uploaded photos are taken in daytime or good lightning",
            },
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">{item.icon}</div>
              <h2 className="text-lg font-semibold text-mainBlack mb-2">
                {item.title}
              </h2>
              <p className="text-sm text-mainBlack">{item.description}</p>
            </div>
          ))}
        </div>

        <Link
          href="/upload/image"
          className="bg-mainBlack text-mainWhite py-3 px-6 rounded-full font-semibold hover:bg-opacity-90 transition-colors inline-block"
        >
          Ok, I am ready →
        </Link>
      </div>
    </div>
  );
}
