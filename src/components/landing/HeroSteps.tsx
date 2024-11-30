import React from "react";

const steps = [
  {
    number: "1",
    title: "Upload your selfies",
    description:
      "Share a few recent photos. Our AI analyzes them to capture your most photogenic qualities and unique style, usually takes 1-2 minutes.",
  },
  {
    number: "2",
    title: "Download headshots (Studio Quality)",
    description:
      "In minutes, get 100+ studio-quality headshots in various styles. No photographer or studio visit needed. It's that simple!",
  },
];

const UploadIcon: React.FC = () => (
  <svg
    className="w-8 h-8"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const ImageIcon: React.FC = () => (
  <svg
    className="w-8 h-8"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
      clipRule="evenodd"
    />
  </svg>
);

const Step: React.FC<(typeof steps)[0] & { isFirst: boolean }> = ({
  number,
  title,
  description,
  isFirst,
}) => (
  <div className="flex-1 relative bg-opacity-10 bg-mainWhite rounded-lg p-6 transition-all duration-300 hover:bg-opacity-20">
    <div className="absolute -top-3 -left-3 bg-gradient-to-br from-mainGreen to-[#91b34a] text-mainBlack rounded-full px-3 py-1 flex items-center justify-center font-bold text-xs animated-gradient">
      Step {number}
    </div>
    <div className="flex items-center mb-4">
      <div className="bg-gradient-to-br from-mainGreen to-[#91b34a] text-mainBlack p-2 rounded-full mr-4 animated-gradient">
        {isFirst ? <UploadIcon /> : <ImageIcon />}
      </div>
      <h3 className="font-bold text-xl bg-gradient-to-br from-mainGreen to-[#91b34a] text-transparent bg-clip-text animated-gradient">{title}</h3>
    </div>
    <p className="text-sm text-mainWhite opacity-80">{description}</p>
  </div>
);

const HeroSteps: React.FC = () => {
  return (
    <section className="w-full py-12 pb-20 bg-mainBlack">
      <div className="max-w-section mx-auto px-section">
        <h2 className="text-3xl font-semibold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-center mb-16 text-mainWhite">
          How does it work?
        </h2>
        <div className="flex flex-col sm:flex-row justify-center items-stretch gap-6 sm:gap-12">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <Step {...step} isFirst={index === 0} />
              {index < steps.length - 1 && (
                <div className="hidden sm:flex items-center justify-center">
                  <span className="text-mainOrange text-4xl font-bold">→</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSteps;
