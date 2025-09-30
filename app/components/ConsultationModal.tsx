import React, { useState, useEffect } from 'react';
import { PhoneIcon, LocationIcon } from './Icons';
import { ModalPortal } from './ModalPortal';
import { MAIN_SERVICES } from '~/data/services';

interface ConsultationData {
  name: string;
  phone: string;
  carBrand: string;
  issue: string;
  contactTime: string;
  interestedService: string;
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
    contactTime: '',
    interestedService: ''
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
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate realistic API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      // Auto close after showing success
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setFormData({
          name: '',
          phone: '',
          carBrand: '',
          issue: '',
          contactTime: '',
          interestedService: ''
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

  const contactTimes = [
    'Ngay bây giờ', '8:00 - 12:00', '13:00 - 17:00', 'Tối (18:00 - 20:00)', 'Cuối tuần'
  ];

  const commonIssues = [
    'Tư vấn giá dịch vụ',
    'Đăng kiểm xe ô tô',
    'Mua bảo hiểm xe',
    'Sửa chữa xe',
    'Mua phụ tùng',
    'Bảo dưỡng định kỳ',
    'Sơn sửa xe',
    'Khác'
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
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Gửi Yêu Cầu Thành Công!</h3>
              <p className="text-gray-600 mb-6">
                Chúng tôi đã nhận được yêu cầu tư vấn của bạn và sẽ liên hệ trong vòng 5-10 phút.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">🌟 Cam kết của chúng tôi:</h4>
                <div className="text-left text-sm text-gray-600 space-y-2">
                  <p>• <strong>Tư vấn miễn phí</strong> từ chuyên gia có kinh nghiệm</p>
                  <p>• <strong>Báo giá chính xác</strong> cho tất cả dịch vụ</p>
                  <p>• <strong>Đối tác uy tín:</strong> DBV Insurance & Phụ Tùng Việt Nga</p>
                  <p>• <strong>Hỗ trợ 24/7</strong> kể cả cuối tuần</p>
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
                <p className="text-xs text-gray-500">Tự động đóng sau 3 giây...</p>
              </div>
            </div>
          </div>
        ) : isSubmitting ? (
          // Loading State
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Đang gửi yêu cầu tư vấn...</h3>
              <p className="text-gray-600">Chuyên gia của chúng tôi sẽ liên hệ với bạn ngay</p>
            </div>
          </div>
        ) : (
          // Form State
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">💬 Tư Vấn Miễn Phí</h2>
                <p className="text-gray-600 mt-2">Nhận tư vấn chuyên nghiệp từ đội ngũ chuyên gia</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Quick Contact Options */}
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
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.237 1.219-5.237s-.31-.663-.31-1.645c0-1.541.893-2.691 2.005-2.691.946 0 1.404.709 1.404 1.559 0 .951-.609 2.373-.92 3.692-.262 1.103.552 2.002 1.637 2.002 1.966 0 3.48-2.072 3.48-5.077 0-2.654-1.905-4.515-4.627-4.515-3.15 0-4.996 2.362-4.996 4.806 0 .951.368 1.972.829 2.527.091.111.104.208.077.321-.084.353-.273 1.11-.311 1.267-.049.2-.16.242-.37.146-1.35-.629-2.193-2.607-2.193-4.193 0-3.403 2.471-6.531 7.131-6.531 3.745 0 6.654 2.668 6.654 6.233 0 3.719-2.343 6.711-5.596 6.711-1.093 0-2.122-.568-2.471-1.245l-.672 2.562c-.242.93-.9 2.097-1.338 2.807.998.309 2.058.477 3.165.477 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
                <span>💬 Chat Zalo</span>
              </button>
            </div>

            {/* Partners Showcase */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-8 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🌟 Đối Tác Chiến Lược</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2 border border-gray-200">
                      <img
                        src="/images/DBV.png"
                        alt="DBV Insurance logo"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-600">DBV Insurance</h4>
                      <p className="text-sm text-gray-600">Đơn vị bảo hiểm chính thức</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2 border border-gray-200">
                      <img
                        src="/images/phutung.png"
                        alt="Phụ Tùng Việt Nga logo"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-600">Phụ Tùng Việt Nga</h4>
                      <p className="text-sm text-gray-600">Nhà phân phối phụ tùng uy tín</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
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

              {/* Car & Service Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dịch vụ quan tâm
                  </label>
                  <select
                    name="interestedService"
                    value={formData.interestedService}
                    onChange={handleChange}
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
              </div>

              {/* Issue & Contact Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vấn đề cần tư vấn
                  </label>
                  <select
                    name="issue"
                    value={formData.issue}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Chọn vấn đề</option>
                    {commonIssues.map((issue) => (
                      <option key={issue} value={issue}>
                        {issue}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thời gian liên hệ
                  </label>
                  <select
                    name="contactTime"
                    value={formData.contactTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Chọn thời gian</option>
                    {contactTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">✨ Lợi ích khi tư vấn với chúng tôi:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Tư vấn miễn phí từ chuyên gia có 10+ năm kinh nghiệm</li>
                  <li>• Báo giá chính xác, minh bạch cho tất cả dịch vụ</li>
                  <li>• Cam kết giá tốt nhất với chất lượng đảm bảo</li>
                  <li>• Hỗ trợ 24/7, kể cả cuối tuần và ngày lễ</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={!formData.name || !formData.phone}
                  className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  💬 Gửi Yêu Cầu Tư Vấn
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="sm:w-32 border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Đóng
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
