"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProfessionalCarousel from '@/components/ui/ProfessionalCarousel';
import ProfessionalGallery from '@/components/ui/ProfessionalGallery';
import InfiniteScrollGallery, { MultiRowInfiniteGallery } from '@/components/ui/InfiniteScrollGallery';
import { staggerContainer, fadeInUp } from '@/lib/animations';

// Sample data - replace with your actual image data
const sampleImages = [
  {
    id: '1',
    src: '/democard/demo1-ai.webp',
    alt: 'Professional headshot 1',
    title: 'Corporate Executive',
    category: 'business',
    tags: ['professional', 'corporate', 'executive'],
    featured: true,
    aspectRatio: 0.75,
  },
  {
    id: '2',
    src: '/democard/demo2-ai.webp',
    alt: 'Professional headshot 2',
    title: 'Creative Professional',
    category: 'creative',
    tags: ['creative', 'artistic', 'modern'],
    aspectRatio: 0.8,
  },
  {
    id: '3',
    src: '/democard/demo3-ai.webp',
    alt: 'Professional headshot 3',
    title: 'Business Leader',
    category: 'business',
    tags: ['leadership', 'professional', 'confident'],
    aspectRatio: 0.75,
  },
  {
    id: '4',
    src: '/democard/demo4-ai.webp',
    alt: 'Professional headshot 4',
    title: 'Tech Innovator',
    category: 'technology',
    tags: ['tech', 'innovation', 'modern'],
    aspectRatio: 0.85,
  },
  {
    id: '5',
    src: '/democard/demo5-ai.webp',
    alt: 'Professional headshot 5',
    title: 'Marketing Expert',
    category: 'marketing',
    tags: ['marketing', 'communication', 'dynamic'],
    aspectRatio: 0.75,
  },
  {
    id: '6',
    src: '/democard/demo6-ai.webp',
    alt: 'Professional headshot 6',
    title: 'Financial Advisor',
    category: 'finance',
    tags: ['finance', 'advisory', 'trustworthy'],
    aspectRatio: 0.8,
  },
];

export default function GalleryExamples() {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const handleImageClick = (image: any, index: number) => {
    setSelectedImage({ ...image, index });
    console.log('Image clicked:', image, index);
  };

  const handleImageLike = (image: any) => {
    console.log('Image liked:', image);
  };

  const handleImageDownload = (image: any) => {
    console.log('Image download:', image);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <div className="container mx-auto px-4 py-12 space-y-16">
        
        {/* Hero Section with Professional Carousel */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            Professional Gallery Components
          </motion.h1>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-navy-300 mb-12 max-w-3xl mx-auto"
          >
            Showcase your AI-generated headshots with smooth animations, responsive layouts, 
            and professional presentation inspired by industry leaders.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <ProfessionalCarousel
              images={sampleImages}
              autoplay={true}
              autoplayDelay={5000}
              showDots={true}
              showArrows={true}
              showPlayPause={true}
              aspectRatio="portrait"
              enableSwipe={true}
              pauseOnHover={true}
              onImageClick={handleImageClick}
              className="max-w-2xl mx-auto"
            />
          </motion.div>
        </motion.section>

        {/* Infinite Scroll Gallery Section */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-bold mb-8 text-center"
          >
            Infinite Scroll Gallery
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-navy-300 text-center mb-12 max-w-2xl mx-auto"
          >
            Smooth, continuous scrolling gallery similar to HeadshotPro&apos;s homepage showcase.
            Hover to pause and interact with images.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <InfiniteScrollGallery
              images={sampleImages}
              direction="left"
              speed={40}
              pauseOnHover={true}
              showOverlay={true}
              aspectRatio="portrait"
              onImageClick={handleImageClick}
              className="mb-8"
            />
          </motion.div>

          {/* Multi-row infinite scroll */}
          <motion.div variants={fadeInUp}>
            <MultiRowInfiniteGallery
              imageRows={[
                sampleImages.slice(0, 3),
                sampleImages.slice(3, 6),
                sampleImages.slice(0, 4),
              ]}
              speeds={[50, 35, 45]}
              directions={['left', 'right', 'left']}
              onImageClick={(image, rowIndex, imageIndex) => 
                handleImageClick(image, imageIndex)
              }
            />
          </motion.div>
        </motion.section>

        {/* Professional Gallery Section */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-bold mb-8 text-center"
          >
            Interactive Gallery
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-navy-300 text-center mb-12 max-w-2xl mx-auto"
          >
            Advanced gallery with search, filtering, multiple layouts, and interactive hover effects.
            Perfect for showcasing large collections of AI-generated content.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <ProfessionalGallery
              images={sampleImages}
              columns={{ mobile: 2, tablet: 3, desktop: 4 }}
              layout="masonry"
              showSearch={true}
              showFilters={true}
              showCategories={true}
              enableLightbox={true}
              onImageClick={handleImageClick}
              onImageLike={handleImageLike}
              onImageDownload={handleImageDownload}
            />
          </motion.div>
        </motion.section>

        {/* Grid Layout Examples */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-12"
        >
          <motion.div variants={fadeInUp}>
            <h3 className="text-2xl font-bold mb-6">Grid Layout</h3>
            <ProfessionalGallery
              images={sampleImages.slice(0, 4)}
              columns={{ mobile: 2, tablet: 2, desktop: 2 }}
              layout="grid"
              showSearch={false}
              showFilters={false}
              onImageClick={handleImageClick}
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h3 className="text-2xl font-bold mb-6">Masonry Layout</h3>
            <ProfessionalGallery
              images={sampleImages.slice(0, 4)}
              columns={{ mobile: 2, tablet: 2, desktop: 2 }}
              layout="masonry"
              showSearch={false}
              showFilters={false}
              onImageClick={handleImageClick}
            />
          </motion.div>
        </motion.section>

        {/* Carousel Variations */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-bold mb-8 text-center"
          >
            Carousel Variations
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-semibold mb-4">Square Aspect Ratio</h3>
              <ProfessionalCarousel
                images={sampleImages.slice(0, 3)}
                aspectRatio="square"
                autoplay={false}
                showDots={true}
                showArrows={true}
                onImageClick={handleImageClick}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-semibold mb-4">Landscape Aspect Ratio</h3>
              <ProfessionalCarousel
                images={sampleImages.slice(0, 3)}
                aspectRatio="landscape"
                autoplay={true}
                autoplayDelay={3000}
                showDots={false}
                showArrows={true}
                onImageClick={handleImageClick}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Integration Tips */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="bg-navy-900/20 rounded-2xl p-8"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl font-bold mb-6"
          >
            Integration Tips
          </motion.h2>
          
          <motion.div 
            variants={fadeInUp}
            className="grid md:grid-cols-2 gap-8"
          >
            <div>
              <h3 className="text-lg font-semibold mb-3 text-cyan-400">Performance</h3>
              <ul className="space-y-2 text-navy-300">
                <li>• Images are lazy-loaded and optimized</li>
                <li>• Animations use hardware acceleration</li>
                <li>• Preloading for smooth transitions</li>
                <li>• Responsive image sizing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-cyan-400">Accessibility</h3>
              <ul className="space-y-2 text-navy-300">
                <li>• Keyboard navigation support</li>
                <li>• ARIA labels and roles</li>
                <li>• Focus management</li>
                <li>• Screen reader friendly</li>
              </ul>
            </div>
          </motion.div>
        </motion.section>
      </div>

      {/* Image Modal/Lightbox (basic example) */}
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
              className="absolute top-4 right-4 bg-navy-800/80 hover:bg-navy-700 text-white p-2 rounded-full"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
