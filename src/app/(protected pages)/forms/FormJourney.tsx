"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Link from "next/link";
import pricingPlans from "@/app/checkout/pricingPlans.json";

export default function Page() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-mainWhite">
      <Header userAuth={true} />

      <div className="max-w-2xl mx-auto mt-8">
        <div className="max-w-lg mx-auto text-center">
          {currentStep === 1 && (
            <>
              <h1 className="text-3xl font-bold text-mainBlack mb-4">
                How it works
              </h1>
              <p className="text-gray-600 mb-8">
                Creating your professional headshots is easy. All you need to do
                is upload some photos of yourself. We&apos;ll take care of the
                rest!
              </p>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h1 className="text-3xl font-bold text-mainBlack mb-4">
                Select a package
              </h1>
              <p className="text-gray-600 mb-4">
                Pay once, no subscriptions or hidden fees. We offer no trial due
                to high costs, but we will refund you if you&apos;re
                unsatisfied.
              </p>
              <p className="font-bold mb-8 flex items-center justify-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-mainGreen to-mainOrange text-mainBlack animate-gradient">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                  50% off
                </span>
                <span className="text-mainBlack ml-2">
                  {" "}
                  for the first 150 customers (2 left)
                </span>
              </p>
            </>
          )}

          <div className="bg-white p-5 rounded-lg shadow-md">
            {currentStep === 1 && (
              <>
                <button
                  onClick={handleNext}
                  className="w-full bg-mainBlack text-mainWhite py-2.5 rounded-md mb-5 hover:bg-opacity-90 transition-colors"
                >
                  Click here to start!
                </button>

                <div className="mt-5">
                  <Image
                    src="/Form1.png"
                    alt="How it works illustration"
                    width={500}
                    height={333}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-3">
                  {pricingPlans.map((plan, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        plan.isPopular ? "border-mainOrange" : "border-gray-200"
                      }`}
                    >
                      <div className="flex-grow text-left">
                        <div className="flex items-baseline mb-1">
                          <span className="text-xl font-bold text-mainBlack mr-2">
                            ${plan.price}
                          </span>
                          <span className="text-sm font-medium text-gray-600 line-through">
                            ${plan.originalPrice}
                          </span>
                          {plan.name === "Professional" && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-mainOrange to-mainGreen text-mainBlack animate-gradient">
                              82% recommends this
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-mainBlack">
                          {plan.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Get {plan.headshots} headshots with unique backgrounds
                          and outfits. Done in {plan.time} hour
                          {plan.time > 1 ? "s" : ""}
                        </p>
                      </div>
                      <Link
                        href={`/checkout?plan=${plan.name.toLowerCase()}`}
                        passHref
                      >
                        <button
                          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ml-4 flex-shrink-0 flex items-center
                            ${
                              plan.isPopular
                                ? "text-mainWhite bg-mainBlack hover:bg-opacity-90"
                                : "text-mainBlack bg-mainWhite border border-mainBlack hover:bg-gray-100"
                            }`}
                        >
                          <span>Select</span>
                          <span className="ml-1">→</span>
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-4">
                  <p className="text-gray-500">★★★★★</p>
                  <p className="text-sm text-gray-500 mt-1">
                    92% of customers recommend us
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
