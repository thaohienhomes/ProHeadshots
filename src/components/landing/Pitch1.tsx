import Image from "next/image";
import Link from "next/link";

export default function Pitch1() {
  return (
    <section id="features" className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-tl from-primary-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-section mx-auto px-section">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-primary-200 bg-clip-text text-transparent">
              92% of Customers
            </span>
            <span className="block mt-4 text-white">
              Recommend Our AI Headshots
            </span>
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* CoolPix Benefits Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-primary-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-gradient-to-br from-cyan-500 to-primary-600 rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="p-8 relative">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold flex items-center text-white">
                    <svg
                      className="w-12 h-12 mr-4 text-white"
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
                    With CoolPix
                  </h2>
                  <div className="bg-white/20 backdrop-blur-sm text-white font-bold py-2 px-4 text-sm sm:text-base rounded-lg whitespace-nowrap border border-white/30">
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
                      className="bg-white/20 backdrop-blur-sm p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/30 border border-white/20"
                    >
                      <div className="flex items-center mb-3">
                        <span className="font-black text-4xl text-white mr-4">
                          {index + 1}
                        </span>
                        <h3 className="font-bold text-xl text-white">
                          {item[0]}
                        </h3>
                      </div>
                      {item[1] && (
                        <p className="font-semibold text-white/90 mb-2">
                          ({item[1]})
                        </p>
                      )}
                      <p className="text-white/80 text-lg">{item[2]}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Traditional Photoshoot Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-orange-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-navy-800/50 backdrop-blur-sm border border-navy-600 rounded-2xl shadow-lg overflow-hidden hover:border-navy-500 transition-all duration-300">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-8 flex items-center text-white">
                  <svg
                    className="w-10 h-10 mr-3 text-red-400"
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
                      className="flex items-center bg-navy-700/50 backdrop-blur-sm p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:bg-navy-600/50 border border-navy-600/50"
                    >
                      <span className="font-semibold text-navy-300 mr-3">
                        {index + 1}.
                      </span>
                      <span className="text-white text-lg">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <Link
            href="/auth?mode=signup"
            className="inline-block bg-gradient-to-r from-cyan-500 to-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-cyan-400 hover:to-primary-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Generate Your AI Headshots Now
          </Link>
        </div>

        <div className="text-center max-w-xl mx-auto">
          <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8">
            <div className="flex justify-center items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-6 h-6 text-cyan-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="italic mb-4 text-white text-lg leading-relaxed">
              &quot;I upgraded my profile picture using this service. It&apos;s
              more affordable than a studio session, yet the quality surpasses a
              home photoshoot.&quot;
            </p>
            <div className="flex items-center justify-center">
              <span className="font-semibold text-cyan-400">Alexander</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
