"use client";

import Image from "next/image";
import { useEffect } from "react";

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

const ImageGallery = () => {
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

  return (
    <section className="relative w-full bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 py-20 sm:py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-tl from-primary-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-section mx-auto px-section">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-center mb-6">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-primary-200 bg-clip-text text-transparent">
              Our Customers Trust Us
            </span>
          </h2>
          <div className="flex items-center justify-center mb-8 px-4">
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
          </div>
        </div>

        <div className="mt-16 space-y-12">
          {people.map((person, index) => (
            <div
              key={index}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageGallery;
