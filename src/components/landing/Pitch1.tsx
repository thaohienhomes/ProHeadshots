import Image from "next/image";
import Link from "next/link";

export default function Pitch1() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-mainWhite text-mainBlack">
      <div className="max-w-section mx-auto px-section">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight text-mainBlack">
            92% of Customers
            <span className="block mt-2 md:mt-4">
              Recommend Our AI Headshots
            </span>
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-mainGreen to-[#91b34a] rounded-2xl shadow-xl overflow-hidden relative animated-gradient">
            <div className="absolute inset-0 bg-mainBlack bg-opacity-5 rounded-2xl"></div>
            <div className="p-8 relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-extrabold flex items-center text-mainBlack">
                  <svg
                    className="w-12 h-12 mr-4 text-mainBlack"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  With CVPHOTO
                </h2>
                <div className="bg-mainBlack text-mainGreen font-bold py-2 px-3 text-sm sm:text-base sm:px-4 rounded-lg whitespace-nowrap">
                  Studio Quality
                </div>
              </div>
              <ol className="space-y-6">
                {[
                  [
                    "Upload your images",
                    "2 minutes",
                    "Choose from your existing photos or capture new selfies on the spot.",
                  ],
                  [
                    "Our AI works its magic",
                    "1-2 hours",
                    "Our AI will pull your most photogenic qualities from the photos you uploaded.",
                  ],
                  [
                    "Select your top picks",
                    "",
                    "It's that simple! Choose your favorites and enjoy your new professional portraits.",
                  ],
                ].map((item, index) => (
                  <li
                    key={index}
                    className="bg-white bg-opacity-50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-opacity-70"
                  >
                    <div className="flex items-center mb-3">
                      <span className="font-black text-4xl text-mainBlack mr-4">
                        {index + 1}
                      </span>
                      <h3 className="font-bold text-xl text-mainBlack">
                        {item[0]}
                      </h3>
                    </div>
                    {item[1] && (
                      <p className="font-semibold text-mainBlack mb-2">
                        ({item[1]})
                      </p>
                    )}
                    <p className="text-mainBlack text-lg">{item[2]}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl shadow-lg overflow-hidden opacity-80 hover:opacity-100 transition-all duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-8 flex items-center text-gray-700">
                <svg
                  className="w-10 h-10 mr-3 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Traditional photoshoot
              </h2>
              <ul className="space-y-4">
                {[
                  "Spend hours finding photographer",
                  "Reach out and await their response",
                  "Spend a meeting to find a convenient time",
                  "Spend hours on clothing and makeup",
                  "Travel to the photographer's studio",
                  "Do the shootings that take hours",
                  "Wait days for the delivery of your edited photos",
                  "Pay a lot of money for the photoshoot",
                ].map((step, index) => (
                  <li
                    key={index}
                    className="flex items-center bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                  >
                    <span className="font-semibold text-gray-500 mr-3">
                      {index + 1}.
                    </span>
                    <span className="text-gray-700 text-lg">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <Link
            href="/signup"
            className="inline-block bg-gradient-to-br from-mainGreen to-[#91b34a] text-mainBlack px-8 py-3 rounded-full font-semibold animated-gradient"
          >
            Generate Your AI Headshots Now
          </Link>
        </div>

        <div className="text-center max-w-xl mx-auto">
          <div className="flex justify-center items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-6 h-6 text-mainOrange"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="italic mb-2">
            &quot;I upgraded my profile picture using this service. It&apos;s
            more affordable than a studio session, yet the quality surpasses a
            home photoshoot.&quot;
          </p>
          <div className="flex items-center justify-center">
            {/* <Image
              src="/placeholder.svg"
              alt="User"
              width={32}
              height={32}
              className="rounded-full mr-2"
            /> */}
            <span className="font-semibold">Alexander</span>
          </div>
        </div>
      </div>
    </section>
  );
}
