import { useEffect, useRef, useState } from 'react';

/**
 * Hook that adds scroll-in visibility detection using IntersectionObserver.
 * Returns a ref and a boolean `isVisible`.
 * 
 * Usage:
 *   const [ref, isVisible] = useScrollAnimate();
 *   <div ref={ref} className={`scroll-animate ${isVisible ? 'visible' : ''}`}>
 */
export const useScrollAnimate = (threshold = 0.15) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // Only animate once
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

/**
 * Component wrapper that automatically applies scroll-in animation.
 * 
 * Usage:
 *   <ScrollAnimate type="up" delay={2}>
 *     <MyCard />
 *   </ScrollAnimate>
 */
export const ScrollAnimate = ({ children, type = 'up', delay = 0, className = '' }) => {
  const [ref, isVisible] = useScrollAnimate();
  
  const typeClass = {
    'up': 'scroll-animate',
    'left': 'scroll-animate-left',
    'right': 'scroll-animate-right',
    'scale': 'scroll-animate-scale',
    'fade': 'scroll-animate-fade',
  }[type] || 'scroll-animate';

  const delayClass = delay > 0 ? `delay-${delay}` : '';

  return (
    <div
      ref={ref}
      className={`${typeClass} ${isVisible ? 'visible' : ''} ${delayClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollAnimate;
