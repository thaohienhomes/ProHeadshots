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
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-4 pt-8 md:pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Enhanced progress bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between items-center gap-3">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex-1 relative">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    step <= 4
                      ? "bg-gradient-to-r from-cyan-500 to-primary-600 shadow-lg"
                      : "bg-navy-700"
                  }`}
                />
                {step <= 4 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-primary-500 rounded-full blur-sm opacity-50" />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-xs text-navy-300">Upload</span>
            <span className="text-xs text-navy-300">Info</span>
            <span className="text-xs text-navy-300">Gender</span>
            <span className="text-xs text-cyan-400 font-medium">Styles</span>
            <span className="text-xs text-navy-300">Review</span>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              AI Model Selection
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Choose Your AI Style Preferences
            </h1>
            <p className="text-navy-300 text-lg max-w-3xl mx-auto">
              Select 6 unique styles powered by Flux Pro Ultra, Imagen4, and Recraft V3.
              Each style will generate multiple professional headshots using advanced AI models.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            <div className="xl:w-2/3">
              {/* AI Models Info */}
              <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6 mb-8">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  AI Models Used
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-navy-300">Flux Pro Ultra</span>
                    <span className="text-cyan-400 font-medium">(Ultra HD)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-primary-500 rounded-full" />
                    <span className="text-navy-300">Imagen4</span>
                    <span className="text-primary-400 font-medium">(Professional)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-accent-500 rounded-full" />
                    <span className="text-navy-300">Recraft V3</span>
                    <span className="text-accent-400 font-medium">(Artistic)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Professional Portrait Styles
                </h2>
                <button
                  className={`font-medium px-6 py-3 rounded-xl transition-all duration-300 ${
                    selectedStyles.length === 6
                      ? "bg-navy-700 text-navy-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-primary-600 text-white hover:from-cyan-400 hover:to-primary-500 shadow-lg hover:shadow-xl hover:scale-105"
                  }`}
                  onClick={handleChooseForMe}
                  disabled={selectedStyles.length === 6}
                >
                  {selectedStyles.length === 6 ? (
                    <>
                      <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                      Selection Complete
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                      AI Choose For Me ({selectedStyles.length}/6)
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {styleData.backgroundStyles.map((style, index) => (
                  <div
                    key={index}
                    className={`group relative transition-all duration-300 ${
                      isStyleSelected(style)
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105 cursor-pointer"
                    }`}
                  >
                    {/* Glow effect */}
                    {!isStyleSelected(style) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-primary-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}

                    <div className="relative bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl overflow-hidden hover:border-cyan-400/40 transition-all duration-300">
                      {index < 3 && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">
                          Popular
                        </div>
                      )}

                      <div
                        className="relative"
                        onClick={() =>
                          !isStyleSelected(style) && handleCardClick(style)
                        }
                      >
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={`${style.image}`}
                            alt={`${style.backgroundTitle} style placeholder`}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent" />
                        </div>

                        <div className="p-4">
                          <h3 className="text-white font-semibold text-sm mb-2">
                            {style.backgroundTitle}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                            <span className="text-navy-300 text-xs">AI Enhanced</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4">
                        <button
                          className={`w-full text-center font-medium py-2.5 rounded-lg text-sm transition-all duration-300 ${
                            isStyleSelected(style)
                              ? "bg-navy-700 text-navy-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-cyan-500 to-primary-600 text-white hover:from-cyan-400 hover:to-primary-500 shadow-lg hover:shadow-xl"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isStyleSelected(style)) {
                              handleCardClick(style);
                            }
                          }}
                          disabled={isStyleSelected(style)}
                        >
                          {isStyleSelected(style) ? (
                            <>
                              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                              </svg>
                              Selected
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Select Style
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>

            <div className="xl:w-1/3">
              <div className="sticky top-24">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Selected Styles
                </h2>

                <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-medium">Progress</span>
                    <span className="text-cyan-400 font-bold">{selectedStyles.length}/6</span>
                  </div>

                  <div className="w-full bg-navy-700 rounded-full h-3 mb-4">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-primary-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${(selectedStyles.length / 6) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-3">
                    {selectedStyles.map((style, index) => (
                      <div
                        key={index}
                        className="group bg-navy-700/50 backdrop-blur-sm border border-cyan-400/10 rounded-lg p-4 relative hover:border-cyan-400/30 transition-all duration-300"
                      >
                        <div className="flex flex-col pr-10">
                          <span className="font-semibold text-white text-sm">
                            {style.backgroundTitle}
                          </span>
                          <span className="text-xs text-navy-300 mt-1">
                            {style.clothingTitle}
                          </span>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                            <span className="text-xs text-cyan-400">AI Enhanced</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteStyle(index)}
                          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Delete style"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
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
                        className="bg-navy-700/30 border border-navy-600/50 rounded-lg p-4 text-navy-400 italic text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-dashed border-navy-500 rounded" />
                          Style slot available
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AI Preselected Styles
                  </h3>
                  <p className="text-navy-300 text-sm mb-4">
                    These styles are automatically included for optimal variety
                  </p>
                  <div className="space-y-3">
                    {preselectedStyles.map((style, index) => (
                      <div
                        key={index}
                        className="bg-navy-700/30 border border-accent-400/20 rounded-lg p-3"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-sm">
                            {style.backgroundTitle}
                          </span>
                          <span className="text-xs text-navy-300 mt-1">
                            {style.clothingTitle}
                          </span>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-1.5 h-1.5 bg-accent-400 rounded-full" />
                            <span className="text-xs text-accent-400">Auto-included</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className={`w-full font-medium px-6 py-4 rounded-xl transition-all duration-300 ${
                    selectedStyles.length === 6 && !isProcessing
                      ? "bg-gradient-to-r from-cyan-500 to-primary-600 text-white hover:from-cyan-400 hover:to-primary-500 shadow-lg hover:shadow-xl hover:scale-105"
                      : "bg-navy-700 text-navy-400 cursor-not-allowed"
                  }`}
                  disabled={selectedStyles.length < 6 || isProcessing}
                  onClick={handleContinue}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing AI Models...
                    </>
                  ) : selectedStyles.length === 6 ? (
                    <>
                      <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      Generate AI Headshots →
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Select {6 - selectedStyles.length} More Style{selectedStyles.length === 5 ? "" : "s"}
                    </>
                  )}
                </button>
              </div>
            </div>
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
