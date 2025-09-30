import React, { useState, useEffect } from 'react';
import {
  EngineIcon,
  MaintenanceIcon,
  ToolsIcon,
  InsuranceIcon,
  RegistrationIcon,
  CarWashIcon,
  InfoDetailIcon
} from './Icons';
import { MAIN_SERVICES } from '~/data/services';
import type { ServiceData } from '~/data/services';

interface ServicesCarouselProps {
  onServiceSelect: (serviceTitle: string) => void;
  onConsultationClick: () => void;
}

export function ServicesCarousel({ onServiceSelect, onConsultationClick }: ServicesCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Sử dụng data từ file services.ts và thêm icon - Mobile responsive icon sizes
  const services: ServiceData[] = MAIN_SERVICES.map(service => ({
    ...service,
    icon: service.id === 1 ? <RegistrationIcon size={80} color="#10B981" className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32" /> :
          service.id === 2 ? <InsuranceIcon size={80} color="#3B82F6" className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32" /> :
          service.id === 3 ? <CarWashIcon size={80} color="#8B5CF6" className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32" /> :
          service.id === 4 ? <ToolsIcon size={80} color="#F59E0B" className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32" /> :
          service.id === 5 ? <MaintenanceIcon size={80} color="#10B981" className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32" /> :
          service.id === 6 ? <EngineIcon size={80} color="#EF4444" className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32" /> : null
  }));

  // Auto slide every 5 seconds - pause when hovered
  useEffect(() => {
    if (!isAutoPlay || isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % services.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, services.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe left - next slide
      setCurrentSlide((prev) => (prev + 1) % services.length);
      setIsAutoPlay(false);
      setTimeout(() => setIsAutoPlay(true), 8000);
    } else if (distance < -minSwipeDistance) {
      // Swipe right - previous slide
      setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
      setIsAutoPlay(false);
      setTimeout(() => setIsAutoPlay(true), 8000);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Wheel scroll handler for desktop
  const handleWheel = (e: React.WheelEvent) => {
    // Only handle wheel events on desktop (when touch is not available)
    if ('ontouchstart' in window) return;

    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY;

    if (delta > 0) {
      setCurrentSlide((prev) => (prev + 1) % services.length);
    } else {
      setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
    }

    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
    // Resume autoplay after 10 seconds
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % services.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Disable page scroll when hovering over carousel
    document.body.style.overflow = 'hidden';
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Re-enable page scroll when leaving carousel
    document.body.style.overflow = 'unset';
  };

  const currentService = services[currentSlide];

  return (
    <div
      className="relative w-full mobile-carousel-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Carousel Container - Mobile responsive */}
      <div className={`relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl transition-all duration-1000 ease-in-out ${isHovered ? 'scale-[1.01] sm:scale-[1.02]' : ''}`}>
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 transition-opacity duration-1000"
          style={{ backgroundImage: `url('${currentService.backgroundImage}')` }}
        ></div>

        {/* Overlay để đảm bảo text dễ đọc */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/50"></div>

        {/* Scroll hint overlay - Desktop only */}
        {isHovered && !('ontouchstart' in window) && (
          <div className="absolute top-4 right-4 bg-black/20 text-white px-3 py-2 rounded-full text-sm animate-fade-in z-10 hidden sm:block">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Cuộn để xem dịch vụ</span>
            </div>
          </div>
        )}

        {/* Mobile swipe hint */}
        {'ontouchstart' in window && (
          <div className="absolute top-4 right-4 bg-black/20 text-white px-3 py-2 rounded-full text-xs sm:text-sm animate-fade-in z-10 sm:hidden">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
              </svg>
              <span>Vuốt để xem</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

        {/* Decorative Elements - Responsive */}
        <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-24 sm:-translate-y-32 md:-translate-y-48 translate-x-24 sm:translate-x-32 md:translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-16 sm:translate-y-24 md:translate-y-32 -translate-x-16 sm:-translate-x-24 md:-translate-x-32"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 p-4 sm:p-6 md:p-8 lg:p-16 min-h-[400px] sm:min-h-[450px] md:min-h-[500px]">
          {/* Left Side - Content - Mobile responsive */}
          <div className="flex flex-col justify-center space-y-4 sm:space-y-6 z-10">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center space-x-2 sm:space-x-3">
                <div
                  className="w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                  style={{ backgroundColor: currentService.accentColor }}
                >
                  {currentService.id}
                </div>
                <span
                  className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
                  style={{ color: currentService.accentColor }}
                >
                  {currentService.subtitle}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                {currentService.title}
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-lg mobile-text-scale">
                {currentService.description}
              </p>
            </div>

            {/* Features - Mobile responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {currentService.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div
                    className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: currentService.accentColor }}
                  ></div>
                  <span className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            {/* Price & Actions - Mobile responsive */}
            <div className="flex flex-col space-y-4 pt-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Giá dịch vụ</p>
                <p
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: currentService.accentColor }}
                >
                  {currentService.price}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => onServiceSelect(currentService.title)}
                  className="px-4 sm:px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 touch-friendly mobile-button"
                  style={{ backgroundColor: currentService.accentColor }}
                >
                  <InfoDetailIcon size={16} color="#ffffff" className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Chi Tiết Dịch Vụ</span>
                </button>

                {currentService.isSpecialService ? (
                  <button
                    onClick={onConsultationClick}
                    className="px-4 sm:px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 touch-friendly mobile-button text-sm sm:text-base"
                    style={{
                      borderColor: currentService.accentColor,
                      color: currentService.accentColor
                    }}
                  >
                    📞 Liên Hệ Báo Giá
                  </button>
                ) : (
                  <button
                    onClick={() => onServiceSelect(currentService.title)}
                    className="px-4 sm:px-6 py-3 bg-white/20 backdrop-blur-sm text-gray-700 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 touch-friendly mobile-button text-sm sm:text-base"
                  >
                    💰 Xem Báo Giá
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Icon & Visual - Mobile responsive */}
          <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6 z-10 order-first lg:order-last">
            <div className="relative">
              {/* Icon container - Mobile responsive */}
              <div className="relative z-10 transform hover:scale-110 transition-transform duration-300">
                {currentService.icon}
              </div>

              {/* Glowing background - Responsive */}
              <div
                className="absolute inset-0 rounded-full blur-xl sm:blur-2xl opacity-20 scale-150"
                style={{ backgroundColor: currentService.accentColor }}
              ></div>
            </div>

            {/* Service highlights - Mobile responsive */}
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="flex flex-wrap justify-center gap-2">
                <span
                  className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium text-white"
                  style={{ backgroundColor: currentService.accentColor + '20', color: currentService.accentColor }}
                >
                  ✅ Chất lượng cao
                </span>
                <span
                  className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium text-white"
                  style={{ backgroundColor: currentService.accentColor + '20', color: currentService.accentColor }}
                >
                  ⚡ Nhanh chóng
                </span>
                <span
                  className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium text-white"
                  style={{ backgroundColor: currentService.accentColor + '20', color: currentService.accentColor }}
                >
                  🛡️ Bảo hành
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots - Mobile responsive */}
      <div className="flex justify-center items-center space-x-2 sm:space-x-3 mt-6 sm:mt-8">
        {services.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full touch-friendly ${
              index === currentSlide
                ? 'w-8 sm:w-12 h-2 sm:h-3 bg-blue-600'
                : 'w-2 sm:w-3 h-2 sm:h-3 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows - Desktop only */}
      <div className="hidden lg:block">
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-20 hover:scale-110"
          aria-label="Previous service"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-20 hover:scale-110"
          aria-label="Next service"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Service Counter - Mobile responsive */}
      <div className="text-center mt-4 sm:mt-6">
        <span className="text-xs sm:text-sm text-gray-500">
          Dịch vụ {currentSlide + 1} / {services.length}
        </span>
      </div>
    </div>
  );
}
