"use client";

import React, { useState } from 'react';
import { Share2, Copy, Download, Twitter, Linkedin, Facebook, Instagram, Mail, Link, Check } from 'lucide-react';

interface SocialSharingProps {
  imageUrl: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  showDownload?: boolean;
  showCopyLink?: boolean;
  customMessage?: string;
}

export default function SocialSharing({
  imageUrl,
  title = "Check out my new AI-generated headshot!",
  description = "Created with CoolPix - Professional AI headshots in minutes",
  hashtags = ['AIHeadshots', 'CoolPix', 'ProfessionalPhotos'],
  showDownload = true,
  showCopyLink = true,
  customMessage,
}: SocialSharingProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');

  const socialPlatforms = [
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} ${hashtagString}`)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      url: '#', // Instagram doesn't support direct URL sharing
      action: 'copy-caption',
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${shareUrl}`)}`,
    },
  ];

  const copyToClipboard = async (text: string, type: 'link' | 'caption' = 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      if (type === 'caption') {
        // Show instruction for Instagram
        alert('Caption copied! Open Instagram and paste it with your photo.');
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cvphoto-headshot-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleShare = async (platform: typeof socialPlatforms[0]) => {
    setIsSharing(true);

    try {
      if (platform.action === 'copy-caption') {
        const caption = `${title}\n\n${description}\n\n${hashtagString}`;
        await copyToClipboard(caption, 'caption');
      } else if (platform.url !== '#') {
        window.open(platform.url, '_blank', 'width=600,height=400');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setTimeout(() => setIsSharing(false), 1000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Share2 className="w-6 h-6 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Share Your Headshot</h3>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={imageUrl}
                alt="Headshot preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h4 className="text-white font-medium mb-1">{title}</h4>
              <p className="text-slate-300 text-sm mb-2">{description}</p>
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag) => (
                  <span key={tag} className="text-cyan-400 text-xs">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Platforms */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">Share on social media</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {socialPlatforms.map((platform) => (
            <button
              key={platform.name}
              onClick={() => handleShare(platform)}
              disabled={isSharing}
              className={`flex items-center gap-3 px-4 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${platform.color}`}
            >
              {platform.icon}
              <span className="text-sm">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        {/* Native Share (if supported) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300"
          >
            <Share2 className="w-4 h-4" />
            Share via device
          </button>
        )}

        {/* Copy Link */}
        {showCopyLink && (
          <button
            onClick={() => copyToClipboard(shareUrl)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Link copied!</span>
              </>
            ) : (
              <>
                <Link className="w-4 h-4" />
                Copy link
              </>
            )}
          </button>
        )}

        {/* Download */}
        {showDownload && (
          <button
            onClick={downloadImage}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500 text-white rounded-lg font-medium transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Download image
          </button>
        )}
      </div>

      {/* Custom Message */}
      {customMessage && (
        <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
          <p className="text-cyan-400 text-sm">{customMessage}</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
        <h5 className="text-white font-medium mb-2">Sharing Tips</h5>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• Use relevant hashtags to increase visibility</li>
          <li>• Tag @cvphoto for a chance to be featured</li>
          <li>• Share your before/after transformation story</li>
          <li>• Consider posting during peak engagement hours</li>
        </ul>
      </div>
    </div>
  );
}

// Compact version for quick sharing
export function QuickShare({ 
  imageUrl, 
  title = "My new AI headshot!" 
}: { 
  imageUrl: string; 
  title?: string; 
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all duration-300"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-full right-0 mt-2 w-80 z-50">
        <div className="bg-navy-900 border border-white/20 rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h4 className="text-white font-medium">Share</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            <SocialSharing
              imageUrl={imageUrl}
              title={title}
              showDownload={false}
              showCopyLink={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
