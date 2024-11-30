"use client";

import Image from "next/image";
import FileUploadArea from "./FileUploadArea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/useImageUpload";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function Page() {
  const router = useRouter();
  const [images, setImages] = useState<Array<{ file: File; pixels: number }>>(
    []
  );
  const maxImages = 15;
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
    <div className="bg-mainWhite min-h-screen p-4 pt-8 md:pt-16">
      {isUploadingState && <LoadingOverlay />}
      {/* Progress bar component */}
      <div className="max-w-[240px] mx-auto mb-5">
        <div className="flex justify-between items-center gap-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step <= 2
                    ? "bg-gradient-to-r from-mainOrange to-mainGreen animate-gradient bg-[length:200%_200%]"
                    : "bg-gray-200"
                }`}
              ></div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-mainBlack mt-2 text-center">
          Step 2 of 5
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="flex flex-col p-6 h-full">
          <div className="flex-grow">
            <h1 className="text-3xl md:text-4xl font-bold text-mainBlack mb-3">
              {images.length === 0
                ? `Upload ${maxImages} photos for AI headshots`
                : remainingImages > 0
                ? `Upload ${remainingImages} more photo${
                    remainingImages !== 1 ? "s" : ""
                  } to continue`
                : "That's enough photos!"}
            </h1>
            <p className="text-base md:text-lg text-mainBlack mb-6">
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
          <div className="flex justify-center mt-6">
            <button
              onClick={handleContinue}
              disabled={images.length !== maxImages}
              className={`py-3 px-6 rounded-full font-semibold transition-colors ${
                images.length === maxImages
                  ? "bg-mainOrange text-mainBlack hover:bg-[#E0B50E]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
        <div className="p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-mainBlack mb-6">
            Photo Guidelines for AI Headshots
          </h2>

          {/* Avoid section */}
          <h3 className="font-semibold text-red-600 mb-2 text-sm md:text-base">
            Avoid These in Your Photos:
          </h3>
          <ul className="list-disc list-inside text-xs md:text-sm text-mainBlack mb-4">
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
          <h3 className="font-semibold text-[#8BC34A] mb-2 text-sm md:text-base">
            Ideal Photo Characteristics:
          </h3>
          <ul className="list-disc list-inside text-xs md:text-sm text-mainBlack mb-4">
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
        <div className="fixed inset-0 bg-mainBlack bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-mainWhite p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-mainBlack mb-4">
              Upload Failed
            </h3>
            <p className="text-mainBlack mb-6">
              We encountered an issue while uploading your images. Please try
              again.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 rounded-full text-mainBlack border border-mainBlack hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-full bg-mainOrange text-mainBlack hover:bg-[#E0B50E]"
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
