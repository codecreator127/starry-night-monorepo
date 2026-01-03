'use client';

import { useEffect, useState } from 'react';
import StarryNight from '@/components/StarryNight';
import RocketCursor from 'rocket-cursor-component';

export default function HomePage() {
  const [cursorSize, setCursorSize] = useState(48);
  const [enableCursor, setEnableCursor] = useState(false);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const isTouch =
        window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(hover: none)').matches;

      // Disable on mobile or small view
      const shouldEnable = width >= 768 && !isTouch;

      setEnableCursor(shouldEnable);

      if (!shouldEnable) return;

      const size = Math.min(72, Math.max(40, Math.round(width * 0.04)));

      setCursorSize(size);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div>
      {enableCursor && (
        <RocketCursor
          size={cursorSize}
          threshold={12}
          flameHideTimeout={250}
          hideCursor={true}
          followSpeed={0.35}
        />
      )}
      <StarryNight />
    </div>
  );
}
