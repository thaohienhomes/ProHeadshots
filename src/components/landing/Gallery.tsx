"use client";

import Image from "next/image";
import { useEffect } from "react";

const people = [
  {
    name: "Karin",
    review:
      "What a fun experience! Turned out amazing and saved me money from expensive photographer",
    selfieUrl: "/democard/demo2-selfie.webp",
    aiImages: "/democard/demo2-ai.webp",
  },
  {
    name: "Rasmus",
    review: "Loved the variety and styling. Very happy with the images!",
    selfieUrl: "/democard/demo6-selfie.webp",
    aiImages: "/democard/demo6-ai.webp",
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
    <div className="w-full bg-gradient-to-b from-mainWhite to-mainWhite py-20 sm:py-32">
      <div className="max-w-section mx-auto px-section">
        <h2 className="text-3xl font-semibold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-center mb-8 text-mainBlack">
          Our Customers Trust Us
        </h2>
        <div className="flex items-center justify-center mb-16">
          <svg
            className="w-6 h-6 mr-2 text-mainBlack"
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
          <p className="text-xl text-center text-mainBlack">
            Money Back Guarantee If Not Satisfied
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {people.map((person, index) => (
            <div
              key={index}
              className="bg-mainWhite shadow-lg rounded-lg overflow-hidden"
            >
              <div
                className={`flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br from-mainWhite via-mainGreen/10 to-mainOrange/10">
                  <p className="text-2xl sm:text-3xl font-semibold text-mainBlack mb-8">
                    &ldquo;{person.review}&rdquo;
                  </p>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-mainOrange"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-mainBlack">
                      {person.name}
                    </h3>
                  </div>
                </div>
                <div className="w-full md:w-1/2 relative aspect-[4/5]">
                  <Image
                    src={person.aiImages}
                    alt={`AI-generated image of ${person.name}`}
                    fill
                    className="select-none object-cover"
                    draggable="false"
                  />
                  <div className="absolute bottom-4 left-4 w-1/4 aspect-square">
                    <Image
                      src={person.selfieUrl}
                      alt={`${person.name}&apos;s selfie`}
                      fill
                      className="rounded-md select-none object-cover"
                      draggable="false"
                    />
                  </div>
                  <div className="absolute bottom-4 right-4 bg-mainBlack bg-opacity-70 text-mainWhite text-xs px-2 py-1 rounded">
                    AI GENERATED
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
