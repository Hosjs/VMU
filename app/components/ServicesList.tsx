import React, { useState } from 'react';
import {
  EngineIcon,
  MaintenanceIcon,
  ToolsIcon,
  InsuranceIcon,
  RegistrationIcon,
  CarWashIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon
} from './Icons';
import { MAIN_SERVICES } from '~/data/services';
import type { ServiceData } from '~/data/services';

interface ServicesListProps {
  onServiceSelect: (serviceTitle: string) => void;
  onConsultationClick: () => void;
}

export function ServicesList({ onServiceSelect, onConsultationClick }: ServicesListProps) {
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  // Debug function để kiểm tra button clicks
  const handleServiceClick = (serviceTitle: string) => {
    console.log('Service clicked:', serviceTitle);
    onServiceSelect(serviceTitle);
  };

  const handleConsultationClick = () => {
    console.log('Consultation clicked');
    onConsultationClick();
  };

  // Sử dụng data từ file services.ts và thêm icon
  const services: ServiceData[] = MAIN_SERVICES.map(service => ({
    ...service,
    icon: service.id === 1 ? <RegistrationIcon size={48} color="#10B981" className="w-12 h-12" /> :
          service.id === 2 ? <InsuranceIcon size={48} color="#3B82F6" className="w-12 h-12" /> :
          service.id === 3 ? <CarWashIcon size={48} color="#8B5CF6" className="w-12 h-12" /> :
          service.id === 4 ? <ToolsIcon size={48} color="#F59E0B" className="w-12 h-12" /> :
          service.id === 5 ? <MaintenanceIcon size={48} color="#10B981" className="w-12 h-12" /> :
          service.id === 6 ? <EngineIcon size={48} color="#EF4444" className="w-12 h-12" /> : null
  }));

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-full mb-6">
          <StarIcon size={20} color="#3B82F6" className="w-5 h-5" />
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Dịch vụ chuyên nghiệp</span>
          <StarIcon size={20} color="#3B82F6" className="w-5 h-5" />
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
          Dịch Vụ Của Chúng Tôi
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Trường Thắng Auto cung cấp đầy đủ các dịch vụ chuyên nghiệp cho xe ô tô với đội ngũ kỹ thuật viên giàu kinh nghiệm và trang thiết bị hiện đại
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {services.map((service) => (
          <div
            key={service.id}
            className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 ${
              hoveredService === service.id ? 'scale-[1.02] -translate-y-2' : ''
            }`}
            onMouseEnter={() => setHoveredService(service.id)}
            onMouseLeave={() => setHoveredService(null)}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

            {/* Special Service Badge */}
            {service.isSpecialService && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <StarIcon size={12} color="#ffffff" className="w-3 h-3" />
                  <span>Đặc biệt</span>
                </div>
              </div>
            )}

            <div className="relative p-6 lg:p-8">
              {/* Service Header */}
              <div className="flex items-start space-x-4 mb-6">
                {/* Icon Container */}
                <div
                  className="flex-shrink-0 p-3 rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: service.accentColor + '15' }}
                >
                  {service.icon}
                </div>

                {/* Service Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: service.accentColor }}
                    >
                      {service.id}
                    </div>
                    <span
                      className="text-sm font-semibold uppercase tracking-wider"
                      style={{ color: service.accentColor }}
                    >
                      {service.subtitle}
                    </span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="mb-6">
                <div className="grid grid-cols-1 gap-2">
                  {service.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckIcon
                        size={16}
                        color={service.accentColor}
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                  {service.features.length > 4 && (
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full mx-1"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-500 italic">
                        và {service.features.length - 4} tính năng khác
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Giá dịch vụ</p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: service.accentColor }}
                  >
                    {service.price}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleServiceClick(service.title);
                    }}
                    className="group/btn px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer"
                    style={{ backgroundColor: service.accentColor }}
                    type="button"
                  >
                    <span className="text-sm">Chi tiết</span>
                    <ArrowRightIcon
                      size={16}
                      color="#ffffff"
                      className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>

                  {service.isSpecialService && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleConsultationClick();
                      }}
                      className="px-4 py-2 border-2 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-50 text-sm cursor-pointer"
                      style={{
                        borderColor: service.accentColor,
                        color: service.accentColor
                      }}
                      type="button"
                    >
                      Liên hệ
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Hover Effect Border */}
            <div
              className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-opacity-20 transition-all duration-300 pointer-events-none"
              style={{ borderColor: service.accentColor }}
            ></div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Section */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-12">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
            Cần tư vấn thêm về dịch vụ?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn miễn phí để giúp bạn chọn dịch vụ phù hợp nhất cho xe của mình
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleConsultationClick();
              }}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 cursor-pointer"
              type="button"
            >
              <span>📞 Tư vấn miễn phí</span>
            </button>
            <a
              href="tel:0123456789"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-xl transition-all duration-300 flex items-center space-x-3"
            >
              <span>🚗 Hotline: 0123.456.789</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
