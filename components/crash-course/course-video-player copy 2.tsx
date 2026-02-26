"use client"

import { useEffect, useRef, useState } from "react"
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  SkipForward,
  SkipBack,
  Settings,
  Loader,
  Maximize,
  Minimize,
  Subtitles,
} from "lucide-react"

interface CourseVideoPlayerProps {
  videoId: string
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function CourseVideoPlayer({ videoId }: CourseVideoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [availableQualities, setAvailableQualities] = useState<string[]>([])
  const [currentQuality, setCurrentQuality] = useState("")
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState<"quality" | "speed">("quality")
  const [captionsEnabled, setCaptionsEnabled] = useState(false)
  const [availableCaptions, setAvailableCaptions] = useState<any[]>([])
  const [currentCaptionTrack, setCurrentCaptionTrack] = useState<string>("")

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Load YouTube API
  useEffect(() => {
    // Only load the API once
    if (!document.getElementById("youtube-api")) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      tag.id = "youtube-api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = initializePlayer

    // If API was already loaded before this component mounted
    if (window.YT && window.YT.Player) {
      initializePlayer()
    }

    // Prevent right-click on the entire player container
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Prevent keyboard interactions when player is focused
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement === playerRef.current ||
        playerRef.current?.contains(document.activeElement as Node) ||
        e.key === "c" || // Copy shortcut
        e.key === "C" ||
        (e.ctrlKey && e.key === "c") || // Ctrl+C
        (e.ctrlKey && e.key === "C") ||
        e.key === "F11" || // Fullscreen
        e.key === "f" || // YouTube fullscreen shortcut
        e.key === "i" || // YouTube info panel
        e.key === "t" || // YouTube theater mode
        e.key === "s" // YouTube shortcuts menu
      ) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement === containerRef.current ||
          document.webkitFullscreenElement === containerRef.current,
      )
    }

    document.addEventListener("contextmenu", handleContextMenu, true)
    document.addEventListener("keydown", handleKeyDown, true)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true)
      document.removeEventListener("keydown", handleKeyDown, true)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)

      // Cleanup player
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy()
      }

      // Clear progress tracking interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])
  useEffect(() => {
    if (isReady && playerInstanceRef.current && videoId) {
      setIsBuffering(true)
      playerInstanceRef.current.loadVideoById(videoId)

      // Let the player choose optimal quality instead of forcing 'auto'
      setTimeout(() => {
        try {
          const availableQuals = playerInstanceRef.current.getAvailableQualityLevels() || []
          let preferredQuality = "auto"

          // Prefer higher quality
          if (availableQuals.includes("hd720")) {
            preferredQuality = "hd720"
          } else if (availableQuals.includes("large")) {
            preferredQuality = "large"
          }

          playerInstanceRef.current.setPlaybackQuality(preferredQuality)
          setCurrentQuality(preferredQuality)
        } catch (error) {
          console.log("Could not set preferred quality:", error)
        }
      }, 1500)

      // Re-apply security measures when video changes
      setTimeout(() => {
        const iframe = playerRef.current?.querySelector("iframe")
        if (iframe) {
          iframe.style.pointerEvents = "none"
        }
      }, 500)
    }
  }, [videoId, isReady])

  // Secure the iframe
  useEffect(() => {
    const secureIframe = () => {
      // Find the YouTube iframe in the DOM
      const iframe = playerRef.current?.querySelector("iframe")
      if (iframe) {
        iframeRef.current = iframe as HTMLIFrameElement

        // Apply additional security attributes
        iframe.setAttribute("title", "Secure Video Player")

        // Remove title and info attributes that might display the URL
        iframe.removeAttribute("allowfullscreen")

        // Disable pointer events on the iframe directly to prevent clicking
        iframe.style.pointerEvents = "none"

        // Add overlay div to intercept all clicks
        const overlay = document.createElement("div")
        overlay.style.position = "absolute"
        overlay.style.top = "0"
        overlay.style.left = "0"
        overlay.style.width = "100%"
        overlay.style.height = "100%"
        overlay.style.zIndex = "1"

        // Allow clicks to pass through to our custom controls
        overlay.addEventListener("click", (e) => {
          togglePlay()
          e.preventDefault()
          e.stopPropagation()
        })

        // Prevent right-click on the overlay
        overlay.addEventListener("contextmenu", (e) => {
          e.preventDefault()
          e.stopPropagation()
          return false
        })

        // Add the overlay to the player container
        if (playerRef.current && !playerRef.current.querySelector(".player-overlay")) {
          overlay.className = "player-overlay"
          playerRef.current.appendChild(overlay)
        }
      }
    }

    // Call immediately and also set up a few retry attempts
    // as the iframe might not be immediately available
    secureIframe()
    const retryIntervals = [100, 500, 1000, 2000]
    retryIntervals.forEach((delay) => {
      setTimeout(secureIframe, delay)
    })
  }, [isReady, isPlaying])

  // Update player when video ID changes
  useEffect(() => {
    if (isReady && playerInstanceRef.current && videoId) {
      // Remove this line: simpleQualityChange(event ,"auto")
      setIsBuffering(true)
      playerInstanceRef.current.loadVideoById(videoId)

      // Re-apply security measures when video changes
      setTimeout(() => {
        const iframe = playerRef.current?.querySelector("iframe")
        if (iframe) {
          iframe.style.pointerEvents = "none"
        }
      }, 500)
    }
  }, [videoId, isReady])

  // Handle clicking outside settings menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettings && settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSettings])

  // Handle clicking outside volume slider
  useEffect(() => {
    const handleClickOutsideVolume = (event: MouseEvent) => {
      if (showVolumeSlider && !(event.target as Element).closest(".volume-container")) {
        setShowVolumeSlider(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutsideVolume)
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideVolume)
    }
  }, [showVolumeSlider])

  // Auto-hide controls
  useEffect(() => {
    let hideTimeout: NodeJS.Timeout | null = null

    const resetControlsTimeout = () => {
      if (hideTimeout) clearTimeout(hideTimeout)
      setShowControls(true)
      hideTimeout = setTimeout(() => setShowControls(false), 3000)
    }

    if (isPlaying) {
      resetControlsTimeout()

      const container = containerRef.current
      if (container) {
        container.addEventListener("mousemove", resetControlsTimeout)
        container.addEventListener("touchstart", resetControlsTimeout, { passive: true })
        return () => {
          container.removeEventListener("mousemove", resetControlsTimeout)
          container.removeEventListener("touchstart", resetControlsTimeout)
          if (hideTimeout) clearTimeout(hideTimeout)
        }
      }
    } else {
      setShowControls(true)
      if (hideTimeout) clearTimeout(hideTimeout)
    }

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout)
    }
  }, [isPlaying])

  // Initialize YouTube player
  const initializePlayer = () => {
    if (!playerRef.current) return

    playerInstanceRef.current = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        iv_load_policy: 3, // Hide annotations
        disablekb: 1, // Disable keyboard controls
        enablejsapi: 1, // Enable the JavaScript API
        origin: window.location.origin,
        widget_referrer: window.location.origin,
        playsinline: 1, // Better for mobile
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    })
  }

  const onPlayerReady = (event: any) => {
    setIsReady(true)

    // Get and set the video duration
    const videoDuration = event.target.getDuration()
    setDuration(videoDuration)

    // Get available quality levels with multiple attempts for mobile
    const getQualities = () => {
      const qualities = event.target.getAvailableQualityLevels()
      return qualities && qualities.length > 0 ? qualities : []
    }

    // Try to get qualities immediately
    let qualities = getQualities()

    // If no qualities found, retry multiple times (especially important for mobile)
    if (qualities.length === 0) {
      let attempts = 0
      const maxAttempts = 5
      const retryInterval = setInterval(() => {
        qualities = getQualities()
        attempts++

        if (qualities.length > 0 || attempts >= maxAttempts) {
          clearInterval(retryInterval)
          setAvailableQualities(qualities.length > 0 ? qualities : ["auto", "hd1080", "hd720", "large", "medium"])
        }
      }, 500)
    } else {
      setAvailableQualities(qualities)
    }

    // Set higher quality preference instead of defaulting to low
    const currentQual = event.target.getPlaybackQuality()

    // Prefer higher quality - try hd720 first, then hd1080 if available
    setTimeout(() => {
      const availableQuals = event.target.getAvailableQualityLevels() || []
      let preferredQuality = "auto"

      // Choose the best available quality
      if (availableQuals.includes("hd1080")) {
        preferredQuality = "hd1080"
      } else if (availableQuals.includes("hd720")) {
        preferredQuality = "hd720"
      } else if (availableQuals.includes("large")) {
        preferredQuality = "large"
      }

      event.target.setPlaybackQuality(preferredQuality)
      setCurrentQuality(preferredQuality)
    }, 1000)

    // Get available caption tracks
    try {
      const captionTracks = event.target.getOption("captions", "tracklist")
      if (captionTracks && captionTracks.length > 0) {
        setAvailableCaptions(captionTracks)
        // Check if captions are currently enabled
        const currentTrack = event.target.getOption("captions", "track")
        if (currentTrack && currentTrack.languageCode) {
          setCaptionsEnabled(true)
          setCurrentCaptionTrack(currentTrack.languageCode)
        }
      }
    } catch (error) {
      console.log("Captions not available or error getting caption info:", error)
    }

    // Start progress tracking
    startProgressTracking()

    // Apply security measures to iframe
    setTimeout(() => {
      const iframe = playerRef.current?.querySelector("iframe")
      if (iframe && iframe !== iframeRef.current) {
        iframeRef.current = iframe as HTMLIFrameElement
        iframe.style.pointerEvents = "none"
      }
    }, 100)
  }

  const onPlayerStateChange = (event: any) => {
    // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
    switch (event.data) {
      case 1: // playing
        setIsPlaying(true)
        setIsBuffering(false)

        // Double check the duration when playback starts
        if (duration === 0) {
          const videoDuration = event.target.getDuration()
          setDuration(videoDuration)
        }
        break
      case 2: // paused
        setIsPlaying(false)
        setIsBuffering(false)
        break
      case 3: // buffering
        setIsBuffering(true)
        break
      case 0: // ended
        setIsPlaying(false)
        setIsBuffering(false)
        break
      default:
        break
    }
  }

  const onPlayerError = (event: any) => {
    console.error("YouTube player error:", event.data)
    setIsBuffering(false)
  }

  const startProgressTracking = () => {
    // Clear existing interval if any
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    // Create new interval for tracking progress
    progressIntervalRef.current = setInterval(() => {
      if (playerInstanceRef.current) {
        try {
          // Update current time
          const currentTime = playerInstanceRef.current.getCurrentTime() || 0
          setCurrentTime(currentTime)

          // Double check duration if it's still 0
          if (duration === 0) {
            const videoDuration = playerInstanceRef.current.getDuration() || 0
            if (videoDuration > 0) {
              setDuration(videoDuration)
            }
          }
        } catch (error) {
          console.error("Error while tracking progress:", error)
        }
      }
    }, 1000)
  }

  // Player controls
  const togglePlay = () => {
    if (!playerInstanceRef.current) return

    if (isPlaying) {
      playerInstanceRef.current.pauseVideo()
    } else {
      playerInstanceRef.current.playVideo()
    }
  }

  const seek = (seconds: number) => {
    if (!playerInstanceRef.current) return

    const newTime = currentTime + seconds
    playerInstanceRef.current.seekTo(newTime, true)
    setCurrentTime(newTime)
  }

  const seekTo = (time: number) => {
    if (!playerInstanceRef.current) return

    // Ensure time is within valid range
    const safeTime = Math.max(0, Math.min(time, duration))
    playerInstanceRef.current.seekTo(safeTime, true)
    setCurrentTime(safeTime)
  }

  const toggleMute = () => {
    if (!playerInstanceRef.current) return

    if (isMuted) {
      playerInstanceRef.current.unMute()
      setIsMuted(false)
    } else {
      playerInstanceRef.current.mute()
      setIsMuted(true)
    }
  }

  const changeVolume = (newVolume: number) => {
    if (!playerInstanceRef.current) return

    playerInstanceRef.current.setVolume(newVolume)
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  // const changeQuality = (quality: string) => {
  //   if (!playerInstanceRef.current) return

  //   playerInstanceRef.current.setPlaybackQuality(quality)
  //   setCurrentQuality(quality)
  //   setShowSettings(false) // Close settings after selection
  // }

  // Simple quality change function
  const simpleQualityChange = (event: any, quality: string) => {
    if (!playerInstanceRef.current) return

    const currentTime = playerInstanceRef.current.getCurrentTime()
    const wasPlaying = isPlaying

    // Set the playback quality with force refresh
    playerInstanceRef.current.setPlaybackQuality(quality)

    // For mobile devices, we need to be more aggressive about quality changes
    if (isMobile) {
      // Pause briefly to ensure quality change takes effect
      if (wasPlaying) {
        playerInstanceRef.current.pauseVideo()
      }

      setTimeout(() => {
        // Force a small seek to trigger quality change
        playerInstanceRef.current.seekTo(Math.max(0, currentTime - 0.1), true)
        setTimeout(() => {
          playerInstanceRef.current.seekTo(currentTime, true)
          if (wasPlaying) {
            playerInstanceRef.current.playVideo()
          }
        }, 200)
      }, 300)
    } else {
      // Desktop handling
      setTimeout(() => {
        playerInstanceRef.current.seekTo(currentTime, true)
        if (wasPlaying) {
          playerInstanceRef.current.playVideo()
        }
      }, 500)
    }

    // Update the current quality state
    setCurrentQuality(quality)

    // Close settings menu
    setShowSettings(false)

    // Show loading state
    setIsBuffering(true)
    setTimeout(
      () => {
        setIsBuffering(false)
      },
      isMobile ? 3000 : 2000,
    )
  }

  const changePlaybackRate = (rate: number) => {
    if (!playerInstanceRef.current) return

    playerInstanceRef.current.setPlaybackRate(rate)
    setPlaybackRate(rate)
    setShowSettings(false) // Close settings after selection
  }

  // Toggle captions
  const toggleCaptions = () => {
    if (!playerInstanceRef.current) return

    try {
      if (captionsEnabled) {
        // Turn off captions
        playerInstanceRef.current.unloadModule("captions")
        setCaptionsEnabled(false)
        setCurrentCaptionTrack("")
      } else {
        // Turn on captions - try to use the first available track
        const captionTracks = playerInstanceRef.current.getOption("captions", "tracklist")
        if (captionTracks && captionTracks.length > 0) {
          const firstTrack = captionTracks[0]
          playerInstanceRef.current.setOption("captions", "track", firstTrack)
          playerInstanceRef.current.loadModule("captions")
          setCaptionsEnabled(true)
          setCurrentCaptionTrack(firstTrack.languageCode || firstTrack.name || "")
        } else {
          // If no specific tracks, try to enable default captions
          try {
            playerInstanceRef.current.loadModule("captions")
            setCaptionsEnabled(true)
          } catch (e) {
            console.log("No captions available for this video")
          }
        }
      }
    } catch (error) {
      console.log("Error toggling captions:", error)
      // Fallback: try basic caption toggle
      try {
        if (captionsEnabled) {
          playerInstanceRef.current.unloadModule("captions")
          setCaptionsEnabled(false)
        } else {
          playerInstanceRef.current.loadModule("captions")
          setCaptionsEnabled(true)
        }
      } catch (fallbackError) {
        console.log("Captions not supported for this video")
      }
    }
  }
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) seconds = 0

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Get volume icon based on volume level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
    if (volume < 50) return <Volume1 className="w-4 h-4 sm:w-5 sm:h-5" />
    return <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
  }

  // Format quality labels to be more user-friendly
  const formatQualityLabel = (quality: string) => {
    switch (quality) {
      case "hd1080":
        return "1080p"
      case "hd720":
        return "720p"
      case "large":
        return "480p"
      case "medium":
        return "360p"
      case "small":
        return "240p"
      case "tiny":
        return "144p"
      case "auto":
        return "Auto"
      default:
        return quality
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        ;(containerRef.current as any).webkitRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        ;(document as any).webkitExitFullscreen()
      }
    }
  }

  // Update the displayQualities logic to be more robust for mobile
  const displayQualities = (() => {
    if (availableQualities.length > 0) {
      return availableQualities
    }

    // Enhanced fallback for mobile devices
    if (isMobile) {
      return ["auto", "hd720", "large", "medium", "small"]
    }

    return ["auto", "hd1080", "hd720", "large", "medium", "small", "tiny"]
  })()

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden touch-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      {/* CSS for responsive styles */}
      <style jsx>{`
        /* Custom input range styling for better mobile experience */
        input[type=range] {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.3);
          outline: none;
        }
        
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        
        input[type=range]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
        }

        .no-youtube-ui iframe {
          pointer-events: none !important;
        }
        
        /* Hide YouTube logo */
        .ytp-chrome-top-buttons, 
        .ytp-watermark, 
        .ytp-youtube-button,
        .ytp-show-cards-title,
        .ytp-title {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }

        /* Settings menu tab styling */
        .settings-tab {
          cursor: pointer;
          padding: 6px 12px;
          font-size: 0.75rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .settings-tab.active {
          background-color: rgba(59, 130, 246, 1); /* blue-600 */
        }

        .settings-tab:not(.active) {
          background-color: rgba(75, 85, 99, 1); /* gray-600 */
        }

        /* Mobile-specific control styles */
        @media (max-width: 640px) {
          .mobile-controls {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
          }
          
          .mobile-controls-left,
          .mobile-controls-right {
            display: flex;
            align-items: center;
          }
        }
      `}</style>

      {/* Player container */}
      <div
        className={`aspect-video w-full ${isFullscreen ? "h-full" : ""}`}
        style={{ cursor: "pointer", position: "relative" }}
      >
        <div ref={playerRef} className="w-full h-full no-youtube-ui" />

        {/* Top overlay to hide YouTube title and share buttons */}
        <div
          className={`absolute top-0 left-0 right-0 ${
            !isPlaying
              ? "bg-gradient-to-b from-black via-black/80 to-black/40"
              : "bg-gradient-to-b from-black/60 to-transparent"
          } h-16 sm:h-20 transition-all duration-300 z-25`}
        ></div>

        {/* Transparent overlay to intercept clicks */}
        <div
          className="absolute inset-0 z-10"
          onClick={togglePlay}
          onContextMenu={(e) => e.preventDefault()}
          style={{ cursor: "pointer" }}
        ></div>
      </div>

      {/* Play/Pause button overlay in center of video */}
      {!isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-20" onClick={togglePlay}>
          {!isPlaying && (
            <div className="bg-black bg-opacity-50 rounded-full p-3 sm:p-4">
              <Play className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Loading overlay */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <Loader className="w-8 h-8 sm:w-12 sm:h-12 text-white animate-spin" />
        </div>
      )}

      {/* Custom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 ${
          !isPlaying
            ? "bg-gradient-to-t from-black via-black/80 to-black/40"
            : "bg-gradient-to-t from-black to-transparent"
        } px-2 sm:px-4 pb-2 sm:pb-4 pt-6 transition-all duration-300 z-30 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress bar */}
        <div className="mb-2 sm:mb-4">
          <div
            className="relative h-1.5 sm:h-2 bg-gray-600 rounded cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pos = (e.clientX - rect.left) / rect.width
              seekTo(pos * duration)
            }}
          >
            <div
              className="absolute h-full bg-blue-500 rounded"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            <div
              className="absolute top-1/2 transform -translate-y-1/2"
              style={{
                left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                marginLeft: "-5px",
              }}
            >
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        {isMobile ? (
          <div className="mobile-controls">
            <div className="mobile-controls-left">
              <button
                className="text-white p-1.5 rounded-full hover:bg-white hover:bg-opacity-20"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                className="text-white p-1.5 rounded-full hover:bg-white hover:bg-opacity-20"
                onClick={() => seek(-10)}
                aria-label="Rewind 10 seconds"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                className="text-white p-1.5 rounded-full hover:bg-white hover:bg-opacity-20"
                onClick={() => seek(10)}
                aria-label="Forward 10 seconds"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                className="text-white p-1.5 rounded-full hover:bg-white hover:bg-opacity-20"
                onClick={toggleCaptions}
                aria-label={captionsEnabled ? "Turn off captions" : "Turn on captions"}
              >
                <Subtitles className={`w-4 h-4 ${captionsEnabled ? "text-blue-400" : ""}`} />
              </button>
            </div>

            <div className="mobile-controls-right">
              <div className="relative volume-container">
                <button
                  className="text-white p-1.5 rounded-full hover:bg-white hover:bg-opacity-20"
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  aria-label="Volume"
                >
                  {getVolumeIcon()}
                </button>

                {showVolumeSlider && (
                  <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded p-2 w-32">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => changeVolume(Number.parseInt(e.target.value))}
                      className="w-full"
                      aria-label="Volume"
                    />
                    <button
                      className="text-white text-xs mt-2 w-full py-1 px-2 bg-gray-700 rounded"
                      onClick={toggleMute}
                    >
                      {isMuted ? "Unmute" : "Mute"}
                    </button>
                  </div>
                )}
              </div>

              <button
                className="text-white p-1.5 rounded-full hover:bg-white hover:bg-opacity-20"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>

              <div className="relative">
                <button
                  className="text-white p-1.5 rounded-full hover:bg-white hover:bg-opacity-20"
                  aria-label="Settings"
                  onClick={() => {
                    setShowSettings(!showSettings)
                    // Ensure quality tab is selected when opening settings
                    if (!showSettings && !activeSettingsTab) {
                      setActiveSettingsTab("quality")
                    }
                  }}
                >
                  <Settings className="w-4 h-4" />
                </button>

                {showSettings && (
                  <div
                    ref={settingsRef}
                    className="absolute right-0 bottom-full mb-2 bg-gray-800 rounded p-2 w-56 z-10 settings-menu"
                  >
                    <div className="flex mb-2 space-x-1">
                      <div
                        className={`settings-tab ${activeSettingsTab === "quality" || !activeSettingsTab ? "active" : ""}`}
                        onClick={() => setActiveSettingsTab("quality")}
                      >
                        Quality
                      </div>
                      <div
                        className={`settings-tab ${activeSettingsTab === "speed" ? "active" : ""}`}
                        onClick={() => setActiveSettingsTab("speed")}
                      >
                        Speed
                      </div>
                    </div>

                    {(activeSettingsTab === "quality" || !activeSettingsTab) && (
                      <div className="grid grid-cols-2 gap-1">
                        {displayQualities &&
                          displayQualities.map((quality) => (
                            <button
                              key={quality}
                              className={`text-xs p-1 rounded ${
                                currentQuality === quality ? "bg-blue-600" : "bg-gray-700"
                              } text-white hover:bg-opacity-80`}
                              onClick={(event) => simpleQualityChange(event, quality)}
                            >
                              {formatQualityLabel(quality)}
                            </button>
                          ))}
                      </div>
                    )}

                    {activeSettingsTab === "speed" && (
                      <div className="grid grid-cols-3 gap-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            className={`text-xs p-1 rounded ${
                              playbackRate === rate ? "bg-blue-600" : "bg-gray-700"
                            } text-white hover:bg-opacity-80`}
                            onClick={() => changePlaybackRate(rate)}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Desktop controls layout
          <div className="flex items-center">
            <button
              className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
              onClick={() => seek(-10)}
              aria-label="Rewind 10 seconds"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
              onClick={() => seek(10)}
              aria-label="Forward 10 seconds"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            <button
              className="text-white p-1.5 rounded-full hover:bg-white hover:bg-opacity-20"
              onClick={toggleCaptions}
              aria-label={captionsEnabled ? "Turn off captions" : "Turn on captions"}
            >
              <Subtitles className={`w-4 h-4 ${captionsEnabled ? "text-blue-400" : ""}`} />
            </button>

            <div className="flex items-center ml-4 relative volume-container">
              <button
                className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                onClick={toggleMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {getVolumeIcon()}
              </button>

              <div
                className={`ml-2 transition-opacity duration-200 ${showVolumeSlider ? "opacity-100" : "opacity-0"}`}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => changeVolume(Number.parseInt(e.target.value))}
                  className="w-24"
                  aria-label="Volume"
                />
              </div>
            </div>

            {/* Fullscreen button */}
            <button
              className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20 ml-4"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            {/* Quality and settings selector */}
            <div className="relative ml-auto">
              <button
                className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                aria-label="Settings"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettings && (
                <div
                  ref={settingsRef}
                  className="absolute right-0 bottom-full mb-2 bg-gray-800 rounded p-3 w-56 z-10 settings-menu"
                >
                  <div className="flex mb-3 space-x-2">
                    <div
                      className={`settings-tab ${activeSettingsTab === "quality" ? "active" : ""}`}
                      onClick={() => setActiveSettingsTab("quality")}
                    >
                      Quality
                    </div>
                    <div
                      className={`settings-tab ${activeSettingsTab === "speed" ? "active" : ""}`}
                      onClick={() => setActiveSettingsTab("speed")}
                    >
                      Speed
                    </div>
                  </div>
                  {activeSettingsTab === "quality" && (
                    <div>
                      <div className="grid grid-cols-2 gap-1">
                        {displayQualities.map((quality) => (
                          <button
                            key={quality}
                            className={`text-xs p-1 rounded ${
                              currentQuality === quality ? "bg-blue-600" : "bg-gray-700"
                            } text-white hover:bg-opacity-80 transition-colors`}
                            onClick={(event) => simpleQualityChange(event, quality)}
                          >
                            {formatQualityLabel(quality)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "speed" && (
                    <div>
                      <div className="grid grid-cols-3 gap-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            className={`text-xs p-1 rounded ${
                              playbackRate === rate ? "bg-blue-600" : "bg-gray-700"
                            } text-white hover:bg-opacity-80`}
                            onClick={() => changePlaybackRate(rate)}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
