// Demo video API endpoint
import { NextResponse } from 'next/server';

interface VideoContent {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
  provider: 'youtube' | 'vimeo' | 'cloudfront' | 'local';
  providerId?: string;
  quality: {
    '480p': string;
    '720p': string;
    '1080p': string;
  };
  captions?: {
    language: string;
    url: string;
  }[];
  metadata: {
    uploadDate: string;
    views: number;
    category: string;
    tags: string[];
  };
}

// Mock video data
const mockVideos: Record<string, VideoContent> = {
  'demo-video-1': {
    id: 'demo-video-1',
    title: 'How AI Creates Professional Headshots',
    description: 'Learn about our advanced AI process that transforms your photos into professional headshots. This video explains the technology behind our service.',
    duration: 180, // 3 minutes
    thumbnailUrl: '/video-thumbnails/ai-process-thumb.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Demo YouTube video
    provider: 'youtube',
    providerId: 'dQw4w9WgXcQ',
    quality: {
      '480p': 'https://www.youtube.com/embed/dQw4w9WgXcQ?quality=small',
      '720p': 'https://www.youtube.com/embed/dQw4w9WgXcQ?quality=medium',
      '1080p': 'https://www.youtube.com/embed/dQw4w9WgXcQ?quality=large',
    },
    captions: [
      {
        language: 'en',
        url: '/captions/demo-video-1-en.vtt'
      }
    ],
    metadata: {
      uploadDate: '2024-01-15T10:00:00Z',
      views: 15420,
      category: 'Educational',
      tags: ['AI', 'headshots', 'photography', 'technology']
    }
  },
  'demo-video-2': {
    id: 'demo-video-2',
    title: 'Tips for Better AI Headshots',
    description: 'Get the most out of your AI headshot session with these professional tips and best practices.',
    duration: 240, // 4 minutes
    thumbnailUrl: '/video-thumbnails/tips-thumb.jpg',
    videoUrl: 'https://www.youtube.com/embed/oHg5SJYRHA0', // Demo YouTube video
    provider: 'youtube',
    providerId: 'oHg5SJYRHA0',
    quality: {
      '480p': 'https://www.youtube.com/embed/oHg5SJYRHA0?quality=small',
      '720p': 'https://www.youtube.com/embed/oHg5SJYRHA0?quality=medium',
      '1080p': 'https://www.youtube.com/embed/oHg5SJYRHA0?quality=large',
    },
    metadata: {
      uploadDate: '2024-01-20T14:30:00Z',
      views: 8930,
      category: 'Tutorial',
      tags: ['tips', 'photography', 'professional', 'headshots']
    }
  },
  'demo-video-3': {
    id: 'demo-video-3',
    title: 'Behind the Scenes: AI Training Process',
    description: 'Take a look behind the scenes at how we train our AI models to create stunning professional headshots.',
    duration: 300, // 5 minutes
    thumbnailUrl: '/video-thumbnails/behind-scenes-thumb.jpg',
    videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0', // Demo YouTube video
    provider: 'youtube',
    providerId: '9bZkp7q19f0',
    quality: {
      '480p': 'https://www.youtube.com/embed/9bZkp7q19f0?quality=small',
      '720p': 'https://www.youtube.com/embed/9bZkp7q19f0?quality=medium',
      '1080p': 'https://www.youtube.com/embed/9bZkp7q19f0?quality=large',
    },
    metadata: {
      uploadDate: '2024-01-25T09:15:00Z',
      views: 12750,
      category: 'Behind the Scenes',
      tags: ['AI', 'training', 'technology', 'machine learning']
    }
  }
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    // Check if video exists
    const video = mockVideos[videoId];
    if (!video) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Video not found',
          availableVideos: Object.keys(mockVideos)
        },
        { status: 404 }
      );
    }

    // Simulate some processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: video,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Video API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to fetch video data'
      },
      { status: 500 }
    );
  }
}

// Optional: Handle other HTTP methods
export async function POST(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed',
      message: 'POST method is not supported for video endpoints'
    },
    { status: 405 }
  );
}
