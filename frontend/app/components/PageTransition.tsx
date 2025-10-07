import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigation, useNavigate } from 'react-router';
import { PageTransitionLoader, ProgressLoader, CarAnimationLoader } from './Loading';
import { SimpleImageLoader } from './ImagePreloader';

interface PageTransitionContextType {
  isTransitioning: boolean;
  progress: number;
  setIsTransitioning: (value: boolean) => void;
  transitionType: 'default' | 'progress' | 'car' | 'preloader';
  setTransitionType: (type: 'default' | 'progress' | 'car' | 'preloader') => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isTransitioning: false,
  progress: 0,
  setIsTransitioning: () => {},
  transitionType: 'preloader',
  setTransitionType: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transitionType, setTransitionType] = useState<'default' | 'progress' | 'car' | 'preloader'>('preloader');
  const location = useLocation();
  const navigation = useNavigation();

  useEffect(() => {
    // Start transition when navigation begins
    if (navigation.state === 'loading') {
      setIsTransitioning(true);
      setProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Keep at 90% until actual loading completes
          }
          return prev + Math.random() * 20;
        });
      }, 100);

      return () => clearInterval(progressInterval);
    } else {
      // Complete progress and hide loader after a short delay
      setProgress(100);
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setProgress(0);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [navigation.state]);

  // Page enter animation
  useEffect(() => {
    const pageContent = document.getElementById('page-content');
    if (pageContent && !isTransitioning) {
      pageContent.classList.add('page-enter');
      pageContent.classList.remove('page-exit');

      const timeout = setTimeout(() => {
        pageContent.classList.remove('page-enter');
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [location.pathname, isTransitioning]);

  const renderLoader = () => {
    if (!isTransitioning) return null;

    switch (transitionType) {
      case 'progress':
        return <ProgressLoader progress={progress} />;
      case 'car':
        return <CarAnimationLoader />;
      case 'preloader':
        return <SimpleImageLoader />;
      default:
        return <PageTransitionLoader />;
    }
  };

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        progress,
        setIsTransitioning,
        transitionType,
        setTransitionType,
      }}
    >
      {renderLoader()}
      <div
        id="page-content"
        className="min-h-screen transition-all duration-300 ease-in-out"
      >
        {children}
      </div>
    </PageTransitionContext.Provider>
  );
}

// Custom hook for programmatic navigation with transition
export function useNavigateWithTransition() {
  const navigate = useNavigate();
  const { setIsTransitioning, setTransitionType } = usePageTransition();

  const navigateWithTransition = (
    to: string,
    options?: {
      transitionType?: 'default' | 'progress' | 'car' | 'preloader';
      delay?: number;
      replace?: boolean;
    }
  ) => {
    // Set transition type if provided
    if (options?.transitionType) {
      setTransitionType(options.transitionType);
    }

    // Show transition immediately
    setIsTransitioning(true);

    // Navigate after a short delay for smooth UX
    setTimeout(() => {
      navigate(to, { replace: options?.replace });
    }, options?.delay || 100);
  };

  return navigateWithTransition;
}
