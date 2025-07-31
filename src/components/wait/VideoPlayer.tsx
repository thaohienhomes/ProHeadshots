'use client';

import { useState, useRef, useEffect } from 'react';
import {
  videoManager,
  VideoContent,
  VideoAnalytics,
  getDeviceType,
  getOptimalQuality
} from '@/lib/video/videoManager';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  description?: string;
  autoplay?: boolean;
  onAnalytics?: (analytics: Partial<VideoAnalytics>) => void;
}

export default function VideoPlayer({
  videoId,
  title,
  description,
  autoplay = false,
  onAnalytics
}: VideoPlayerProps) {
  const [videoContent, setVideoContent] = useState<VideoContent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analytics tracking
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [watchDuration, setWatchDuration] = useState(0);
  const [interactions, setInteractions] = useState({
    play: 0,
    pause: 0,
    seek: 0,
    volumeChange: 0,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const analyticsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load video content
  useEffect(() => {
    const loadVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const content = await videoManager.getVideo(videoId);
        if (content) {
          setVideoContent(content);

          // Preload video for better performance
          videoManager.preloadVideo(videoId);
        } else {
          setError('Video not found');
        }
      } catch (err) {
        setError('Failed to load video');
        console.error('Error loading video:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [videoId]);

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoContent) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setWatchDuration(prev => prev + 0.25); // Update every 250ms
    };

    const updateDuration = () => setTotalDuration(video.duration);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => setError('Video playback error');

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoContent]);

  // Analytics tracking
  useEffect(() => {
    if (!videoContent || !isPlaying) return;

    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }

    // Track analytics every 10 seconds while playing
    analyticsIntervalRef.current = setInterval(() => {
      if (onAnalytics && sessionStartTime) {
        onAnalytics({
          videoId: videoContent.id,
          startTime: sessionStartTime.toISOString(),
          watchDuration,
          completed: currentTime >= totalDuration * 0.95,
          interactions,
          quality: getOptimalQuality(),
          device: getDeviceType(),
        });
      }
    }, 10000);

    return () => {
      if (analyticsIntervalRef.current) {
        clearInterval(analyticsIntervalRef.current);
      }
    };
  }, [isPlaying, videoContent, sessionStartTime, watchDuration, currentTime, totalDuration, interactions, onAnalytics]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setInteractions(prev => ({ ...prev, pause: prev.pause + 1 }));
    } else {
      video.play();
      setInteractions(prev => ({ ...prev, play: prev.play + 1 }));
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * totalDuration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
    setInteractions(prev => ({ ...prev, seek: prev.seek + 1 }));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
    setInteractions(prev => ({ ...prev, volumeChange: prev.volumeChange + 1 }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    setInteractions(prev => ({ ...prev, volumeChange: prev.volumeChange + 1 }));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="p-4 bg-navy-800/20 border border-navy-600/20 rounded-lg">
        <div className="text-center text-navy-400">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !videoContent) {
    return (
      <div className="p-4 bg-navy-800/20 border border-navy-600/20 rounded-lg">
        <div className="text-center text-navy-400">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-800/20 border border-navy-600/20 rounded-lg overflow-hidden">
      {/* Video Header */}
      <div className="p-3 border-b border-navy-600/20">
        <h4 className="text-cyan-300 text-sm font-medium mb-1">
          {title || videoContent.title}
        </h4>
        <p className="text-navy-300 text-xs">
          {description || videoContent.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-navy-400 text-xs">
            {formatTime(videoContent.duration)}
          </span>
          <span className="text-navy-500">•</span>
          <span className="text-navy-400 text-xs">
            {videoContent.viewCount.toLocaleString()} views
          </span>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative bg-black">
        {!isPlaying && (
          <div 
            className="absolute inset-0 bg-navy-900/80 flex items-center justify-center cursor-pointer z-10"
            onClick={togglePlay}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-2 mx-auto hover:bg-cyan-500/30 transition-colors">
                <svg className="w-8 h-8 text-cyan-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium">Play Video</p>
              <p className="text-navy-300 text-xs">{formatTime(videoContent.duration)}</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-48 object-cover"
          poster={videoManager.getThumbnailUrl(videoContent, 'medium')}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          <source
            src={videoManager.getVideoUrl(videoContent, getOptimalQuality())}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-navy-900/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Video Controls */}
        {showControls && isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            {/* Progress Bar */}
            <div 
              ref={progressRef}
              className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-2"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-cyan-400 rounded-full transition-all duration-100"
                style={{ width: `${totalDuration ? (currentTime / totalDuration) * 100 : 0}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-cyan-400 transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <span className="text-white text-xs">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-cyan-400 transition-colors"
                >
                  {isMuted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793A1 1 0 019.383 3.076zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793A1 1 0 019.383 3.076zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
