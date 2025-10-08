import React, { useState, useEffect } from 'react';
import { PhoneIcon, LocationIcon } from './Icons';
import { ModalPortal } from './ModalPortal';
import { MAIN_SERVICES } from '~/data/services';
import { ModalLoader } from './LoadingSystem';

interface BookingFormData {
  name: string;
  phone: string;
  carBrand: string;
  service: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: string;
}

export function BookingModal({ isOpen, onClose, selectedService = '' }: BookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    phone: '',
    carBrand: '',
    service: selectedService,
    description: '',
    preferredDate: '',
    preferredTime: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Update service when selectedService prop changes
  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({ ...prev, service: selectedService }));
    }
  }, [selectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call with realistic progress
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      // Auto close after showing success
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setCurrentStep(1);
        setFormData({
          name: '',
          phone: '',
          carBrand: '',
          service: selectedService,
          description: '',
          preferredDate: '',
          preferredTime: ''
        });
      }, 3000);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCallNow = () => {
    window.open('tel:0123456789', '_self');
  };

  if (!isOpen) return null;

  const carBrands = [
    'Toyota', 'Honda', 'Mazda', 'Ford', 'Hyundai', 'KIA',
    'Mitsubishi', 'Nissan', 'Chevrolet', 'Suzuki', 'BMW',
    'Mercedes', 'Audi', 'Lexus', 'Infiniti', 'Volvo', 'Khác'
  ];

  const timeSlots = [
    '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
  ];

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
          maxWidth: showSuccess ? '32rem' : '40rem',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transform: 'scale(1)',
          opacity: '1'
        }}
        className="animate-in"
      >
        {showSuccess ? (
          // Success State
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Đặt Lịch Thành Công!</h3>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Chúng tôi sẽ liên hệ với bạn trong vòng 15 phút.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Thông tin đặt lịch:</h4>
                <div className="text-left text-sm text-gray-600 space-y-1">
                  <p><strong>Họ tên:</strong> {formData.name}</p>
                  <p><strong>Số điện thoại:</strong> {formData.phone}</p>
                  <p><strong>Dịch vụ:</strong> {formData.service}</p>
                  <p><strong>Hãng xe:</strong> {formData.carBrand}</p>
                  {formData.preferredDate && <p><strong>Ngày mong muốn:</strong> {formData.preferredDate}</p>}
                  {formData.preferredTime && <p><strong>Giờ mong muốn:</strong> {formData.preferredTime}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCallNow}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <PhoneIcon size={20} color="white" />
                  <span>Gọi Ngay: 0123 456 789</span>
                </button>
                <p className="text-xs text-gray-500">Đang tự động đóng trong 3 giây...</p>
              </div>
            </div>
          </div>
        ) : isSubmitting ? (
          // Loading State
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/images/logo.png"
                    alt="AutoCare Pro"
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Đang xử lý đặt lịch...</h3>
              <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        ) : (
          // Form State
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">📅 Đặt Lịch Hẹn</h2>
                <p className="text-gray-600 mt-2">Điền thông tin để chúng tôi phục vụ bạn tốt nhất</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={handleCallNow}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                <PhoneIcon size={20} color="white" />
                <span>📞 Gọi Ngay: 0123 456 789</span>
              </button>
              <button
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LocationIcon size={20} color="white" />
                <span>📍 Xem Địa Chỉ</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              {/* Step 2: Service Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dịch vụ cần đặt *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Chọn dịch vụ</option>
                    {MAIN_SERVICES.map((service) => (
                      <option key={service.id} value={service.title}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hãng xe
                  </label>
                  <select
                    name="carBrand"
                    value={formData.carBrand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Chọn hãng xe</option>
                    {carBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 3: Scheduling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày mong muốn
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giờ mong muốn
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Chọn khung giờ</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả chi tiết (không bắt buộc)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Mô tả tình trạng xe hoặc yêu cầu đặc biệt..."
                ></textarea>
              </div>

              {/* Partner Highlight */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-2">🌟 Đối tác tin cậy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <img
                      src="/images/DBV.png"
                      alt="DBV Insurance logo"
                      className="w-5 h-5 object-contain"
                    />
                    <span><strong>DBV Insurance</strong> - Bảo hiểm chính thức</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img
                      src="/images/phutung.png"
                      alt="Phụ Tùng Việt Nga logo"
                      className="w-5 h-5 object-contain"
                    />
                    <span><strong>Phụ Tùng Việt Nga</strong> - Phụ tùng chính hãng</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={!formData.name || !formData.phone || !formData.service}
                  className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  🎯 Xác Nhận Đặt Lịch
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="sm:w-32 border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ModalPortal isOpen={isOpen}>
      {modalContent}
    </ModalPortal>
  );
}
