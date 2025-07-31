import React from 'react';
import Header from "@/components/Header";
import GalleryExamples from "@/components/examples/GalleryExamples";

export default function GalleryDemoPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <Header />
      <GalleryExamples />
    </div>
  );
}
