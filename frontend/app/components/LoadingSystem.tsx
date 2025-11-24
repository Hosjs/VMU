import { useEffect, useState, createContext, useContext } from 'react';
import { useNavigation, useLocation, useNavigate } from 'react-router';

interface PageTransitionContextType {
    isTransitioning: boolean;
    progress: number;
    setIsTransitioning: (value: boolean) => void;
    transitionType: 'default' | 'progress' | 'car' | 'gradient' | 'preloader';
    setTransitionType: (type: 'default' | 'progress' | 'car' | 'gradient' | 'preloader') => void;
    animationType: 'fade' | 'slide' | 'scale' | 'blur' | 'default';
    setAnimationType: (type: 'fade' | 'slide' | 'scale' | 'blur' | 'default') => void;
}

interface UseImagePreloaderOptions {
    onProgress?: (loaded: number, total: number) => void;
    onComplete?: () => void;
}

// ============================================
// SHARED COMPONENTS - Tái sử dụng
// ============================================

/**
 * Logo Component
 */
const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = {
        sm: { container: 'w-10 h-10', image: 'w-6 h-6' },
        md: { container: 'w-16 h-16', image: 'w-10 h-10' },
        lg: { container: 'w-24 h-24', image: 'w-14 h-14' },
    };
    const { container, image } = sizes[size];

    return (
        <div className={`${container} bg-white rounded-full flex items-center justify-center shadow-xl`}>
            <img
                src="https://upload.wikimedia.org/wikipedia/vi/1/11/Bi%E1%BB%83u_tr%C6%B0ng_Tr%C6%B0%E1%BB%9Dng_%C4%91%E1%BA%A1i_h%E1%BB%8Dc_H%C3%A0ng_h%E1%BA%A3i_Vi%E1%BB%87t_Nam.svg"
                alt="VMU"
                className={`${image} object-contain`}
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
            />
        </div>
    );
};

/**
 * Spinning Ring - Vòng xoay xung quanh logo
 */
const SpinningRing = ({ size = 'md', color = 'blue' }: { size?: 'sm' | 'md' | 'lg', color?: 'blue' | 'white' }) => {
    const sizes = {
        sm: 'w-14 h-14 border-2',
        md: 'w-20 h-20 border-3',
        lg: 'w-32 h-32 border-4',
    };

    const colors = {
        blue: 'border-blue-200 border-t-blue-600',
        white: 'border-white/30 border-t-white',
    };

    return (
        <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`}></div>
    );
};

/**
 * Loading Dots - 3 chấm nhảy
 */
const LoadingDots = ({ color = 'blue' }: { color?: 'blue' | 'white' }) => {
    const colorClass = color === 'blue' ? 'bg-blue-600' : 'bg-white';

    return (
        <div className="flex justify-center space-x-2">
            <div className={`w-2 h-2 ${colorClass} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 ${colorClass} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 ${colorClass} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
        </div>
    );
};

/**
 * Company Branding - Tên và slogan
 */
const CompanyBranding = ({ theme = 'dark' }: { theme?: 'dark' | 'light' }) => {
    const textColor = theme === 'dark' ? 'text-gray-800' : 'text-white';
    const subColor = theme === 'dark' ? 'text-gray-600' : 'text-blue-100';

    return (
        <>
            <h2 className={`text-2xl font-bold ${textColor} mb-2`}>VMU</h2>
            <p className={`${subColor} text-sm mb-4`}></p>
        </>
    );
};

// ============================================
// 1. BASIC LOADERS - Inline loading
// ============================================

/**
 * LoadingSpinner - Spinner SVG cơ bản
 * Dùng: Buttons, Cards, Tables, inline loading
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <svg
            className={`animate-spin text-blue-600 ${sizeClasses[size]}`}
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

/**
 * SkeletonLoader - Placeholder animation
 * Dùng: Lists, grids khi đang load data
 */
export function SkeletonLoader({ rows = 6 }: { rows?: number }) {
    return (
        <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="h-48 bg-gray-200"></div>
                        <div className="p-6">
                            <div className="h-4 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================
// 2. FULL-SCREEN LOADERS
// ============================================

/**
 * FullScreenLoader - Loader trắng đơn giản
 * Dùng: Initial load, authentication
 */
export function FullScreenLoader({ text = "Đang tải..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="relative flex items-center justify-center w-32 h-32 mb-6">
                <SpinningRing size="lg" color="blue" />
                <div className="absolute">
                    <Logo size="lg" />
                </div>
            </div>
            <CompanyBranding theme="dark" />
            <p className="text-gray-600 font-medium mb-4">{text}</p>
            <LoadingDots color="blue" />
        </div>
    );
}

/**
 * GradientLoader - Loader gradient đẹp
 * Dùng: Page transitions, public routes
 */
export function GradientLoader({ text = "Đang chuyển trang..." }: { text?: string }) {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center z-[9999]">
            <div className="text-center px-6">
                <div className="relative w-32 h-32 mx-auto mb-6">
                    <SpinningRing size="lg" color="white" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Logo size="lg" />
                    </div>
                </div>
                <CompanyBranding theme="light" />
                <p className="text-white font-medium mb-6">{text}</p>
                <LoadingDots color="white" />
            </div>
        </div>
    );
}

/**
 * ModalLoader - Loader dạng modal/overlay
 * Dùng: Blocking actions, form submissions
 */
export function ModalLoader({ message = 'Đang xử lý...' }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
                <div className="relative w-20 h-20">
                    <SpinningRing size="md" color="blue" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Logo size="sm" />
                    </div>
                </div>
                <p className="text-gray-700 font-medium text-lg">{message}</p>
                <LoadingDots color="blue" />
            </div>
        </div>
    );
}

// ============================================
// 3. PROGRESS LOADERS
// ============================================

/**
 * ProgressLoader - Loader với thanh tiến trình
 * Dùng: File uploads, data processing
 */
export function ProgressLoader({ progress = 0, text = "Đang xử lý..." }: { progress?: number; text?: string }) {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="mb-8 animate-pulse">
                    <Logo size="lg" />
                </div>
                <CompanyBranding theme="dark" />
                <p className="text-gray-600 font-medium mb-4">{text}</p>
                <div className="w-80">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-center text-gray-600 font-medium text-lg">{Math.round(progress)}%</p>
                </div>
                <div className="mt-6">
                    <LoadingDots color="blue" />
                </div>
            </div>
        </div>
    );
}

/**
 * ImagePreloader - Loader cho preload images
 * Dùng: Homepage, product pages
 */
export function ImagePreloader({ progress, loadedCount, totalImages }: {
    progress: number;
    loadedCount: number;
    totalImages: number;
}) {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center z-[9999]">
            <div className="text-center px-6">
                <div className="mb-8 flex justify-center animate-pulse">
                    <Logo size="lg" />
                </div>
                <CompanyBranding theme="light" />
                <div className="max-w-md mx-auto">
                    <div className="bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-white to-blue-200 transition-all duration-300 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="h-full w-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-white text-sm">
                        <span>Đang tải ảnh...</span>
                        <span className="font-semibold">{progress}%</span>
                    </div>
                    <p className="text-blue-100 text-xs mt-2">
                        {loadedCount} / {totalImages} ảnh
                    </p>
                </div>
                <div className="mt-8">
                    <LoadingDots color="white" />
                </div>
            </div>
        </div>
    );
}

// ============================================
// 4. CONTENT LOADERS - Protected routes
// ============================================

/**
 * ContentLoader - Loader trong content area (KHÔNG che sidebar)
 * Dùng: Admin panel navigation
 */
export function ContentLoader() {
    const navigation = useNavigation();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (navigation.state === 'loading') {
            setIsLoading(true);
            setProgress(0);

            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 50);

            return () => clearInterval(interval);
        } else {
            setProgress(100);
            const timeout = setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [navigation.state, location.pathname]);

    if (!isLoading) return null;

    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 animate-fade-in" style={{ minHeight: '400px' }}>
            <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                    <SpinningRing size="md" color="blue" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Logo size="sm" />
                    </div>
                </div>
                <p className="text-gray-700 font-medium mb-2">Đang tải...</p>
                <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="mt-4">
                    <LoadingDots color="blue" />
                </div>
            </div>
        </div>
    );
}

/**
 * SimpleContentLoader - Version nhẹ của ContentLoader
 */
export function SimpleContentLoader() {
    const navigation = useNavigation();
    const isLoading = navigation.state === 'loading';

    if (!isLoading) return null;

    return (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-3 font-medium">Đang tải...</p>
            </div>
        </div>
    );
}

// ============================================
// 5. SPECIALIZED LOADERS
// ============================================

/**
 * CarAnimationLoader - Loader với animation xe chạy
 * Dùng: Pages liên quan đến automotive
 */
export function CarAnimationLoader() {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-50 flex items-center justify-center">
            <div className="text-center px-6">
                <div className="relative w-80 h-32 mx-auto mb-8">
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-transparent via-gray-400 to-transparent animate-pulse"></div>
                    </div>
                    <div className="absolute bottom-4 animate-[slideInRight_2s_ease-in-out_infinite]">
                        <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
                            <rect x="10" y="15" width="60" height="15" rx="3" fill="#3B82F6"/>
                            <rect x="20" y="8" width="35" height="12" rx="2" fill="#60A5FA"/>
                            <circle cx="25" cy="32" r="6" fill="#1E293B" stroke="#64748B" strokeWidth="2"/>
                            <circle cx="25" cy="32" r="3" fill="#94A3B8"/>
                            <circle cx="55" cy="32" r="6" fill="#1E293B" stroke="#64748B" strokeWidth="2"/>
                            <circle cx="55" cy="32" r="3" fill="#94A3B8"/>
                            <rect x="25" y="10" width="12" height="8" rx="1" fill="#E0F2FE"/>
                            <rect x="40" y="10" width="12" height="8" rx="1" fill="#E0F2FE"/>
                        </svg>
                    </div>
                </div>
                <Logo size="md" />
                <div className="mt-4">
                    <CompanyBranding theme="dark" />
                </div>
                <p className="text-gray-600 font-medium mb-4">Đang chuyển trang...</p>
                <LoadingDots color="blue" />
            </div>
        </div>
    );
}

// ============================================
// 6. HOOKS - Image Preloading
// ============================================

/**
 * useImagePreloader - Hook để preload images với progress
 */
export function useImagePreloader(imageUrls: string[], options?: UseImagePreloaderOptions) {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadedCount, setLoadedCount] = useState(0);

    useEffect(() => {
        if (!imageUrls || imageUrls.length === 0) {
            setImagesLoaded(true);
            return;
        }

        let mounted = true;
        let loaded = 0;
        const total = imageUrls.length;

        const loadImage = (url: string): Promise<void> => {
            return new Promise((resolve) => {
                const img = new Image();

                img.onload = () => {
                    if (mounted) {
                        loaded++;
                        const progress = Math.round((loaded / total) * 100);
                        setLoadedCount(loaded);
                        setLoadingProgress(progress);
                        options?.onProgress?.(loaded, total);
                    }
                    resolve();
                };

                img.onerror = () => {
                    if (mounted) {
                        loaded++;
                        const progress = Math.round((loaded / total) * 100);
                        setLoadedCount(loaded);
                        setLoadingProgress(progress);
                        options?.onProgress?.(loaded, total);
                    }
                    resolve();
                };

                img.src = url;
            });
        };

        const preloadImages = async () => {
            try {
                await Promise.all(imageUrls.map(url => loadImage(url)));
                if (mounted) {
                    setImagesLoaded(true);
                    options?.onComplete?.();
                }
            } catch (error) {
                console.error('Error preloading images:', error);
                if (mounted) {
                    setImagesLoaded(true);
                }
            }
        };

        preloadImages();

        return () => {
            mounted = false;
        };
    }, [imageUrls, options]);

    return {
        imagesLoaded,
        loadingProgress,
        loadedCount,
        totalImages: imageUrls.length
    };
}

/**
 * usePreloadImages - Hook đơn giản hơn (chỉ trả về loaded status)
 */
export function usePreloadImages(imageUrls: string[]) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!imageUrls || imageUrls.length === 0) {
            setLoaded(true);
            return;
        }

        let mounted = true;
        const promises = imageUrls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve;
                img.src = url;
            });
        });

        Promise.all(promises).then(() => {
            if (mounted) {
                setLoaded(true);
            }
        });

        return () => {
            mounted = false;
        };
    }, [imageUrls]);

    return loaded;
}

// ============================================
// 7. PAGE TRANSITION SYSTEM
// ============================================

const PageTransitionContext = createContext<PageTransitionContextType>({
    isTransitioning: false,
    progress: 0,
    setIsTransitioning: () => {},
    transitionType: 'gradient',
    setTransitionType: () => {},
    animationType: 'default',
    setAnimationType: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

/**
 * PageTransitionProvider - Provider cho page transitions
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [transitionType, setTransitionType] = useState<'default' | 'progress' | 'car' | 'gradient' | 'preloader'>('gradient');
    const [animationType, setAnimationType] = useState<'fade' | 'slide' | 'scale' | 'blur' | 'default'>('default');
    const location = useLocation();
    const navigation = useNavigation();
    const [previousPath, setPreviousPath] = useState(location.pathname);

    // CHỈ hiển thị loader cho public routes
    const isPublicRoute = location.pathname === '/' ||
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/products';

    useEffect(() => {
        if (!isPublicRoute) return;

        if (navigation.state === 'loading') {
            setIsTransitioning(true);
            setProgress(0);

            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + Math.random() * 20;
                });
            }, 100);

            return () => clearInterval(progressInterval);
        } else if (navigation.state === 'idle' && isTransitioning) {
            setProgress(100);
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setProgress(0);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [navigation.state, isTransitioning, isPublicRoute]);

    useEffect(() => {
        if (location.pathname !== previousPath) {
            setPreviousPath(location.pathname);
            if (isTransitioning) {
                const timeout = setTimeout(() => {
                    setIsTransitioning(false);
                    setProgress(0);
                }, 500);
                return () => clearTimeout(timeout);
            }
        }
    }, [location.pathname, previousPath, isTransitioning]);

    useEffect(() => {
        if (!isPublicRoute) return;

        const pageContent = document.getElementById('page-content');
        if (pageContent && !isTransitioning) {
            pageContent.classList.remove('page-exit', 'page-fade-exit', 'page-slide-exit', 'page-scale-exit');
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
                case 'blur':
                    pageContent.classList.add('page-blur-enter');
                    break;
            }

            const timeout = setTimeout(() => {
                pageContent.classList.remove(
                    'page-enter',
                    'page-fade-enter',
                    'page-slide-enter',
                    'page-scale-enter',
                    'page-blur-enter'
                );
            }, 500);

            return () => clearTimeout(timeout);
        }
    }, [location.pathname, isTransitioning, animationType, isPublicRoute]);

    const renderLoader = () => {
        if (!isTransitioning || !isPublicRoute) return null;

        switch (transitionType) {
            case 'progress':
                return <ProgressLoader progress={progress} text="Đang chuyển trang..." />;
            case 'car':
                return <CarAnimationLoader />;
            case 'gradient':
            default:
                return <GradientLoader text="Đang chuyển trang..." />;
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
            <div id="page-content" className="min-h-screen transition-all duration-300 ease-in-out">
                {children}
            </div>
        </PageTransitionContext.Provider>
    );
}

/**
 * useNavigateWithTransition - Hook để navigate với transition
 */
export function useNavigateWithTransition() {
    const navigate = useNavigate();
    const { setIsTransitioning, setTransitionType, setAnimationType } = usePageTransition();

    const navigateWithTransition = (
        to: string,
        options?: {
            transitionType?: 'default' | 'progress' | 'car' | 'gradient' | 'preloader';
            animationType?: 'fade' | 'slide' | 'scale' | 'blur' | 'default';
            delay?: number;
            replace?: boolean;
        }
    ) => {
        if (options?.transitionType) {
            setTransitionType(options.transitionType);
        }
        if (options?.animationType) {
            setAnimationType(options.animationType);
        }

        setIsTransitioning(true);

        setTimeout(() => {
            navigate(to, { replace: options?.replace });
            setTimeout(() => {
                setIsTransitioning(false);
            }, 2000);
        }, options?.delay || 100);
    };

    return navigateWithTransition;
}

/**
 * useRouteAnimation - Hook để set animation cho route cụ thể
 */
export function useRouteAnimation(routePath: string, animation: 'fade' | 'slide' | 'scale' | 'blur' | 'default') {
    const { setAnimationType } = usePageTransition();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === routePath) {
            setAnimationType(animation);
        }
    }, [location.pathname, routePath, animation, setAnimationType]);
}

// ============================================
// EXPORTS SUMMARY
// ============================================

/**
 * USAGE GUIDE:
 *
 * 1. Basic Spinners:
 *    <LoadingSpinner size="sm|md|lg" />
 *
 * 2. Full Screen Loaders:
 *    <FullScreenLoader text="..." />
 *    <GradientLoader text="..." />
 *    <ModalLoader message="..." />
 *
 * 3. Progress Loaders:
 *    <ProgressLoader progress={75} />
 *    <ImagePreloader progress={80} loadedCount={8} totalImages={10} />
 *
 * 4. Content Loaders (Auto-detect navigation):
 *    <ContentLoader />
 *    <SimpleContentLoader />
 *
 * 5. Specialized:
 *    <CarAnimationLoader />
 *    <SkeletonLoader rows={6} />
 *
 * 6. Hooks:
 *    const { imagesLoaded, loadingProgress } = useImagePreloader(urls);
 *    const loaded = usePreloadImages(urls);
 *
 * 7. Page Transitions:
 *    <PageTransitionProvider>...</PageTransitionProvider>
 *    const navigate = useNavigateWithTransition();
 *    navigate('/path', { transitionType: 'car', animationType: 'fade' });
 */