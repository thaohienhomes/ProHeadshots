const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-navy-950/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 max-w-md mx-4">
        {/* Animated spinner with gradient */}
        <div className="relative mb-6">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-navy-600 border-t-cyan-400"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-primary-500/20 animate-pulse"></div>
        </div>

        {/* Loading text with gradient */}
        <h3 className="text-2xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyan-400 to-primary-500 bg-clip-text text-transparent">
            Generating Your Headshots
          </span>
        </h3>

        <p className="text-white text-lg mb-2">
          Our AI is working its magic...
        </p>

        <p className="text-navy-300 text-sm mb-4">
          This may take up to 30 seconds
        </p>

        <div className="flex items-center justify-center gap-2 text-navy-300 text-sm">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span>Powered by Flux Pro Ultra & Imagen4</span>
        </div>

        <p className="text-navy-400 text-xs mt-4">
          Please do not close this tab
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
