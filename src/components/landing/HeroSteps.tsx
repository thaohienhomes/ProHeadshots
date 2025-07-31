"use client";

import React from "react";
import { motion } from "framer-motion";
import EnhancedParallaxCards from "@/components/landing/EnhancedDemoCard";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const steps = [
  {
    number: "1",
    title: "Upload your selfies",
    description:
      "Share a few recent photos. Our AI analyzes them to capture your most photogenic qualities and unique style, usually takes 1-2 minutes.",
  },
  {
    number: "2",
    title: "Download headshots (Studio Quality)",
    description:
      "In minutes, get 100+ studio-quality headshots in various styles. No photographer or studio visit needed. It's that simple!",
  },
];

const HeroSteps = () => {

  return (
    <section className="relative w-full bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 py-16 lg:py-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-primary-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-400/5 to-primary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl lg:text-4xl font-bold text-white mb-6"
          >
            <span className="bg-gradient-to-r from-cyan-400 to-primary-500 bg-clip-text text-transparent">
              How It Works
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg text-navy-200 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your selfies into professional headshots with our advanced AI technology in just two simple steps.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto mb-20"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="text-center group"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-primary-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative w-20 h-20 bg-gradient-to-r from-cyan-500 to-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-cyan-400/20">
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-cyan-100 transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-navy-300 leading-relaxed group-hover:text-navy-200 transition-colors duration-300">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Demo Cards Showcase */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-primary-500 bg-clip-text text-transparent">
                See the Transformation
              </span>
            </h3>
            <p className="text-navy-200 max-w-2xl mx-auto">
              Real examples of selfies transformed into professional headshots.
              Hover over any image to see the details.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <EnhancedParallaxCards
              speed={30}
              pauseOnHover={true}
              showHoverEffects={true}
              showDetails={true}
              direction="left"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
export default HeroSteps;
