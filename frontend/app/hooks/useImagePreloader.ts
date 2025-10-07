import { useState, useEffect } from 'react';

interface UseImagePreloaderOptions {
    onProgress?: (loaded: number, total: number) => void;
    onComplete?: () => void;
}

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
            return new Promise((resolve, reject) => {
                const img = new Image();

                img.onload = () => {
                    if (mounted) {
                        loaded++;
                        const progress = Math.round((loaded / total) * 100);
                        setLoadedCount(loaded);
                        setLoadingProgress(progress);

                        if (options?.onProgress) {
                            options.onProgress(loaded, total);
                        }
                    }
                    resolve();
                };

                img.onerror = () => {
                    // Still count as loaded even if failed to prevent blocking
                    if (mounted) {
                        loaded++;
                        const progress = Math.round((loaded / total) * 100);
                        setLoadedCount(loaded);
                        setLoadingProgress(progress);

                        if (options?.onProgress) {
                            options.onProgress(loaded, total);
                        }
                    }
                    resolve(); // Resolve instead of reject to continue loading
                };

                img.src = url;
            });
        };

        const preloadImages = async () => {
            try {
                await Promise.all(imageUrls.map(url => loadImage(url)));

                if (mounted) {
                    setImagesLoaded(true);
                    if (options?.onComplete) {
                        options.onComplete();
                    }
                }
            } catch (error) {
                console.error('Error preloading images:', error);
                if (mounted) {
                    setImagesLoaded(true); // Set as loaded anyway
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

// Hook đơn giản hơn cho việc preload một list ảnh
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
                img.onerror = resolve; // Resolve on error too
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

