"use client";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "CoolPix transformed my LinkedIn presence! The AI headshots look incredibly professional and natural. Got 3x more profile views!",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    name: "Sarah Chen",
    role: "Marketing Director",
  },
  {
    text: "Amazing quality! I was skeptical about AI headshots, but these look better than my expensive studio photos. Highly recommend!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Michael Rodriguez",
    role: "Software Engineer",
  },
  {
    text: "Perfect for my consulting business. Professional, quick, and affordable. My clients are impressed with my new headshots!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    name: "Emily Johnson",
    role: "Business Consultant",
  },
  {
    text: "The variety of styles is incredible. I got headshots for different occasions - corporate, casual, creative. All look fantastic!",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "David Kim",
    role: "Creative Director",
  },
  {
    text: "As a real estate agent, professional photos are crucial. CoolPix delivered studio-quality results at a fraction of the cost!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    name: "Jessica Martinez",
    role: "Real Estate Agent",
  },
  {
    text: "Impressed by the AI technology! The headshots captured my personality perfectly. Great for my executive profile.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    name: "Robert Thompson",
    role: "CEO",
  },
  {
    text: "Quick turnaround and excellent results! Perfect for my job applications. The professional look made a real difference.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    name: "Amanda Davis",
    role: "Project Manager",
  },
  {
    text: "Outstanding service! The AI understood exactly what I needed for my personal brand. These headshots are game-changers!",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    name: "James Wilson",
    role: "Entrepreneur",
  },
  {
    text: "Love the convenience! No scheduling studio appointments. Got professional headshots from home in minutes. Brilliant!",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&h=150&fit=crop&crop=face",
    name: "Lisa Anderson",
    role: "HR Manager",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const Testimonials = () => {
  return (
    <section className="bg-navy-900 my-20 relative py-20">
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
              Testimonials
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-white text-center">
            What our users say
          </h2>
          <p className="text-center mt-5 text-navy-300 max-w-lg">
            See what our customers have to say about their AI headshot experience.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
