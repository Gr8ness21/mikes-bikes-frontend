import { useEffect } from 'react';

function kickPlay(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.loop = false;
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
    let leaving = false;
    let fallback: number | undefined;

    const enter = () => {
      if (leaving) return;
      leaving = true;
      if (fallback) window.clearTimeout(fallback);
      gate.classList.add('is-wiping');
    };

    const armFallback = () => {
      if (fallback) window.clearTimeout(fallback);
      const ms = video && Number.isFinite(video.duration) && video.duration > 0
        ? Math.ceil(video.duration * 1000) + 400
        : 3500;
      fallback = window.setTimeout(enter, ms);
    };

    if (video) {
      video.loop = false;
      video.removeAttribute('loop');
      kickPlay(video);
      video.addEventListener('loadeddata', () => kickPlay(video));
      video.addEventListener('canplay', () => {
        kickPlay(video);
        armFallback();
      });
      video.addEventListener('ended', enter);
      armFallback();
    } else {
      armFallback();
    }

    const onVis = () => {
      if (document.visibilityState === 'visible' && video && !leaving) kickPlay(video);
    };

    const onAnimEnd = () => {
      if (!gate.classList.contains('is-wiping')) return;
      gate.remove();
      document.body.style.overflow = '';
    };

    gate.addEventListener('animationend', onAnimEnd);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pageshow', onVis);

    return () => {
      if (fallback) window.clearTimeout(fallback);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pageshow', onVis);
      gate.removeEventListener('animationend', onAnimEnd);
      video?.removeEventListener('ended', enter);
    };
  }, []);

  return null;
}
