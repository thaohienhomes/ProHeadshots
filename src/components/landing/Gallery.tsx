"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import InfiniteScrollGallery from "@/components/ui/InfiniteScrollGallery";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const people = [
  {
    name: "Karin",
    review:
      "What a fun experience! Turned out amazing and saved me money from expensive photographer",
    selfieUrl: "/sampleslanding/karinbeforee.png",
    aiImages: "/sampleslanding/karin.jpeg",
  },
  {
    name: "Rasmus",
    review: "Loved the variety and styling. Very happy with the images!",
    selfieUrl: "/sampleslanding/rasmusbefore.png",
    aiImages: "/sampleslanding/rasmus.jpg",
  },
  // Add more people as needed
];

// Sample images for infinite scroll gallery
const showcaseImages = [
  {
    id: "1",
    src: "/democard/demo1-ai.webp",
    alt: "Professional AI Headshot 1",
    title: "Corporate Executive",
    category: "Business",
  },
  {
    id: "2",
    src: "/democard/demo2-ai.webp",
    alt: "Professional AI Headshot 2",
    title: "Creative Professional",
    category: "Creative",
  },
  {
    id: "3",
    src: "/democard/demo3-ai.webp",
    alt: "Professional AI Headshot 3",
    title: "Tech Leader",
    category: "Technology",
  },
  {
    id: "4",
    src: "/democard/demo4-ai.webp",
    alt: "Professional AI Headshot 4",
    title: "Marketing Expert",
    category: "Marketing",
  },
  {
    id: "5",
    src: "/democard/demo5-ai.webp",
    alt: "Professional AI Headshot 5",
    title: "Financial Advisor",
    category: "Finance",
  },
  {
    id: "6",
    src: "/democard/demo6-ai.webp",
    alt: "Professional AI Headshot 6",
    title: "Healthcare Professional",
    category: "Healthcare",
  },
];

const ImageGallery = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    const preventRightClick = (e: MouseEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventRightClick);

    return () => {
      document.removeEventListener("contextmenu", preventRightClick);
    };
  }, []);

  const handleImageClick = (image: any, index: number) => {
    setSelectedImage({ ...image, index });
  };

  return (
    <section id="gallery" className="relative w-full bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 py-20 sm:py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-tl from-primary-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-section mx-auto px-section">
        {/* Header Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-center mb-6"
          >
            <span className="bg-gradient-to-r from-white via-cyan-100 to-primary-200 bg-clip-text text-transparent">
              Our Customers Trust Us
            </span>
          </motion.h2>
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center mb-8 px-4"
          >
            <div className="flex items-center gap-3 bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-full px-6 py-3">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-base sm:text-xl text-white font-medium leading-tight">
                Money Back Guarantee If Not Satisfied
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Infinite Scroll Gallery Showcase */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Professional AI Headshots
            </h3>
            <p className="text-navy-300 max-w-2xl mx-auto">
              See the quality and variety of professional headshots our AI creates.
              Each image is uniquely generated to match your style and profession.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <InfiniteScrollGallery
              images={showcaseImages}
              direction="left"
              speed={40}
              pauseOnHover={true}
              showOverlay={true}
              aspectRatio="portrait"
              onImageClick={handleImageClick}
              className="mb-8"
            />
          </motion.div>
        </motion.div>

        {/* Customer Reviews Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 space-y-12"
        >
          {people.map((person, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="group relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-primary-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl overflow-hidden hover:border-cyan-400/40 transition-all duration-300">
                <div
                  className={`flex flex-col ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-center">
                    <div className="mb-8">
                      <p className="text-2xl sm:text-3xl font-semibold text-white mb-6 leading-relaxed">
                        &ldquo;{person.review}&rdquo;
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className="w-5 h-5 text-cyan-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          {person.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 relative aspect-[4/5]">
                    <div className="relative h-full overflow-hidden rounded-xl">
                      <Image
                        src={person.aiImages}
                        alt={`AI-generated image of ${person.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="select-none object-cover transition-transform duration-300 group-hover:scale-105"
                        draggable="false"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 to-transparent" />

                      <div className="absolute bottom-4 left-4 w-1/4 aspect-square">
                        <div className="relative h-full rounded-lg overflow-hidden border-2 border-white/20">
                          <Image
                            src={person.selfieUrl}
                            alt={`${person.name}&apos;s selfie`}
                            fill
                            sizes="(max-width: 768px) 25vw, 12.5vw"
                            className="select-none object-cover"
                            draggable="false"
                          />
                        </div>
                      </div>

                      <div className="absolute bottom-4 right-4 bg-gradient-to-r from-cyan-500 to-primary-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg">
                        ✨ AI GENERATED
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-4xl max-h-[90vh] bg-navy-900 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-900 to-transparent p-6">
              <h3 className="text-white text-xl font-semibold">
                {selectedImage.title}
              </h3>
              <p className="text-cyan-200 mt-1">{selectedImage.category}</p>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-navy-800/80 hover:bg-navy-700 text-white p-2 rounded-full transition-colors"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default ImageGallery;
