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

  // Sử dụng data từ file services.ts và thêm icon
  const services: ServiceData[] = MAIN_SERVICES.map(service => ({
    ...service,
    icon: service.id === 1 ? <RegistrationIcon size={120} color="#10B981" /> :
          service.id === 2 ? <InsuranceIcon size={120} color="#3B82F6" /> :
          service.id === 3 ? <CarWashIcon size={120} color="#8B5CF6" /> :
          service.id === 4 ? <ToolsIcon size={120} color="#F59E0B" /> :
          service.id === 5 ? <MaintenanceIcon size={120} color="#10B981" /> :
          service.id === 6 ? <EngineIcon size={120} color="#EF4444" /> : null
  }));

  // Auto slide every 5 seconds - pause when hovered
  useEffect(() => {
    if (!isAutoPlay || isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % services.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, services.length]);

  // Wheel scroll handler
  const handleWheel = (e: React.WheelEvent) => {
    // Prevent page scrolling when interacting with the carousel
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY;

    if (delta > 0) {
      // Scroll down - next slide
      setCurrentSlide((prev) => (prev + 1) % services.length);
    } else {
      // Scroll up - previous slide
      setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
    }

    // Pause auto-play temporarily when user scrolls
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
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    >
      {/* Main Carousel Container */}
      <div className={`relative bg-gradient-to-br ${currentService.bgColor} rounded-3xl overflow-hidden shadow-2xl transition-all duration-1000 ease-in-out ${isHovered ? 'scale-[1.02]' : ''}`}>
        {/* Scroll hint overlay */}
        {isHovered && (
          <div className="absolute top-4 right-4 bg-black/20 text-white px-3 py-2 rounded-full text-sm animate-fade-in z-10">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Cuộn để xem dịch vụ</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-32 -translate-x-32"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-16 min-h-[500px]">
          {/* Left Side - Content */}
          <div className="flex flex-col justify-center space-y-6 z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: currentService.accentColor }}
                >
                  {currentService.id}
                </div>
                <span
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: currentService.accentColor }}
                >
                  {currentService.subtitle}
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                {currentService.title}
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                {currentService.description}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {currentService.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentService.accentColor }}
                  ></div>
                  <span className="text-sm text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Price & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Giá dịch vụ</p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: currentService.accentColor }}
                >
                  {currentService.price}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => onServiceSelect(currentService.title)}
                  className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  style={{ backgroundColor: currentService.accentColor }}
                >
                  <InfoDetailIcon size={20} color="#ffffff" />
                  <span>Chi Tiết Dịch Vụ</span>
                </button>

                {currentService.isSpecialService ? (
                  <button
                    onClick={onConsultationClick}
                    className="px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10"
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
                    className="px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10"
                    style={{
                      borderColor: currentService.accentColor,
                      color: currentService.accentColor
                    }}
                  >
                    📅 Đặt Lịch
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Icon & Visual */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative">
              {/* Icon Container */}
              <div className="relative transform transition-all duration-1000 hover:scale-110">
                <div className="w-80 h-80 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/30">
                  <div className={`transform transition-transform duration-500 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
                    {currentService.icon}
                  </div>
                </div>

                {/* Floating Elements - Enhanced animation when hovered */}
                <div
                  className={`absolute -top-4 -right-4 w-8 h-8 rounded-full transition-all duration-300 ${isHovered ? 'animate-bounce scale-125' : 'animate-pulse'}`}
                  style={{ backgroundColor: `${currentService.accentColor}40` }}
                ></div>
                <div
                  className={`absolute -bottom-6 -left-6 w-6 h-6 rounded-full transition-all duration-300 ${isHovered ? 'animate-ping scale-125' : 'animate-pulse'}`}
                  style={{ backgroundColor: `${currentService.accentColor}60` }}
                ></div>
                <div
                  className={`absolute top-1/2 -left-8 w-4 h-4 rounded-full transition-all duration-300 ${isHovered ? 'animate-bounce scale-150' : 'animate-ping'}`}
                  style={{ backgroundColor: `${currentService.accentColor}30` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${((currentSlide + 1) / services.length) * 100}%`,
              backgroundColor: currentService.accentColor
            }}
          ></div>
        </div>

        {/* Hover Navigation Hints */}
        {isHovered && (
          <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="bg-black/20 text-white px-3 py-2 rounded-full text-sm animate-fade-in">
              ← Trước
            </div>
            <div className="bg-black/20 text-white px-3 py-2 rounded-full text-sm animate-fade-in">
              Sau →
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        {/* Dots Navigation */}
        <div className="flex space-x-3">
          {services.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-150 ${
                index === currentSlide 
                  ? 'scale-125 shadow-lg' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              style={{
                backgroundColor: index === currentSlide ? currentService.accentColor : undefined
              }}
            />
          ))}
        </div>

        {/* Arrow Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={prevSlide}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Auto-play indicator - Enhanced */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isHovered 
                ? 'bg-orange-400 animate-pulse' 
                : isAutoPlay 
                  ? 'bg-green-400 animate-pulse' 
                  : 'bg-gray-300'
            }`}></div>
            <span className="hidden sm:inline">
              {isHovered ? 'Tạm dừng' : isAutoPlay ? 'Tự động' : 'Thủ công'}
            </span>
          </div>
        </div>
      </div>

      {/* Service Counter */}
      <div className="text-center mt-6">
        <p className="text-gray-500 text-sm">
          <span className="font-semibold" style={{ color: currentService.accentColor }}>
            {currentSlide + 1}
          </span>
          {' '}/ {services.length} dịch vụ chuyên nghiệp
        </p>
      </div>
    </div>
  );
}
