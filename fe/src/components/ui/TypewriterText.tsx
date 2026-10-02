import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: boolean;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  delay = 0,
  className = '',
  cursor = true,
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsDone(true);
      if (onComplete) onComplete();
      return;
    }

    setDisplayedText('');
    setIsDone(false);

    let currentIndex = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setIsDone(true);
          if (onComplete) onComplete();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && (
        <span
          className={`inline-block w-[2px] h-[0.9em] align-baseline ml-0.5 bg-noir-blood ${
            isDone ? 'animate-pulse opacity-70' : 'opacity-100'
          }`}
        />
      )}
    </span>
  );
};
