import Image from "next/image";

interface ClothingStyle {
  clothingTitle: string;
  clothingPrompt: string;
  image: string;  // Add this line
}

interface ClothingStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (style: ClothingStyle) => void;
  clothingStyles: ClothingStyle[];
}

export default function ClothingStyleModal({ isOpen, onClose, onSelect, clothingStyles }: ClothingStyleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-navy-800/90 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-primary-500/5 rounded-2xl" />

        <div className="relative z-10">
          <button
            className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-navy-300 hover:text-white bg-navy-700/50 hover:bg-navy-600/50 rounded-full transition-all duration-300"
            onClick={onClose}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">Select Clothing Style</h2>
            <p className="text-navy-300">Choose the perfect outfit to complement your selected background</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {clothingStyles.map((style, index) => (
              <div
                key={index}
                className="group relative transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-primary-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative bg-navy-700/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl overflow-hidden hover:border-cyan-400/40 transition-all duration-300 flex flex-col h-72">
                  <div className="relative h-48 overflow-hidden" onClick={() => onSelect(style)}>
                    <Image
                      src={`${style.image}`}
                      alt={`${style.clothingTitle} style placeholder`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent" />
                  </div>

                  <div className="flex flex-col justify-between flex-grow p-4">
                    <div>
                      <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                        {style.clothingTitle}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                        <span className="text-navy-300 text-xs">Professional</span>
                      </div>
                    </div>

                    <button
                      className="w-full text-center bg-gradient-to-r from-cyan-500 to-primary-600 text-white font-medium py-2.5 rounded-lg text-sm hover:from-cyan-400 hover:to-primary-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(style);
                      }}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                      Select Style
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
