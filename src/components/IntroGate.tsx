import { useEffect } from 'react';

function kickPlay(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', 'true');
  void video.play().catch(() => {});
}

export default function IntroGate() {
  useEffect(() => {
    const gate = document.getElementById('intro-gate');
    const video = document.getElementById('intro-video') as HTMLVideoElement | null;
    if (!gate) return;

    document.body.style.overflow = 'hidden';
    if (video) kickPlay(video);

    let start: { x: number; y: number } | null = null;
    let leaving = false;

    const enter = () => {
      if (leaving) return;
      leaving = true;
      gate.classList.add('is-wiping');
    };

    const onKey = (e: KeyboardEvent) => {
      if (leaving || !document.body.contains(gate)) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        enter();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      start = { x: e.clientX, y: e.clientY };
      if (video) kickPlay(video);
    };

    const onPointerUp = (e: PointerEvent) => {
      const from = start;
      start = null;
      if (!from) {
        enter();
        return;
      }
      const moved = Math.hypot(e.clientX - from.x, e.clientY - from.y) > 36;
      const tap = Math.hypot(e.clientX - from.x, e.clientY - from.y) < 12;
      if (moved || tap) enter();
    };

    const onCancel = () => {
      start = null;
    };

    const onVis = () => {
      if (document.visibilityState === 'visible' && video) kickPlay(video);
    };

    const onAnimEnd = () => {
      if (!gate.classList.contains('is-wiping')) return;
      gate.remove();
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };

    gate.addEventListener('pointerdown', onPointerDown);
    gate.addEventListener('pointerup', onPointerUp);
    gate.addEventListener('pointercancel', onCancel);
    gate.addEventListener('animationend', onAnimEnd);
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pageshow', onVis);
    video?.addEventListener('loadeddata', () => kickPlay(video));
    video?.addEventListener('canplay', () => kickPlay(video));

    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pageshow', onVis);
      gate.removeEventListener('pointerdown', onPointerDown);
      gate.removeEventListener('pointerup', onPointerUp);
      gate.removeEventListener('pointercancel', onCancel);
      gate.removeEventListener('animationend', onAnimEnd);
    };
  }, []);

  return null;
}
