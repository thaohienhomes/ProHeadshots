"use client";

import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';

interface ImageEditorProps {
  imageSrc: string;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

interface CropSettings {
  crop: Point;
  zoom: number;
  aspect: number;
  rotation: number;
}

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

export default function ImageEditor({ imageSrc, onSave, onCancel }: ImageEditorProps) {
  const [cropSettings, setCropSettings] = useState<CropSettings>({
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 1, // Square aspect ratio for headshots
    rotation: 0
  });
  
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0
  });
  
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [activeTab, setActiveTab] = useState<'crop' | 'filters'>('crop');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    filters: FilterSettings
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not found');
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not found');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    // Apply filters
    ctx.filter = `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturation}%) 
      blur(${filters.blur}px)
    `;

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    );

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(data, 0, 0);

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        cropSettings.rotation,
        filterSettings
      );
      onSave(croppedImage);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFilters = () => {
    setFilterSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0
    });
  };

  const presetAspectRatios = [
    { label: 'Square (1:1)', value: 1 },
    { label: 'Portrait (3:4)', value: 3/4 },
    { label: 'Landscape (4:3)', value: 4/3 },
    { label: 'Wide (16:9)', value: 16/9 }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-cyan-400/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-navy-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Image</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('crop')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'crop'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-navy-700 text-navy-300 hover:bg-navy-600'
                }`}
              >
                Crop & Rotate
              </button>
              <button
                onClick={() => setActiveTab('filters')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'filters'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-navy-700 text-navy-300 hover:bg-navy-600'
                }`}
              >
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[60vh]">
          {/* Image Preview */}
          <div className="flex-1 relative bg-black">
            <Cropper
              image={imageSrc}
              crop={cropSettings.crop}
              zoom={cropSettings.zoom}
              aspect={cropSettings.aspect}
              rotation={cropSettings.rotation}
              onCropChange={(crop) => setCropSettings(prev => ({ ...prev, crop }))}
              onZoomChange={(zoom) => setCropSettings(prev => ({ ...prev, zoom }))}
              onRotationChange={(rotation) => setCropSettings(prev => ({ ...prev, rotation }))}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  filter: `brightness(${filterSettings.brightness}%) contrast(${filterSettings.contrast}%) saturate(${filterSettings.saturation}%) blur(${filterSettings.blur}px)`
                }
              }}
            />
          </div>

          {/* Controls */}
          <div className="w-80 p-6 bg-navy-800/50 overflow-y-auto">
            {activeTab === 'crop' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {presetAspectRatios.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => setCropSettings(prev => ({ ...prev, aspect: preset.value }))}
                        className={`p-2 text-sm rounded-lg transition-colors ${
                          cropSettings.aspect === preset.value
                            ? 'bg-cyan-500 text-white'
                            : 'bg-navy-700 text-navy-300 hover:bg-navy-600'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Zoom: {cropSettings.zoom.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={cropSettings.zoom}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Rotation: {cropSettings.rotation}°
                  </label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={cropSettings.rotation}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'filters' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Brightness: {filterSettings.brightness}%
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    step={1}
                    value={filterSettings.brightness}
                    onChange={(e) => setFilterSettings(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Contrast: {filterSettings.contrast}%
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    step={1}
                    value={filterSettings.contrast}
                    onChange={(e) => setFilterSettings(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Saturation: {filterSettings.saturation}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={1}
                    value={filterSettings.saturation}
                    onChange={(e) => setFilterSettings(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Blur: {filterSettings.blur}px
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.1}
                    value={filterSettings.blur}
                    onChange={(e) => setFilterSettings(prev => ({ ...prev, blur: parseFloat(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-navy-700 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-navy-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
