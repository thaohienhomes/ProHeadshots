"use client";

import { useState, useEffect } from "react";

export default function ResultsModal() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => setIsOpen(false);

  return (
    <div 
      className="fixed inset-0 bg-mainBlack bg-opacity-50 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      <div 
        className="bg-mainWhite p-6 rounded-lg max-w-sm w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-3 text-mainBlack">Ready to reveal?</h2>
        <p className="text-mainBlack mb-3 text-sm">Wait! Here&apos;s how to get the most out of your new photos:</p>
        
        <h3 className="text-lg font-semibold mb-2 text-mainBlack">❌ Ignore the duds.</h3>
        <p className="text-mainBlack mb-3 text-sm">
          In a 📸 real photoshoot, the duds are the photos where your eyes are closed, crossed, or just plain awkward.
        </p>
        <p className="text-mainBlack mb-3 text-sm">
          In an 🤖 AI photoshoot, the duds are the photos where you have extra limbs, strange scenery, or a strong lack of resemblance.
        </p>

        <h3 className="text-lg font-semibold mb-2 text-mainBlack">✅ Select the keepers.</h3>
        <p className="text-mainBlack mb-3 text-sm">
          We promise 3-6 incredible profile-worthy headshots in every batch—but we let you see the entire batch, so you can decide on the keepers yourself. You can pick as many as you like, there&apos;s no limit.
        </p>

        <p className="text-mainBlack font-semibold mb-4 text-sm">No more waiting, time to pick your keepers!</p>
        
        <button
          onClick={handleClose}
          className="bg-mainBlack text-mainWhite px-4 py-2 rounded hover:bg-opacity-90 transition-colors w-full text-sm"
        >
          Pick my keepers
        </button>
      </div>
    </div>
  );
}
