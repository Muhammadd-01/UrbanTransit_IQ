import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Also scroll the main content area
    const main = document.querySelector('.page-content');
    if (main) main.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
