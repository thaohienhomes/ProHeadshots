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
  <div className="flex-1 relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-primary-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6 hover:border-cyan-400/40 transition-all duration-300">
      <div className="absolute -top-3 -left-3 bg-gradient-to-r from-cyan-500 to-primary-600 text-white rounded-full px-3 py-1 flex items-center justify-center font-bold text-xs shadow-lg">
        Step {number}
      </div>
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-r from-cyan-500 to-primary-600 text-white p-3 rounded-xl mr-4 shadow-lg">
          {isFirst ? <UploadIcon /> : <ImageIcon />}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      </div>
      <p className="text-navy-300 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

const HeroSteps: React.FC = () => {
  return (
    <section className="relative w-full py-16 pb-24 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-tl from-primary-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-section mx-auto px-section">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-center mb-6">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-primary-200 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto">
            Transform your selfies into professional headshots with our advanced AI technology in just three simple steps.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-stretch gap-8 sm:gap-12">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <Step {...step} isFirst={index === 0} />
              {index < steps.length - 1 && (
                <div className="hidden sm:flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-primary-500" />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                  </div>
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
