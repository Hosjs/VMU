import React, { useState, useEffect } from 'react';
import { PhoneIcon } from './Icons';
import { ModalPortal } from './ModalPortal';

interface ConsultationData {
  name: string;
  phone: string;
  carBrand: string;
  issue: string;
  contactTime: string;
}

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [formData, setFormData] = useState<ConsultationData>({
    name: '',
    phone: '',
    carBrand: '',
    issue: '',
    contactTime: ''
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

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setFormData({
          name: '',
          phone: '',
          carBrand: '',
          issue: '',
          contactTime: ''
        });
      }, 3000);
    }, 1500);
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
          maxWidth: '32rem',
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneIcon size={32} color="#3B82F6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Yêu Cầu Tư Vấn Đã Được Gửi!</h3>
            <p className="text-gray-600 mb-4">
              Chuyên gia của chúng tôi sẽ liên hệ với bạn trong vòng 15 phút để tư vấn miễn phí.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Mã tư vấn:</strong> #{Math.random().toString(36).substr(2, 8).toUpperCase()}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Tư Vấn Miễn Phí</h2>
                <p className="text-gray-600 mt-1">Chuyên gia sẽ liên hệ trong 15 phút</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors btn-hover"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Nhập họ và tên"
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

              <div className="stagger-item">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hãng xe
                </label>
                <select
                  name="carBrand"
                  value={formData.carBrand}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn hãng xe (tùy chọn)</option>
                  <option value="toyota">Toyota</option>
                  <option value="honda">Honda</option>
                  <option value="ford">Ford</option>
                  <option value="hyundai">Hyundai</option>
                  <option value="kia">KIA</option>
                  <option value="mazda">Mazda</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="stagger-item">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thời gian thuận tiện liên hệ
                </label>
                <select
                  name="contactTime"
                  value={formData.contactTime}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Bất kỳ lúc nào</option>
                  <option value="morning">Buổi sáng (8:00 - 12:00)</option>
                  <option value="afternoon">Buổi chiều (13:00 - 17:00)</option>
                  <option value="evening">Buổi tối (18:00 - 20:00)</option>
                </select>
              </div>

              <div className="stagger-item">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vấn đề cần tư vấn
                </label>
                <textarea
                  name="issue"
                  value={formData.issue}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả vấn đề hoặc câu hỏi cần tư vấn..."
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg stagger-item">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Cam kết của chúng tôi:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Tư vấn hoàn toàn miễn phí</li>
                      <li>Phản hồi trong 15 phút</li>
                      <li>Chuyên gia có kinh nghiệm 10+ năm</li>
                    </ul>
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
                      <span>Đang gửi...</span>
                    </div>
                  ) : (
                    'Nhận Tư Vấn Ngay'
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
