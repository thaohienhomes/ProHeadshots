"use client";

import Image from "next/image";
import FileUploadArea from "./FileUploadArea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/useImageUpload";
import LoadingOverlay from "@/components/LoadingOverlay";
import { getRequiredPhotoCountClient } from "@/utils/photoConfig";

export default function Page() {
  const router = useRouter();
  const [images, setImages] = useState<Array<{ file: File; pixels: number }>>(
    []
  );
  const maxImages = getRequiredPhotoCountClient();
  const { uploadImages, isUploading, error: uploadError } = useImageUpload();
  const [isUploadingState, setIsUploading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const remainingImages = maxImages - images.length;

  const handleContinue = async () => {
    if (images.length === maxImages) {
      setIsUploading(true);
      const success = await uploadImages(images);
      setIsUploading(false);
      if (success) {
        console.log("Images uploaded successfully");
        router.push("info");
      } else {
        setShowErrorModal(true);
      }
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    handleContinue();
  };

  return (
    <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 min-h-screen p-4 pt-8 md:pt-16">
      {isUploadingState && <LoadingOverlay />}
      {/* Progress bar component */}
      <div className="max-w-[280px] mx-auto mb-8">
        <div className="flex justify-between items-center gap-3">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex-1">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  step <= 2
                    ? "bg-gradient-to-r from-cyan-400 to-primary-500 shadow-lg shadow-cyan-400/25"
                    : "bg-navy-700/50 border border-navy-600/30"
                }`}
              ></div>
            </div>
          ))}
        </div>
        <p className="text-sm text-navy-300 mt-3 text-center font-medium">
          Step 2 of 5 - Upload Your Photos
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="flex flex-col p-8 h-full bg-navy-800/30 backdrop-blur-sm border border-cyan-400/20 rounded-2xl">
          <div className="flex-grow">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-primary-200 bg-clip-text text-transparent">
                {images.length === 0
                  ? `Upload ${maxImages} Photos for AI Headshots`
                  : remainingImages > 0
                  ? `Upload ${remainingImages} More Photo${
                      remainingImages !== 1 ? "s" : ""
                    } to Continue`
                  : "Perfect! That's Enough Photos!"}
              </span>
            </h1>
            <p className="text-base md:text-lg text-navy-300 mb-6 leading-relaxed">
              Choose high-quality photos for the best AI-generated headshots.
              Your input directly affects the output quality.
            </p>

            {/* File upload area */}
            <FileUploadArea
              images={images}
              setImages={setImages}
              maxImages={maxImages}
              onContinue={handleContinue}
              setIsUploading={setIsUploading}
            />
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleContinue}
              disabled={images.length !== maxImages}
              className={`py-4 px-8 rounded-xl font-semibold transition-all duration-300 ${
                images.length === maxImages
                  ? "bg-gradient-to-r from-cyan-500 to-primary-600 text-white hover:from-cyan-400 hover:to-primary-500 hover:scale-105 shadow-lg hover:shadow-xl"
                  : "bg-navy-700/50 text-navy-400 cursor-not-allowed border border-navy-600/30"
              }`}
            >
              {images.length === 0
                ? "Upload photos to continue"
                : images.length === maxImages
                ? "Continue to next step →"
                : `Upload ${remainingImages} more photo${
                    remainingImages !== 1 ? "s" : ""
                  } to continue`}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="p-8 bg-navy-800/30 backdrop-blur-sm border border-cyan-400/20 rounded-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-primary-200 bg-clip-text text-transparent">
              Photo Guidelines for AI Headshots
            </span>
          </h2>

          {/* Avoid section */}
          <h3 className="font-semibold text-red-400 mb-3 text-sm md:text-base flex items-center gap-2">
            <span className="text-red-400">❌</span>
            Avoid These in Your Photos:
          </h3>
          <ul className="list-disc list-inside text-xs md:text-sm text-navy-300 mb-6 space-y-1">
            <li>Wearing sunglasses or not looking at the camera</li>
            <li>Busy backgrounds or group photos</li>
            <li>Extreme expressions or poses</li>
            <li>Face too far from or too close to the camera</li>
            <li>Blurry or low-resolution images</li>
          </ul>

          {/* Bad examples */}
          <div className="flex space-x-2 mb-6">
            {[1, 2, 3].map((i) => (
              <Image
                key={i}
                src={`/photoguidelines/bad${i}.png`}
                alt={`Example of photo to avoid for AI headshots ${i}`}
                width={80}
                height={80}
                className="rounded-lg"
                loading="lazy"
              />
            ))}
          </div>

          {/* Ideal section */}
          <h3 className="font-semibold text-cyan-400 mb-3 text-sm md:text-base flex items-center gap-2">
            <span className="text-cyan-400">✅</span>
            Ideal Photo Characteristics:
          </h3>
          <ul className="list-disc list-inside text-xs md:text-sm text-navy-300 mb-6 space-y-1">
            <li>Direct eye contact with the camera</li>
            <li>Single subject with a clean background</li>
            <li>Face occupying at least 20% of the frame</li>
            <li>Flattering angle with clear facial features</li>
            <li>Natural, professional expression</li>
            <li>High-quality, well-lit image</li>
          </ul>

          {/* Good examples */}
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <Image
                key={i}
                src={`/photoguidelines/good${i}.png`}
                alt={`Example of ideal photo for AI headshots ${i}`}
                width={80}
                height={80}
                className="rounded-lg object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>

      {showErrorModal && (
        <div className="fixed inset-0 bg-navy-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy-800/90 backdrop-blur-sm border border-red-400/30 p-8 rounded-2xl max-w-md w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Upload Failed
              </h3>
              <p className="text-navy-300 leading-relaxed">
                We encountered an issue while uploading your images. Please check your connection and try again.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowErrorModal(false)}
                className="flex-1 px-6 py-3 rounded-xl text-white border border-navy-600/50 hover:bg-navy-700/50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-primary-600 text-white hover:from-cyan-400 hover:to-primary-500 transition-all duration-300 hover:scale-105"
              >
                Retry Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
