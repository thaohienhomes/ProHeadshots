const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-mainBlack/80 flex items-center justify-center z-50">
      <div className="text-center">
        <div
          className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-mainWhite border-t-mainOrange mb-6"
          aria-hidden="true"
        ></div>
        <p className="text-mainWhite font-semibold text-2xl">Loading...</p>
        <p className="text-mainWhite text-lg mt-3">
          This may take up to 30 seconds
        </p>
        <p className="text-mainWhite text-base mt-5">
          Please do not close this tab
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
