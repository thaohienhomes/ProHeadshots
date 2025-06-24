import Link from "next/link";

const PricingCard = ({
  plan,
  isPopular,
}: {
  plan: any;
  isPopular: boolean;
}) => (
  <div className="group relative">
    {/* Glow effect for popular plan */}
    {isPopular && (
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-primary-500/20 rounded-2xl blur-lg opacity-100 animate-pulse" />
    )}

    <div
      className={`relative bg-navy-800/50 backdrop-blur-sm border p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 flex flex-col ${
        isPopular
          ? "border-cyan-400/40 md:scale-110 md:-mt-4 md:-mb-4 md:z-10"
          : "border-cyan-400/20 hover:border-cyan-400/40"
      }`}
    >
      {isPopular && (
        <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-primary-600 text-white text-xs font-bold whitespace-nowrap shadow-lg">
          💎 100% MONEY BACK GUARANTEE
        </span>
      )}

      <h3 className="text-xl font-bold text-white mb-3">{plan.name}</h3>
      <div className="text-4xl font-bold text-white mb-3">
        <span className="bg-gradient-to-r from-cyan-400 to-primary-500 bg-clip-text text-transparent">
          ${plan.price}
        </span>
      </div>
      <p className="text-navy-300 text-sm mb-6 leading-relaxed">
        Get {plan.headshots} headshots with unique backgrounds and outfits powered by advanced AI models.
      </p>
      <ul className="text-sm text-navy-300 mb-8 flex-grow space-y-3">
        {["time", "headshots", "styles"].map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="w-5 h-5 mr-3 text-cyan-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span className="text-white">
              {feature === "time" &&
                `${plan.time} hour${plan.time > 1 ? "s" : ""} turnaround time`}
              {feature === "headshots" && `${plan.headshots} headshots`}
              {feature === "styles" && "Unique backgrounds and clothing"}
            </span>
          </li>
        ))}
      </ul>
      <Link href="/auth?mode=signup" passHref>
        <button
          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
            isPopular
              ? "bg-gradient-to-r from-cyan-500 to-primary-600 text-white hover:from-cyan-400 hover:to-primary-500 shadow-lg hover:shadow-xl"
              : "bg-navy-700/50 text-white border border-cyan-400/30 hover:bg-navy-600/50 hover:border-cyan-400/50"
          }`}
        >
          Get {plan.headshots} headshots in {plan.time} hour
          {plan.time > 1 ? "s" : ""}
        </button>
      </Link>
    </div>
  </div>
);

export default function Pricing() {
  const pricingPlans = [
    {
      name: "Basic",
      price: 29,
      headshots: 10,
      time: 3,
      isPopular: false,
    },
    {
      name: "Professional",
      price: 39,
      headshots: 100,
      time: 2,
      isPopular: true,
    },
    {
      name: "Executive",
      price: 59,
      headshots: 200,
      time: 1,
      isPopular: false,
    },
  ];

  return (
    <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-tl from-primary-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-primary-200 bg-clip-text text-transparent">
              Simple, transparent pricing
            </span>
          </h2>
          <p className="text-navy-300 max-w-3xl mx-auto text-lg leading-relaxed">
            The average cost of professional headshots is $300 in EU and the
            U.S. Our packages start at just $29 -{" "}
            <strong className="text-cyan-400">up to 10x less expensive</strong> than traditional options.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 items-center">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} isPopular={plan.isPopular} />
          ))}
        </div>

        {/* Additional info section */}
        <div className="mt-16 text-center">
          <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Powered by Advanced AI Technology
            </h3>
            <p className="text-navy-300 mb-6">
              All plans include access to our cutting-edge AI models: Flux Pro Ultra, Imagen4, and Recraft V3
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span className="text-white">Flux Pro Ultra</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span className="text-white">Imagen4</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="w-2 h-2 bg-accent-500 rounded-full" />
                <span className="text-white">Recraft V3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
