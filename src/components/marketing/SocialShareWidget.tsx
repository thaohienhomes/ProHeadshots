"use client";

import React, { useState } from 'react';
import { trackEventClient } from '@/utils/analytics.client';

interface SocialShareWidgetProps {
  imageUrl?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  referralCode?: string;
  onShare?: (platform: string) => void;
}

interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
  shareUrl: (params: ShareParams) => string;
}

interface ShareParams {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  hashtags?: string;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: 'Twitter',
    icon: '🐦',
    color: 'bg-blue-500 hover:bg-blue-600',
    shareUrl: (params) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(params.title)}&url=${encodeURIComponent(params.url)}&hashtags=${encodeURIComponent(params.hashtags || '')}`
  },
  {
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: (params) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(params.url)}&quote=${encodeURIComponent(params.title)}`
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: (params) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(params.url)}&title=${encodeURIComponent(params.title)}&summary=${encodeURIComponent(params.description)}`
  },
  {
    name: 'Instagram',
    icon: '📷',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    shareUrl: (params) => 
      `https://www.instagram.com/` // Instagram doesn't support direct sharing URLs
  },
  {
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500 hover:bg-green-600',
    shareUrl: (params) => 
      `https://wa.me/?text=${encodeURIComponent(`${params.title} ${params.url}`)}`
  },
  {
    name: 'Telegram',
    icon: '✈️',
    color: 'bg-blue-400 hover:bg-blue-500',
    shareUrl: (params) => 
      `https://t.me/share/url?url=${encodeURIComponent(params.url)}&text=${encodeURIComponent(params.title)}`
  },
  {
    name: 'Reddit',
    icon: '🤖',
    color: 'bg-orange-500 hover:bg-orange-600',
    shareUrl: (params) => 
      `https://reddit.com/submit?url=${encodeURIComponent(params.url)}&title=${encodeURIComponent(params.title)}`
  },
  {
    name: 'Pinterest',
    icon: '📌',
    color: 'bg-red-500 hover:bg-red-600',
    shareUrl: (params) => 
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(params.url)}&media=${encodeURIComponent(params.imageUrl || '')}&description=${encodeURIComponent(params.description)}`
  }
];

export default function SocialShareWidget({
  imageUrl,
  title = "Check out my professional headshot from CVPhoto!",
  description = "I just created an amazing professional headshot using AI. Get yours at CVPhoto!",
  hashtags = ["CVPhoto", "AIHeadshots", "ProfessionalPhotos", "LinkedInPhoto"],
  referralCode,
  onShare
}: SocialShareWidgetProps) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvphoto.app';
  const shareUrl = referralCode ? `${baseUrl}?ref=${referralCode}` : baseUrl;

  const shareParams: ShareParams = {
    url: shareUrl,
    title,
    description,
    imageUrl,
    hashtags: hashtags.join(',')
  };

  const handleShare = async (platform: SocialPlatform) => {
    try {
      if (platform.name === 'Instagram') {
        // Instagram requires special handling
        await handleInstagramShare();
      } else {
        const url = platform.shareUrl(shareParams);
        window.open(url, '_blank', 'width=600,height=400');
      }

      // Track sharing event
      await trackEventClient('social_share', {
        platform: platform.name,
        has_referral_code: !!referralCode,
        content_type: imageUrl ? 'image' : 'text'
      });

      onShare?.(platform.name);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleInstagramShare = async () => {
    if (navigator.share && imageUrl) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl
        });
      } catch (error) {
        // Fallback: copy to clipboard with instructions
        await copyToClipboard(`${title}\n\n${description}\n\n${shareUrl}\n\n#${hashtags.join(' #')}`);
        alert('Content copied to clipboard! You can now paste it in Instagram.');
      }
    } else {
      alert('Instagram sharing is not supported on this device. Please copy the link and share manually.');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      await trackEventClient('share_link_copied', {
        has_referral_code: !!referralCode
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyLink = () => {
    copyToClipboard(shareUrl);
  };

  const generateShareText = (platform: string) => {
    const baseText = `${title}\n\n${description}`;
    const hashtagText = `\n\n#${hashtags.join(' #')}`;
    const linkText = `\n\n${shareUrl}`;

    switch (platform) {
      case 'Twitter':
        // Twitter has character limits
        const maxLength = 280 - shareUrl.length - hashtagText.length - 10;
        const truncatedText = baseText.length > maxLength 
          ? baseText.substring(0, maxLength) + '...' 
          : baseText;
        return `${truncatedText}${hashtagText}${linkText}`;
      
      case 'LinkedIn':
        return `${baseText}${linkText}`;
      
      default:
        return `${baseText}${hashtagText}${linkText}`;
    }
  };

  return (
    <>
      {/* Quick Share Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Share Your Success</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SOCIAL_PLATFORMS.slice(0, 4).map((platform) => (
            <button
              key={platform.name}
              onClick={() => handleShare(platform)}
              className={`${platform.color} text-white p-3 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2`}
            >
              <span className="text-lg">{platform.icon}</span>
              <span className="text-sm font-medium">{platform.name}</span>
            </button>
          ))}
        </div>

        {/* More Options */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex-1 px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
          >
            More Options
          </button>
          
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-lg transition-colors ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            }`}
          >
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
        </div>

        {/* Referral Info */}
        {referralCode && (
          <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-medium mb-2">💰 Earn Rewards!</h4>
            <p className="text-sm text-navy-300">
              Share your referral link and earn credits when friends sign up. 
              Your code: <span className="font-mono text-cyan-400">{referralCode}</span>
            </p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-cyan-400/20 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-navy-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Share Your Headshot</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-navy-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {/* Image Preview */}
              {imageUrl && (
                <div className="text-center">
                  <img
                    src={imageUrl}
                    alt="Headshot preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                  />
                </div>
              )}

              {/* All Platforms */}
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => {
                      handleShare(platform);
                      setShowShareModal(false);
                    }}
                    className={`${platform.color} text-white p-3 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2`}
                  >
                    <span className="text-lg">{platform.icon}</span>
                    <span className="text-sm font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Message */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Share Message Preview:
                </label>
                <textarea
                  value={generateShareText('default')}
                  readOnly
                  className="w-full h-24 px-3 py-2 bg-navy-700/50 border border-cyan-400/30 rounded-lg text-white text-sm resize-none"
                />
              </div>

              {/* Copy Options */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    copyToClipboard(shareUrl);
                    setShowShareModal(false);
                  }}
                  className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  📋 Copy Link Only
                </button>
                
                <button
                  onClick={() => {
                    copyToClipboard(generateShareText('default'));
                    setShowShareModal(false);
                  }}
                  className="w-full px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
                >
                  📝 Copy Full Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
