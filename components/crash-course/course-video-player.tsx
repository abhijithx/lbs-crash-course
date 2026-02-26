"use client"

interface CourseVideoPlayerProps {
  videoId: string
}

export default function CourseVideoPlayer({ videoId }: CourseVideoPlayerProps) {
  if (!videoId) return null;

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder={0}
      />
    </div>
  );
}
