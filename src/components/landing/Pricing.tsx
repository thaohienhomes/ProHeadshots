import Link from "next/link";

const PricingCard = ({
  plan,
  isPopular,
}: {
  plan: any;
  isPopular: boolean;
}) => (
  <div
    className={`bg-white p-6 rounded-lg shadow-md ${
      isPopular ? "md:border-2 md:border-mainGreen md:scale-110 md:-mt-4 md:-mb-4 md:z-10" : ""
    } flex flex-col relative`}
  >
    {isPopular && (
      <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 inline-flex items-center px-3 py-1.5 rounded-md bg-gradient-to-br from-mainGreen to-[#91b34a] text-mainBlack text-xs font-medium whitespace-nowrap animated-gradient">
        100% MONEY BACK GUARANTEE
      </span>
    )}
    <h3 className="text-lg font-bold text-mainBlack mb-2">{plan.name}</h3>
    <div className="text-3xl font-bold text-mainBlack mb-2">${plan.price}</div>
    <p className="text-sm text-gray-600 mb-4">
      Get {plan.headshots} headshots with unique backgrounds and outfits.
    </p>
    <ul className="text-sm text-gray-600 mb-4 flex-grow">
      {["time", "headshots", "styles"].map((feature, index) => (
        <li key={index} className="flex items-center mb-2">
          <svg
            className="w-4 h-4 mr-2 text-[#91b34a]"
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
          {feature === "time" &&
            `${plan.time} hour${plan.time > 1 ? "s" : ""} turnaround time`}
          {feature === "headshots" && `${plan.headshots} headshots`}
          {feature === "styles" && "Unique backgrounds and clothing"}
        </li>
      ))}
    </ul>
    <Link href="/signup" passHref>
      <button
        className={`w-full py-2 rounded-md transition-colors ${
          isPopular
            ? "bg-mainBlack text-mainWhite hover:bg-opacity-90"
            : "bg-mainWhite text-mainBlack border border-mainBlack hover:bg-gray-100"
        }`}
      >
        Get {plan.headshots} headshots in {plan.time} hour
        {plan.time > 1 ? "s" : ""}
      </button>
    </Link>
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
    <section className="w-full py-12 md:py-24 lg:py-32 bg-mainWhite">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight text-mainBlack">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            The average cost of professional headshots is $300 in EU and the
            U.S. Our packages start at just $29 -{" "}
            <strong>up to 10x less expensive</strong> than traditional options.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-center">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} isPopular={plan.isPopular} />
          ))}
        </div>
      </div>
    </section>
  );
}
