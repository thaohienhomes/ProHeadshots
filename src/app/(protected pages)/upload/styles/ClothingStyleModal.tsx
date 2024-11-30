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
    <div className="fixed inset-0 bg-mainBlack bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-mainWhite rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
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
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-semibold text-mainBlack mb-4">Select Clothing Style</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {clothingStyles.map((style, index) => (
            <div
              key={index}
              className="group bg-gray-100 rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg cursor-pointer relative flex flex-col h-64"
            >
              <div className="relative h-40" onClick={() => onSelect(style)}>
                <Image
                  src={`${style.image}`}
                  alt={`${style.clothingTitle} style placeholder`}
                  fill
                  className="object-cover transition-opacity group-hover:opacity-90"
                />
              </div>
              <div className="flex flex-col justify-between flex-grow p-3">
                <p className="text-mainBlack font-semibold text-sm line-clamp-2 mb-2">{style.clothingTitle}</p>
                <button
                  className="w-full text-center bg-gray-200 text-gray-700 font-medium py-1.5 rounded text-sm hover:bg-gray-300 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(style);
                  }}
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
