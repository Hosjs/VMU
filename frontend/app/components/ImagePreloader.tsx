import React from 'react';

interface ImagePreloaderProps {
    progress: number;
    loadedCount: number;
    totalImages: number;
}

export function ImagePreloader({ progress, loadedCount, totalImages }: ImagePreloaderProps) {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center z-[9999]">
            <div className="text-center px-6">
                {/* Logo */}
                <div className="mb-8 animate-pulse">
                    <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <img
                            src="/images/logo.png"
                            alt="AutoCare Pro"
                            className="w-16 h-16 object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    </div>
                </div>

                {/* Company Name */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    AutoCare Pro
                </h1>
                <p className="text-blue-100 text-sm md:text-base mb-8">
                    Dịch vụ khác biệt, trải nghiệm đỉnh cao
                </p>

                {/* Progress Bar */}
                <div className="max-w-md mx-auto">
                    <div className="bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-white to-blue-200 transition-all duration-300 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="h-full w-full animate-pulse"></div>
                        </div>
                    </div>

                    {/* Progress Text */}
                    <div className="flex justify-between text-white text-sm">
                        <span>Đang tải ảnh...</span>
                        <span className="font-semibold">{progress}%</span>
                    </div>
                    <p className="text-blue-100 text-xs mt-2">
                        {loadedCount} / {totalImages} ảnh
                    </p>
                </div>

                {/* Loading Dots Animation */}
                <div className="flex justify-center space-x-2 mt-8">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}

// Simple Image Loader với Logo ở giữa
export function SimpleImageLoader() {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center z-[9999]">
            <div className="text-center px-6">
                {/* Logo với vòng xoay xung quanh */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                    {/* Vòng xoay */}
                    <div className="absolute inset-0 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>

                    {/* Logo ở giữa */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                            <img
                                src="/images/logo.png"
                                alt="AutoCare Pro"
                                className="w-14 h-14 object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Company Name */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    AutoCare Pro
                </h1>
                <p className="text-blue-100 text-sm md:text-base mb-4">
                    Dịch vụ khác biệt, trải nghiệm đỉnh cao
                </p>

                {/* Loading Text */}
                <p className="text-white font-medium">Đang tải...</p>

                {/* Loading Dots Animation */}
                <div className="flex justify-center space-x-2 mt-6">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}
