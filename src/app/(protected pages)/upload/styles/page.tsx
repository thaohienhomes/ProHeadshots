// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import ClothingStyleModal from "./ClothingStyleModal";
import styleData from "./styleData.json";
import { updateStyles } from "@/action/updateStyles";

interface BackgroundStyle {
  backgroundTitle: string;
  backgroundPrompt: string;
}

interface ClothingStyle {
  clothingTitle: string;
  clothingPrompt: string;
}

type StyleObject = BackgroundStyle | ClothingStyle;

/**
 * Page component for style selection in the headshot upload process.
 * Allows users to select up to 6 styles for their headshots.
 */
export default function Page() {
  // Update the state type
  const [selectedStyles, setSelectedStyles] = useState<StyleObject[]>([]);
  // State for controlling the visibility of the clothing style modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for storing the currently selected background style
  const [currentBackgroundStyle, setCurrentBackgroundStyle] =
    useState<StyleObject | null>(null);
  // State for tracking processing status
  const [isProcessing, setIsProcessing] = useState(false);

  // Add this new function to check if a style is already selected
  const isStyleSelected = (backgroundStyle: StyleObject) => {
    return selectedStyles.some((style) =>
      style.backgroundTitle.startsWith(backgroundStyle.backgroundTitle)
    );
  };

  const handleCardClick = (style: StyleObject) => {
    if (!isStyleSelected(style)) {
      setCurrentBackgroundStyle(style);
      setIsModalOpen(true);
    }
  };

  const handleSelectClick = (
    backgroundStyle: StyleObject,
    clothingStyle: StyleObject
  ) => {
    if (selectedStyles.length < 6) {
      const newSelectedStyles = [
        ...selectedStyles,
        {
          backgroundTitle: backgroundStyle.backgroundTitle,
          backgroundPrompt: backgroundStyle.backgroundPrompt,
          clothingTitle: clothingStyle.clothingTitle,
          clothingPrompt: clothingStyle.clothingPrompt,
        },
      ];
      setSelectedStyles(newSelectedStyles);
    }
    setIsModalOpen(false);
  };

  /**
   * Handles the deletion of a selected style.
   * Removes the style at the specified index from the selected styles list.
   * @param indexToDelete - The index of the style to be deleted
   */
  const handleDeleteStyle = (indexToDelete: number) => {
    const updatedStyles = selectedStyles.filter(
      (_, index) => index !== indexToDelete
    );
    setSelectedStyles(updatedStyles);
  };

  /**
   * Randomly selects styles to fill up the remaining slots in the Selected styles list.
   */
  const handleChooseForMe = () => {
    const remainingSlots = 6 - selectedStyles.length;
    const newStyles: StyleObject[] = [];

    for (let i = 0; i < remainingSlots; i++) {
      const randomBackgroundStyle =
        styleData.backgroundStyles[
          Math.floor(Math.random() * styleData.backgroundStyles.length)
        ];
      const randomClothingStyle =
        styleData.clothingStyles[
          Math.floor(Math.random() * styleData.clothingStyles.length)
        ];
      newStyles.push({
        backgroundTitle: randomBackgroundStyle.backgroundTitle,
        backgroundPrompt: randomBackgroundStyle.backgroundPrompt,
        clothingTitle: randomClothingStyle.clothingTitle,
        clothingPrompt: randomClothingStyle.clothingPrompt,
      });
    }

    setSelectedStyles([...selectedStyles, ...newStyles]);
  };

  // Update preselectedStyles to use StyleObject
  const preselectedStyles: StyleObject[] = [
    {
      backgroundTitle: "Garden",
      backgroundPrompt: "Lush garden with colorful flowers and green foliage",
      clothingTitle: "White buttoned shirt",
      clothingPrompt: "Person wearing a white buttoned shirt",
    },
    {
      backgroundTitle: "Office",
      backgroundPrompt: "Modern office setting with a desk and computer",
      clothingTitle: "Black sweater",
      clothingPrompt: "Person wearing a black sweater",
    },
    {
      backgroundTitle: "Grey",
      backgroundPrompt: "Neutral grey background",
      clothingTitle: "Light gray suit jacket over a white dress shirt",
      clothingPrompt:
        "Person wearing a light gray suit jacket over a white dress shirt",
    },
    {
      backgroundTitle: "Outdoors",
      backgroundPrompt: "Outdoor scene with trees and a path",
      clothingTitle: "Black sweater",
      clothingPrompt: "Person wearing a black sweater",
    },
  ];

  // Update handleContinue to use the new structure
  const handleContinue = async () => {
    if (selectedStyles.length === 6 && !isProcessing) {
      setIsProcessing(true);
      try {
        await updateStyles({
          userSelected: selectedStyles,
          preSelected: preselectedStyles,
        });
        // The redirect is handled in the server action
      } catch (error) {
        console.error("Error updating styles:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="bg-mainWhite min-h-screen p-4 pt-8 md:pt-16">
      {/* 5-step progress bar */}
      <div className="max-w-[240px] mx-auto mb-5">
        <div className="flex justify-between items-center gap-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step <= 4
                    ? "bg-gradient-to-r from-mainOrange to-mainGreen animate-gradient bg-[length:200%_200%]"
                    : "bg-gray-200"
                }`}
              ></div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-mainBlack mt-2 text-center">
          Step 4 of 5
        </p>
      </div>

      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-mainBlack mb-4 text-center">
          Select 6 styles for your headshots
        </h1>
        <p className="text-lg text-mainBlack mb-8 text-center">
          Choose which background and clothing styles you want to wear for your
          headshots or let us choose for you.
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-mainBlack">
                Portrait styles (for all genders)
              </h2>
              <button
                className={`font-medium px-4 py-2 rounded transition-colors ${
                  selectedStyles.length === 6
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-mainBlack hover:bg-gray-300"
                }`}
                onClick={handleChooseForMe}
                disabled={selectedStyles.length === 6}
              >
                {selectedStyles.length === 6 ? (
                  "Selection complete ✓"
                ) : (
                  <>Choose for me {selectedStyles.length}/6</>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {styleData.backgroundStyles.map((style, index) => (
                <div
                  key={index}
                  className={`group bg-gray-100 rounded-lg shadow-md overflow-hidden transition-shadow ${
                    isStyleSelected(style)
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg cursor-pointer"
                  } relative`}
                >
                  {index < 3 && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-mainOrange to-mainGreen text-mainBlack text-xs font-bold px-2 py-1 rounded-full z-10 animate-gradient bg-[length:200%_200%]">
                      Popular
                    </div>
                  )}
                  <div
                    className="relative"
                    onClick={() =>
                      !isStyleSelected(style) && handleCardClick(style)
                    }
                  >
                    <Image
                      src={`${style.image}`}
                      alt={`${style.backgroundTitle} style placeholder`}
                      width={200}
                      height={200}
                      className="w-full h-40 object-cover transition-opacity group-hover:opacity-90"
                    />
                    <div className="p-3">
                      <p className="text-mainBlack font-semibold text-sm mb-2">
                        {style.backgroundTitle}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <button
                      className={`w-full text-center font-medium py-1.5 rounded text-sm transition-colors ${
                        isStyleSelected(style)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isStyleSelected(style)) {
                          handleCardClick(style);
                        }
                      }}
                      disabled={isStyleSelected(style)}
                    >
                      {isStyleSelected(style) ? "Selected" : "Select +"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/3">
            <h2 className="text-xl font-semibold text-mainBlack mb-4">
              Selected styles
            </h2>
            <div className="bg-gray-100 rounded-lg shadow-md p-4 mb-4">
              <p className="text-mainBlack mb-2 font-medium">
                Selected styles {selectedStyles.length}/6
              </p>
              {selectedStyles.map((style, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 mb-2 text-mainBlack relative shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col pr-8">
                    <span className="font-semibold">
                      {style.backgroundTitle}
                    </span>
                    <span className="text-sm text-gray-500">
                      {style.clothingTitle}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteStyle(index)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
                    aria-label="Delete style"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              {[...Array(6 - selectedStyles.length)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-200 rounded-lg p-3 mb-2 text-gray-500 italic"
                >
                  Style not yet selected
                </div>
              ))}
            </div>

            <div className="bg-gray-100 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-mainBlack mb-2">
                Preselected styles
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {preselectedStyles.map((style, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 text-mainBlack relative shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {style.backgroundTitle}
                      </span>
                      <span className="text-xs text-gray-500">
                        {style.clothingTitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`w-full mt-4 font-medium px-4 py-2 rounded transition-colors ${
                selectedStyles.length === 6 && !isProcessing
                  ? "bg-mainOrange text-mainBlack hover:bg-opacity-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={selectedStyles.length < 6 || isProcessing}
              onClick={handleContinue}
            >
              {isProcessing
                ? "Processing..."
                : selectedStyles.length === 6
                ? "Continue to next step →"
                : `Select ${6 - selectedStyles.length} more style${
                    selectedStyles.length === 5 ? "" : "s"
                  }`}
            </button>
          </div>
        </div>
      </div>

      <ClothingStyleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(clothingStyle) =>
          handleSelectClick(currentBackgroundStyle!, clothingStyle)
        }
        clothingStyles={styleData.clothingStyles}
      />
    </div>
  );
}
