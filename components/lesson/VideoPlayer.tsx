'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  duration: number;
  transcript?: string;
  thumbnailUrl?: string;
}

export function VideoPlayer({ videoUrl, duration, transcript }: VideoPlayerProps) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const youtubeId = getYouTubeId(videoUrl);
  const embedUrl = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`
    : videoUrl;

  return (
    <Card className="border-l-4 border-l-red-500 my-4">
      <CardContent className="space-y-4 pt-6">
        {/* Video Embed */}
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {!videoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Button
                onClick={() => setVideoLoaded(true)}
                size="lg"
                className="flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                Load Video
              </Button>
            </div>
          )}
          {videoLoaded && (
            <iframe
              src={embedUrl}
              title="Video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Duration: {duration} minutes</span>
        </div>

        {/* Transcript Section */}
        {transcript && (
          <div>
            <Button
              variant="outline"
              onClick={() => setTranscriptOpen(!transcriptOpen)}
              className="w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Video Transcript
              </span>
              {transcriptOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {transcriptOpen && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                    {transcript}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
