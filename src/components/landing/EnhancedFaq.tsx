"use client";
import React from "react";
import { motion } from "motion/react";

const faqData = [
  {
    question: "What kind of photos do I need to upload?",
    answer: "Make variety a priority. Varied facial expressions and varied backgrounds, taken at various times of the day, are the keys to high quality input photos. Oh, and minimal makeup and accessories, please!",
    category: "Upload"
  },
  {
    question: "What do you do with my uploaded photos?",
    answer: "The photos you upload are used to train our AI model so it can create realistic AI headshots. These input photos are deleted within 7 days, but you can instantly delete them at any time with our 'Delete' button.",
    category: "Privacy"
  },
  {
    question: "Who owns my AI photos?",
    answer: "You do. We grant you full commercial license and ownership over your photos.",
    category: "Ownership"
  },
  {
    question: "What if I don't like my photos?",
    answer: "No problem. We promise 3-6 keepers in every order. If you don't find at least 3 incredible headshots, just don't download any of your results and we'll refund you in full.",
    category: "Guarantee"
  },
  {
    question: "How long does an AI headshot take?",
    answer: "We don't cut corners when it comes to generating photorealistic AI headshots. We're not the fastest, but you'll always get same-day results with CoolPix. Our Executive package is delivered in 1 hour or less.",
    category: "Timing"
  },
  {
    question: "What do people misunderstand about AI headshots?",
    answer: "Not every photo is perfect. Due to the nature of AI, you might see some strange photos. CoolPix tries to make this clear from the start: not every photo is perfect, but we promise you'll find a profile-worthy headshot in every order to make it all worth it.",
    category: "Expectations"
  },
  {
    question: "How many good photos can I expect?",
    answer: "The amount of keeper headshots you get back will largely depend on the photos you provide us with. Customers who make an effort to follow the instructions closely often walk away with 8-10+ incredible photos. At the very least, we guarantee you'll get a Profile-Worthy headshot back.",
    category: "Results"
  },
  {
    question: "Is there a free AI headshot generator?",
    answer: "Yes, CoolPix has a 100% free AI headshot generator for simple photos. No email is required and no credit card is required. It is completely free.",
    category: "Pricing"
  },
  {
    question: "What is the most realistic headshot AI?",
    answer: "CoolPix is the most realistic headshot AI with excellent reviews. It's the only major AI headshot generator using Flux to generate realistic AI headshots. CoolPix is regularly used by professionals, companies and photographers.",
    category: "Quality"
  },
  {
    question: "Can I use AI headshots on LinkedIn?",
    answer: "25% of CoolPix customers use their AI headshots on LinkedIn. It's totally okay to use AI headshots on LinkedIn.",
    category: "Usage"
  },
  {
    question: "Can ChatGPT generate headshots?",
    answer: "Yes, ChatGPT can generate very basic headshots. These headshots aren't realistic enough to use professionally, but they can be fun to play around with. Use CoolPix for AI headshots you can use professionally.",
    category: "Comparison"
  },
  {
    question: "What AI should I use for headshots?",
    answer: "The best AI headshot generators are using Flux to maximize realism. Right now, CoolPix is the only major headshot AI powered by Flux. You can get up to 200 professional AI headshots within 2 hours",
    category: "Technology"
  }
];

export const FaqColumn = (props: {
  className?: string;
  faqs: typeof faqData;
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 20,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.faqs.map(({ question, answer, category }, i) => (
                <div className="p-6 rounded-2xl border border-navy-700 bg-navy-800/50 backdrop-blur-sm shadow-lg shadow-cyan-500/10 max-w-sm w-full" key={i}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-cyan-400/20 text-cyan-400 text-xs rounded-full font-medium">
                      {category}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-3 leading-tight">{question}</h3>
                  <p className="text-navy-200 text-xs leading-relaxed">{answer}</p>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

const firstColumn = faqData.slice(0, 4);
const secondColumn = faqData.slice(4, 8);
const thirdColumn = faqData.slice(8, 12);

const EnhancedFaq = () => {
  return (
    <section className="bg-navy-900 my-20 relative py-20" id="faq">
      <div className="container z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 py-2 px-4 rounded-lg text-sm font-medium">
              FAQ
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-white text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-center mt-5 text-navy-300 max-w-lg">
            Get answers to common questions about our professional AI-generated headshot service.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <FaqColumn faqs={firstColumn} duration={25} />
          <FaqColumn faqs={secondColumn} className="hidden md:block" duration={30} />
          <FaqColumn faqs={thirdColumn} className="hidden lg:block" duration={28} />
        </div>
      </div>
    </section>
  );
};

export default EnhancedFaq;
