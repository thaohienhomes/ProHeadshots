"use client";

import Image from "next/image";
import { trackDownload } from "@/action/trackDownload";
import React, { useState, useEffect, useMemo } from "react";
import { fixDiscrepancy } from "@/action/fixDiscrepancy";
import { motion } from "framer-motion";
import ProfessionalGallery from "@/components/ui/ProfessionalGallery";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface ImageGalleryProps {
  images: string[];
  downloadHistory: string[];
  userData: {
    id: string;
    name: string;
    planType: "Basic" | "Professional" | "Executive";
    promptsResult: any[]; // Array of generated images
    apiStatus: {
      id: number;
      // ... other fields
    };
  } | null;
}

export default function ImageGallery({
  images,
  downloadHistory: initialDownloadHistory,
  userData,
}: ImageGalleryProps) {
  const [downloadHistory, setDownloadHistory] = useState(
    initialDownloadHistory
  );
  const [promptsResult, setPromptsResult] = useState(
    userData?.promptsResult || []
  );
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = async (index: number) => {
    const imageUrl = displayImages[index];
    const result = await trackDownload(imageUrl, userData);

    if (result.success && result.downloadHistory) {
      setDownloadHistory(result.downloadHistory);
    } else if (!result.success) {
      console.error("Download tracking failed:", result.error);
    }

    try {
      const blob = await fetch(imageUrl).then((response) => response.blob());
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const promptId = promptsResult[index]?.data?.prompt?.id;
      const filename = promptId
        ? `ai-headshot-${promptId}-${index + 1}.png`
        : `ai-generated-image-${index + 1}.png`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  // Calculate remaining headshots
  const getPlanLimit = (planType: string) => {
    switch (planType.toLowerCase()) {
      case "basic":
        return 10;
      case "professional":
        return 100;
      case "executive":
        return 200;
      default:
        return 0;
    }
  };

  const planLimit = userData ? getPlanLimit(userData.planType) : 0;
  const currentCount = userData?.promptsResult?.length || 0;
  const remainingSlots = Math.max(0, planLimit - currentCount);

  useEffect(() => {
    async function checkDiscrepancy() {
      const totalImagesFromPrompts = promptsResult.reduce(
        (total, result) => total + (result.data?.prompt?.images?.length || 0),
        0
      );

      const imageCountsPerPrompt = promptsResult.map(
        (result) => result.data?.prompt?.images?.length || 0
      );

      console.log("Images received:", {
        imagesFromProps: images.length,
        promptResults: promptsResult.length,
        imageCountsPerPrompt,
        totalImagesFromPrompts,
        expectedByPlan: planLimit,
        isCorrect: totalImagesFromPrompts === planLimit,
        difference: planLimit - totalImagesFromPrompts,
      });

      // Check discrepancy based on total images, not prompt count
      const hasDiscrepancy =
        totalImagesFromPrompts < planLimit && userData !== null;

      console.log({
        isDiscrepancyCheck: true,
        totalImages: totalImagesFromPrompts,
        planLimit,
        shouldFix: hasDiscrepancy,
        userData: !!userData,
      });

      if (hasDiscrepancy) {
        console.log("Fixing discrepancy...");
        const updatedPrompts = await fixDiscrepancy(userData);
        console.log("Discrepancy fix result:", !!updatedPrompts);
        if (updatedPrompts) {
          setPromptsResult(updatedPrompts);
        }
      } else {
        console.log("No fix needed:", {
          reason: !userData
            ? "No user data"
            : "Image count meets or exceeds plan limit",
          totalImages: totalImagesFromPrompts,
          planLimit,
        });
        // Only set loading to false if we have all images
        if (totalImagesFromPrompts >= planLimit) {
          setIsLoading(false);
        }
      }
    }
    checkDiscrepancy();
  }, [images.length, planLimit, promptsResult, userData]);

  const displayImages = useMemo(() => {
    if (promptsResult.length > 0) {
      const sortedPrompts = [...promptsResult].sort((a, b) => {
        const dateA = new Date(
          a.data?.prompt?.created_at || a.timestamp
        ).getTime();
        const dateB = new Date(
          b.data?.prompt?.created_at || b.timestamp
        ).getTime();
        return dateB - dateA;
      });

      return sortedPrompts.flatMap((result) => result.data.prompt.images);
    }
    return images;
  }, [promptsResult, images]);

  // Convert images to gallery format
  const galleryImages = useMemo(() => {
    return displayImages.map((src, index) => ({
      id: `image-${index}`,
      src,
      alt: `AI-generated headshot ${index + 1}`,
      title: `Professional Headshot ${index + 1}`,
      category: userData?.planType || 'Professional',
      featured: index < 3, // Mark first 3 as featured
      aspectRatio: 1, // Square aspect ratio
    }));
  }, [displayImages, userData?.planType]);

  // Update to only show skeletons for the difference
  const uniqueImageCount = new Set(displayImages).size;
  const hasDiscrepancy = isLoading && uniqueImageCount < planLimit;
  const skeletonCount = planLimit - uniqueImageCount;

  const handleImageClick = (image: any, index: number) => {
    // Download the image when clicked
    handleDownload(index);
  };

  const handleImageDownload = (image: any) => {
    const index = galleryImages.findIndex(img => img.id === image.id);
    if (index !== -1) {
      handleDownload(index);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            Your AI Generated Headshots
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-navy-300 text-lg max-w-2xl mx-auto mb-8"
          >
            {uniqueImageCount} professional headshots ready for download.
            {hasDiscrepancy && ` ${skeletonCount} more images are still generating.`}
          </motion.p>

          {/* Plan Info */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-3 bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-full px-6 py-3"
          >
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">
              {userData?.planType} Plan - {uniqueImageCount}/{planLimit} Generated
            </span>
          </motion.div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8 p-6 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-400/20 rounded-xl backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold mb-2 text-cyan-400">📅 Important Notice</h3>
          <p className="text-navy-200">
            Your generated images are available for download for the next 30 days.
            To ensure you don&apos;t lose access, please download all images to
            your device at your earliest convenience.
          </p>
        </motion.div>
        {/* Professional Gallery */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <ProfessionalGallery
            images={galleryImages}
            columns={{ mobile: 2, tablet: 3, desktop: 4 }}
            layout="grid"
            showSearch={galleryImages.length > 8}
            showFilters={false}
            showCategories={false}
            enableLightbox={true}
            onImageClick={handleImageClick}
            onImageDownload={handleImageDownload}
            className="mb-8"
          />
        </motion.div>

        {/* Loading/Generating Images Section */}
        {hasDiscrepancy && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-navy-800/30 backdrop-blur-sm border border-navy-700 rounded-xl p-8"
          >
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              🎨 Still Generating ({skeletonCount} remaining)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(skeletonCount)].map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="aspect-square relative overflow-hidden rounded-xl bg-navy-800/50 border border-navy-600"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-navy-800/50 to-blue-500/10 animate-pulse" />

                  {/* Loading spinner and message */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-navy-300 text-xs font-medium text-center leading-tight">
                      Generating your professional headshot...
                    </p>
                    <p className="text-navy-400 text-xs mt-1">
                      1-2 hours remaining
                    </p>
                  </div>

                  {/* Beta badge */}
                  <div className="absolute top-2 right-2 bg-cyan-400/20 text-cyan-400 text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                    Beta V4
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-navy-300 text-sm">
                💡 Your images will appear here automatically once generation is complete.
                You&apos;ll receive an email notification when they&apos;re ready.
              </p>
            </div>
          </motion.div>
        )}

        {/* Download Stats */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-6 bg-navy-800/30 backdrop-blur-sm border border-navy-700 rounded-xl px-8 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{uniqueImageCount}</div>
              <div className="text-navy-300 text-sm">Generated</div>
            </div>
            <div className="w-px h-8 bg-navy-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{downloadHistory.length}</div>
              <div className="text-navy-300 text-sm">Downloaded</div>
            </div>
            <div className="w-px h-8 bg-navy-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{planLimit - uniqueImageCount}</div>
              <div className="text-navy-300 text-sm">Remaining</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
