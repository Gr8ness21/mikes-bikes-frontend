import { useCallback, useEffect, useRef, useState } from 'react';
import introVideo from "../assets/Mike's Bikes 2.MP4";

export default function IntroGate() {
  const [open, setOpen] = useState(true);
  const [wiping, setWiping] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const leaving = useRef(false);

  const enter = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    setWiping(true);
  }, []);

  const kickPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    const play = () => {
      video.play().catch(() => {});
    };
    play();
    requestAnimationFrame(play);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const video = videoRef.current;
    kickPlay();
    const events = ['loadeddata', 'canplay', 'canplaythrough', 'playing'] as const;
    events.forEach((name) => video?.addEventListener(name, kickPlay));
    const onVis = () => {
      if (document.visibilityState === 'visible') kickPlay();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pageshow', kickPlay);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      events.forEach((name) => video?.removeEventListener(name, kickPlay));
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pageshow', kickPlay);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, enter, kickPlay]);

  if (!open) return null;

  function onPointerDown(e: React.PointerEvent) {
    startRef.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: React.PointerEvent) {
    const start = startRef.current;
    startRef.current = null;
    if (!start) {
      enter();
      return;
    }
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const moved = Math.hypot(dx, dy) > 36;
    const tap = Math.hypot(dx, dy) < 12;
    if (moved || tap) enter();
  }

  return (
    <div
      className={`intro-gate${wiping ? ' is-wiping' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Swipe to enter Mike's Bikes"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        startRef.current = null;
      }}
      onAnimationEnd={() => {
        if (wiping) setOpen(false);
      }}
    >
      <video
        ref={videoRef}
        src={introVideo}
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
        disablePictureInPicture
        controls={false}
        aria-hidden
      />
      <p className="intro-gate-hint">Swipe to enter</p>
    </div>
  );
}
