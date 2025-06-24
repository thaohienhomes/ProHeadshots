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
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <Header userAuth={true} />

      <div className="max-w-2xl mx-auto pt-8 px-4">
        <div className="max-w-lg mx-auto text-center">
          {currentStep === 1 && (
            <>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-primary-400 bg-clip-text text-transparent mb-4">
                How it works
              </h1>
              <p className="text-slate-300 mb-8">
                Creating your professional headshots is easy. All you need to do
                is upload some photos of yourself. We&apos;ll take care of the
                rest!
              </p>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-primary-400 bg-clip-text text-transparent mb-4">
                Select a package
              </h1>
              <p className="text-slate-300 mb-4">
                Pay once, no subscriptions or hidden fees. We offer no trial due
                to high costs, but we will refund you if you&apos;re
                unsatisfied.
              </p>
              <p className="font-bold mb-8 flex items-center justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-primary-500 text-white shadow-lg animate-gradient">
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
                <span className="text-white ml-2">
                  {" "}
                  for the first 150 customers (2 left)
                </span>
              </p>
            </>
          )}

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl shadow-2xl">
            {currentStep === 1 && (
              <>
                <button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500 text-white py-3 rounded-xl mb-6 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Click here to start!
                </button>

                <div className="mt-6">
                  <Image
                    src="/Form1.png"
                    alt="How it works illustration"
                    width={500}
                    height={333}
                    className="w-full h-auto rounded-xl shadow-lg"
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-4">
                  {pricingPlans.plans.map((plan, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                        plan.isPopular
                          ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/10 to-primary-500/10 shadow-lg shadow-cyan-500/20"
                          : "border-white/20 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex-grow text-left">
                        <div className="flex items-baseline mb-2">
                          <span className="text-xl font-bold text-white mr-2">
                            ${plan.price}
                          </span>
                          <span className="text-sm font-medium text-slate-400 line-through">
                            ${plan.originalPrice}
                          </span>
                          {plan.name === "Professional" && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-cyan-500 to-primary-500 text-white shadow-lg animate-gradient">
                              82% recommends this
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-white mb-1">
                          {plan.name}
                        </p>
                        <p className="text-sm text-slate-300">
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
                          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ml-4 flex-shrink-0 flex items-center shadow-lg hover:shadow-xl hover:scale-105
                            ${
                              plan.isPopular
                                ? "text-white bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500"
                                : "text-white bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm"
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
