// Production video content management system
import { getAuthHeaders } from '@/lib/auth/authUtils';

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  duration: number; // seconds
  thumbnail: string;
  videoUrl: string;
  category: 'ai-models' | 'process' | 'quality' | 'tutorial';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  viewCount: number;
  averageWatchTime: number; // seconds
  completionRate: number; // 0-1
}

export interface VideoAnalytics {
  videoId: string;
  userId: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  watchDuration: number; // seconds
  completed: boolean;
  interactions: {
    play: number;
    pause: number;
    seek: number;
    volumeChange: number;
  };
  quality: string;
  device: 'mobile' | 'tablet' | 'desktop';
}

export interface VideoProvider {
  type: 'youtube' | 'vimeo' | 'cloudfront' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  config?: any;
}

class VideoManager {
  private baseUrl: string;
  private provider: VideoProvider;
  private cache: Map<string, VideoContent> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor(provider: VideoProvider) {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    this.provider = provider;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    return await getAuthHeaders();
  }

  // Get video content by ID
  async getVideo(videoId: string): Promise<VideoContent | null> {
    // Check cache first
    const cached = this.cache.get(videoId);
    if (cached) {
      return cached;
    }

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/videos/${videoId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
      }

      const video: VideoContent = await response.json();
      
      // Cache the result
      this.cache.set(videoId, video);
      setTimeout(() => this.cache.delete(videoId), this.cacheExpiry);

      return video;
    } catch (error) {
      console.error('Error fetching video:', error);
      return null;
    }
  }

  // Get videos by category
  async getVideosByCategory(category: VideoContent['category']): Promise<VideoContent[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/videos?category=${category}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching videos by category:', error);
      return [];
    }
  }

  // Generate video URL based on provider
  getVideoUrl(video: VideoContent, quality?: string): string {
    switch (this.provider.type) {
      case 'youtube':
        return this.getYouTubeUrl(video, quality);
      case 'vimeo':
        return this.getVimeoUrl(video, quality);
      case 'cloudfront':
        return this.getCloudFrontUrl(video, quality);
      default:
        return video.videoUrl;
    }
  }

  // Generate thumbnail URL
  getThumbnailUrl(video: VideoContent, size: 'small' | 'medium' | 'large' = 'medium'): string {
    switch (this.provider.type) {
      case 'youtube':
        return `https://img.youtube.com/vi/${this.extractYouTubeId(video.videoUrl)}/${size === 'large' ? 'maxresdefault' : size === 'medium' ? 'hqdefault' : 'default'}.jpg`;
      case 'vimeo':
        return video.thumbnail; // Vimeo provides thumbnail URLs directly
      case 'cloudfront':
        return `${this.provider.baseUrl}/thumbnails/${video.id}_${size}.jpg`;
      default:
        return video.thumbnail;
    }
  }

  // Track video analytics
  async trackVideoAnalytics(analytics: Omit<VideoAnalytics, 'sessionId'>): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await fetch(`${this.baseUrl}/videos/analytics`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...analytics,
          sessionId: this.generateSessionId(),
        }),
      });
    } catch (error) {
      console.error('Error tracking video analytics:', error);
    }
  }

  // Get video analytics
  async getVideoAnalytics(videoId: string, timeRange?: string): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.baseUrl}/videos/${videoId}/analytics${timeRange ? `?range=${timeRange}` : ''}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching video analytics:', error);
      return null;
    }
  }

  // Provider-specific URL generators
  private getYouTubeUrl(video: VideoContent, quality?: string): string {
    const videoId = this.extractYouTubeId(video.videoUrl);
    const params = new URLSearchParams({
      autoplay: '0',
      controls: '1',
      rel: '0',
      modestbranding: '1',
    });

    if (quality) {
      params.set('vq', quality);
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  private getVimeoUrl(video: VideoContent, quality?: string): string {
    const videoId = this.extractVimeoId(video.videoUrl);
    const params = new URLSearchParams({
      autoplay: '0',
      title: '0',
      byline: '0',
      portrait: '0',
    });

    if (quality) {
      params.set('quality', quality);
    }

    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  }

  private getCloudFrontUrl(video: VideoContent, quality?: string): string {
    const baseUrl = this.provider.baseUrl || '';
    const qualitySuffix = quality ? `_${quality}` : '';
    return `${baseUrl}/videos/${video.id}${qualitySuffix}.mp4`;
  }

  // Utility functions
  private extractYouTubeId(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  }

  private extractVimeoId(url: string): string {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : '';
  }

  private generateSessionId(): string {
    return `video_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Preload video for better performance
  async preloadVideo(videoId: string): Promise<void> {
    const video = await this.getVideo(videoId);
    if (video && typeof document !== 'undefined') {
      // Create a hidden video element to preload
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.src = this.getVideoUrl(video);
      videoElement.style.display = 'none';
      document.body.appendChild(videoElement);

      // Remove after preload
      setTimeout(() => {
        if (document.body.contains(videoElement)) {
          document.body.removeChild(videoElement);
        }
      }, 1000);
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Video provider configurations
export const videoProviders = {
  youtube: {
    type: 'youtube' as const,
    apiKey: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
  },
  vimeo: {
    type: 'vimeo' as const,
    apiKey: process.env.NEXT_PUBLIC_VIMEO_API_KEY,
  },
  cloudfront: {
    type: 'cloudfront' as const,
    baseUrl: process.env.NEXT_PUBLIC_CLOUDFRONT_URL,
  },
};

// Singleton instances for different providers
export const youtubeManager = new VideoManager(videoProviders.youtube);
export const vimeoManager = new VideoManager(videoProviders.vimeo);
export const cloudfrontManager = new VideoManager(videoProviders.cloudfront);

// Default manager (can be configured based on environment)
export const videoManager = process.env.NEXT_PUBLIC_VIDEO_PROVIDER === 'vimeo' 
  ? vimeoManager 
  : process.env.NEXT_PUBLIC_VIDEO_PROVIDER === 'cloudfront'
  ? cloudfrontManager
  : youtubeManager;

// Video quality options
export const videoQualities = {
  mobile: 'small',
  tablet: 'medium', 
  desktop: 'hd720',
  premium: 'hd1080',
} as const;

// Device detection utility
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Get optimal video quality based on device and connection
export const getOptimalQuality = (device?: 'mobile' | 'tablet' | 'desktop'): string => {
  const deviceType = device || getDeviceType();
  
  // Check connection speed if available
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType;
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return videoQualities.mobile;
  }
  
  if (effectiveType === '3g' && deviceType === 'mobile') {
    return videoQualities.mobile;
  }
  
  return videoQualities[deviceType];
};
