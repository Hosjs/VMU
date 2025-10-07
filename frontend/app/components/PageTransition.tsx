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
  animationType: 'fade' | 'slide' | 'scale' | 'rotate' | 'blur' | 'default';
  setAnimationType: (type: 'fade' | 'slide' | 'scale' | 'rotate' | 'blur' | 'default') => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isTransitioning: false,
  progress: 0,
  setIsTransitioning: () => {},
  transitionType: 'preloader',
  setTransitionType: () => {},
  animationType: 'default',
  setAnimationType: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transitionType, setTransitionType] = useState<'default' | 'progress' | 'car' | 'preloader'>('preloader');
  const [animationType, setAnimationType] = useState<'fade' | 'slide' | 'scale' | 'rotate' | 'blur' | 'default'>('default');
  const location = useLocation();
  const navigation = useNavigation();
  const [previousPath, setPreviousPath] = useState(location.pathname);

  // Handle navigation state changes
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
    } else if (navigation.state === 'idle' && isTransitioning) {
      // Complete progress and hide loader after a short delay
      setProgress(100);
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setProgress(0);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [navigation.state, isTransitioning]);

  // Handle location changes - force hide loader if stuck
  useEffect(() => {
    if (location.pathname !== previousPath) {
      setPreviousPath(location.pathname);

      // If we're transitioning and location changed, ensure we hide loader
      if (isTransitioning) {
        const timeout = setTimeout(() => {
          setIsTransitioning(false);
          setProgress(0);
        }, 500); // Give it a bit more time for smooth transition

        return () => clearTimeout(timeout);
      }
    }
  }, [location.pathname, previousPath, isTransitioning]);

  // Page enter animation with CSS classes
  useEffect(() => {
    const pageContent = document.getElementById('page-content');
    if (pageContent && !isTransitioning) {
      // Remove any existing animation classes
      pageContent.classList.remove('page-exit', 'page-fade-exit', 'page-slide-exit', 'page-scale-exit');

      // Add enter animation based on type
      pageContent.classList.add('page-enter');

      switch (animationType) {
        case 'fade':
          pageContent.classList.add('page-fade-enter');
          break;
        case 'slide':
          pageContent.classList.add('page-slide-enter');
          break;
        case 'scale':
          pageContent.classList.add('page-scale-enter');
          break;
        case 'rotate':
          pageContent.classList.add('page-rotate-enter');
          break;
        case 'blur':
          pageContent.classList.add('page-blur-enter');
          break;
        default:
          // Default animation is already applied via page-enter class
          break;
      }

      const timeout = setTimeout(() => {
        pageContent.classList.remove(
          'page-enter',
          'page-fade-enter',
          'page-slide-enter',
          'page-scale-enter',
          'page-rotate-enter',
          'page-blur-enter'
        );
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [location.pathname, isTransitioning, animationType]);

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
        animationType,
        setAnimationType,
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
  const { setIsTransitioning, setTransitionType, setAnimationType } = usePageTransition();

  const navigateWithTransition = (
    to: string,
    options?: {
      transitionType?: 'default' | 'progress' | 'car' | 'preloader';
      animationType?: 'fade' | 'slide' | 'scale' | 'rotate' | 'blur' | 'default';
      delay?: number;
      replace?: boolean;
    }
  ) => {
    // Set transition type if provided
    if (options?.transitionType) {
      setTransitionType(options.transitionType);
    }

    // Set animation type if provided
    if (options?.animationType) {
      setAnimationType(options.animationType);
    }

    // Show transition immediately
    setIsTransitioning(true);

    // Navigate after a short delay for smooth UX
    setTimeout(() => {
      navigate(to, { replace: options?.replace });

      // Safety timeout: force hide loader after 2 seconds if something goes wrong
      setTimeout(() => {
        setIsTransitioning(false);
      }, 2000);
    }, options?.delay || 100);
  };

  return navigateWithTransition;
}

// Hook to dynamically set animation type based on route
export function useRouteAnimation(routePath: string, animation: 'fade' | 'slide' | 'scale' | 'rotate' | 'blur' | 'default') {
  const { setAnimationType } = usePageTransition();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === routePath) {
      setAnimationType(animation);
    }
  }, [location.pathname, routePath, animation, setAnimationType]);
}
