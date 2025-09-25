import React, { useState, useEffect } from 'react';
import { PhoneIcon, LocationIcon } from './Icons';
import { ModalPortal } from './ModalPortal';

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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call with progress
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
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

  if (!isOpen) return null;

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
          maxWidth: '48rem',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transform: 'scale(1)',
          opacity: '1'
        }}
        className="animate-in"
      >
        {showSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Đặt Lịch Thành Công!</h3>
            <p className="text-gray-600 mb-4">
              Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Chúng tôi sẽ liên hệ với bạn trong vòng 30 phút.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Mã đặt lịch:</strong> #{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Đặt Lịch Hẹn</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="stagger-item">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>

                <div className="stagger-item">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="0123 456 789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hãng xe *
                  </label>
                  <select
                    name="carBrand"
                    value={formData.carBrand}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn hãng xe</option>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="ford">Ford</option>
                    <option value="hyundai">Hyundai</option>
                    <option value="kia">KIA</option>
                    <option value="mazda">Mazda</option>
                    <option value="bmw">BMW</option>
                    <option value="mercedes">Mercedes-Benz</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dịch vụ *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn dịch vụ</option>
                    <option value="engine-repair">Sửa chữa động cơ</option>
                    <option value="maintenance">Bảo dưỡng định kỳ</option>
                    <option value="tire-replacement">Thay lốp xe</option>
                    <option value="brake-repair">Sửa chữa phanh</option>
                    <option value="car-wash">Rửa xe & làm đẹp</option>
                    <option value="diagnostic">Kiểm tra tổng thể</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày mong muốn *
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giờ mong muốn *
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn giờ</option>
                    <option value="08:00">08:00 - 09:00</option>
                    <option value="09:00">09:00 - 10:00</option>
                    <option value="10:00">10:00 - 11:00</option>
                    <option value="11:00">11:00 - 12:00</option>
                    <option value="13:00">13:00 - 14:00</option>
                    <option value="14:00">14:00 - 15:00</option>
                    <option value="15:00">15:00 - 16:00</option>
                    <option value="16:00">16:00 - 17:00</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả vấn đề
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết vấn đề của xe hoặc yêu cầu đặc biệt..."
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Thông tin liên hệ:</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex items-center space-x-2">
                    <PhoneIcon size={16} color="#1E40AF" />
                    <span>Hotline: 0123 456 789</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <LocationIcon size={16} color="#1E40AF" />
                    <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 stagger-item">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-semibold btn-hover"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed btn-hover"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    'Đặt Lịch Ngay'
                  )}
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
