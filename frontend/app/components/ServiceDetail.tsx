import React, { useState } from 'react';
import {
  EngineIcon,
  MaintenanceIcon,
  TireIcon,
  BrakeIcon,
  CarWashIcon,
  LocationIcon,
  PhoneIcon
} from './Icons';
import { ModalPortal } from './ModalPortal';

interface ServiceDetailProps {
  service: {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    price: string;
    details: {
      supportedBrands: string[];
      carTypes: string[];
      features: string[];
      warranty: string;
      duration: string;
      gallery: string[];
    };
  };
  onClose: () => void;
  onBookService?: (serviceName: string) => void;
}

export function ServiceDetail({ service, onClose, onBookService }: ServiceDetailProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCarType, setSelectedCarType] = useState<string>('');

  const handleBookNow = () => {
    if (onBookService) {
      onBookService(service.title);
    }
  };

  const handleCall = () => {
    window.open('tel:0123456789', '_self');
  };

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: '999999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '64rem',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transform: 'scale(1)',
          opacity: '1'
        }}
        className="animate-in"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex justify-center">{service.icon}</div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{service.title}</h2>
                <p className="text-blue-600 text-xl font-semibold">{service.price}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors btn-hover"
            >
              ×
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">{service.description}</p>

          {/* Service Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Supported Car Brands */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 7h.01M7 3h.01"></path>
                </svg>
                Hãng Xe Hỗ Trợ
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {service.details.supportedBrands.map((brand, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedBrand === brand 
                        ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                        : 'bg-white text-gray-700 hover:bg-blue-100 shadow-sm hover:shadow-md'
                    }`}
                    onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                  >
                    <div className="text-center font-semibold text-sm">{brand}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Car Types */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                </svg>
                Loại Xe
              </h3>
              <div className="space-y-2">
                {service.details.carTypes.map((type, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedCarType === type 
                        ? 'bg-green-600 text-white shadow-md transform scale-105' 
                        : 'bg-white text-gray-700 hover:bg-green-100 shadow-sm hover:shadow-md'
                    }`}
                    onClick={() => setSelectedCarType(selectedCarType === type ? '' : type)}
                  >
                    <div className="font-semibold text-sm">{type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features & Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Features */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Tính Năng
              </h3>
              <ul className="space-y-3">
                {service.details.features.map((feature, index) => (
                  <li key={index} className="text-gray-700 flex items-start text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Warranty */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Bảo Hành
              </h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">{service.details.warranty}</p>
                <p className="text-sm text-gray-600">Cam kết chất lượng</p>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Thời Gian
              </h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600 mb-2">{service.details.duration}</p>
                <p className="text-sm text-gray-600">Hoàn thành dịch vụ</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-6">
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-gray-800 mb-2">Sẵn sàng trải nghiệm dịch vụ?</h4>
              <p className="text-gray-600">Đặt lịch ngay để nhận ưu đãi tốt nhất!</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleBookNow}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2 btn-hover"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l1-1m5 1l-1-1M9 7v10a2 2 0 002 2h4a2 2 0 002-2V7m-6 0h6" />
                </svg>
                <span>Đặt Lịch Ngay</span>
              </button>
              <button
                onClick={handleCall}
                className="flex-1 border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors font-semibold flex items-center justify-center space-x-2 btn-hover"
              >
                <PhoneIcon size={20} color="currentColor" />
                <span>Gọi Tư Vấn</span>
              </button>
            </div>
          </div>

          {/* Close Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="px-8 py-2 text-gray-600 hover:text-gray-800 transition-colors btn-hover"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ModalPortal isOpen={true}>
      {modalContent}
    </ModalPortal>
  );
}
