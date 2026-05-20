import React, { useEffect, useRef } from 'react'
import MuxPlayer from '@mux/mux-player-react'

export const MuxVideo: React.FC<{ playbackId: string }> = ({ playbackId }) => {
  const playerRef = useRef<any>(null)

  useEffect(() => {
    if (!playerRef.current) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playerRef.current?.play().catch((e: any) => {
            console.log("Autoplay prevented:", e)
          })
        } else {
          playerRef.current?.pause()
        }
      })
    }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 })

    observer.observe(playerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handlePlay = () => {
    const allPlayers = document.querySelectorAll('mux-player')
    allPlayers.forEach((p: any) => {
      if (p !== playerRef.current) {
        p.pause()
      }
    })
  }

  return (
    <div className="w-full my-8 aspect-video">
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        muted={true}
        loop={true}
        playsInline={true}
        style={{ width: '100%', height: '100%' }}
        onPlay={handlePlay}
      />
    </div>
  )
}
