import React, { useState } from 'react';
import { InsuranceIcon, RegistrationIcon, DocumentIcon } from './Icons';
import { ModalPortal } from './ModalPortal';

interface InsuranceService {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  services: string[];
  benefits: string[];
  process: string[];
  requiredDocs: string[];
  note: string;
}

interface InsuranceServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactUs: () => void;
}

const insuranceServices: InsuranceService[] = [
  {
    id: 1,
    title: "Bảo Hiểm Trách Nhiệm Dân Sự",
    description: "Bảo hiểm bắt buộc theo quy định pháp luật, bảo vệ bạn trước các rủi ro gây thiệt hại cho bên thứ ba.",
    icon: <InsuranceIcon size={48} color="#3B82F6" />,
    services: [
      "Bảo hiểm TNDS bắt buộc",
      "Bảo hiểm TNDS tự nguyện",
      "Bảo hiểm người ngồi trên xe",
      "Tư vấn mức bồi thường phù hợp"
    ],
    benefits: [
      "Bồi thường thiệt hại về người: tối đa 150 triệu/người",
      "Bồi thường thiệt hại tài sản: tối đa 100 triệu/vụ",
      "Chi phí cứu chữa khẩn cấp",
      "Hỗ trợ pháp lý khi có tranh chấp"
    ],
    process: [
      "Tư vấn và lựa chọn gói bảo hiểm",
      "Chuẩn bị hồ sơ theo yêu cầu",
      "Nộp hồ sơ và thanh toán phí",
      "Nhận giấy chứng nhận bảo hiểm"
    ],
    requiredDocs: [
      "Giấy đăng ký xe (bản gốc)",
      "CMND/CCCD chủ xe",
      "Giấy phép lái xe",
      "Giấy chứng nhận đăng kiểm còn hiệu lực"
    ],
    note: "Bảo hiểm TNDS bắt buộc là điều kiện để đăng kiểm xe. Xe không có bảo hiểm sẽ không được cấp tem đăng kiểm."
  },
  {
    id: 2,
    title: "Bảo Hiểm Thân Vỏ Xe",
    description: "Bảo vệ tài sản xe của bạn trước các rủi ro như tai nạn, cháy nổ, trộm cắp, thiên tai.",
    icon: <InsuranceIcon size={48} color="#10B981" />,
    services: [
      "Bảo hiểm vật chất xe cơ giới",
      "Bảo hiểm cháy nổ bắt buộc",
      "Bảo hiểm trộm cắp toàn bộ xe",
      "Bảo hiểm thiệt hại do thiên tai"
    ],
    benefits: [
      "Bồi thường 100% giá trị xe khi mất trộm",
      "Chi trả 80-100% chi phí sửa chữa khi tai nạn",
      "Bồi thường thiệt hại do cháy, nổ",
      "Hỗ trợ cứu hộ 24/7 toàn quốc"
    ],
    process: [
      "Định giá xe và tư vấn gói bảo hiểm",
      "Kiểm tra thực tế tình trạng xe",
      "Ký hợp đồng và thanh toán phí",
      "Cấp giấy chứng nhận bảo hiểm"
    ],
    requiredDocs: [
      "Giấy đăng ký xe",
      "CMND/CCCD của chủ xe",
      "Hóa đơn mua xe hoặc giấy định giá",
      "Ảnh chụp xe từ nhiều góc độ"
    ],
    note: "Mức phí bảo hiểm phụ thuộc vào giá trị xe, độ tuổi xe và lịch sử bồi thường. Xe càng mới, phí bảo hiểm càng cao."
  },
  {
    id: 3,
    title: "Đăng Kiểm Xe Ô Tô",
    description: "Dịch vụ đăng kiểm xe hộ, thủ tục nhanh gọn, đảm bảo xe của bạn luôn đạt tiêu chuẩn an toàn giao thông.",
    icon: <RegistrationIcon size={48} color="#F59E0B" />,
    services: [
      "Đăng kiểm định kỳ xe con, xe tải",
      "Đăng kiểm lần đầu xe mới",
      "Đăng kiểm sau sửa chữa lớn",
      "Tư vấn chuẩn bị xe trước đăng kiểm"
    ],
    benefits: [
      "Tiết kiệm thời gian, không phải xếp hàng",
      "Đảm bảo xe đạt tiêu chuẩn kỹ thuật",
      "Hỗ trợ sửa chữa nếu xe không đạt",
      "Nhận tem đăng kiểm ngay trong ngày"
    ],
    process: [
      "Kiểm tra sơ bộ tình trạng xe",
      "Đưa xe đến trung tâm đăng kiểm",
      "Thực hiện kiểm tra kỹ thuật",
      "Hoàn thiện thủ tục và nhận tem"
    ],
    requiredDocs: [
      "Giấy đăng ký xe",
      "Giấy chứng nhận bảo hiểm TNDS",
      "Phiếu kiểm định khí thải (nếu có)",
      "Hóa đơn nộp phí đăng kiểm"
    ],
    note: "Xe cần được đăng kiểm định kỳ theo quy định. Xe con dưới 7 chỗ: 30 tháng lần đầu, sau đó 18 tháng/lần."
  },
  {
    id: 4,
    title: "Dịch Vụ Giấy Tờ Xe",
    description: "Hỗ trợ làm mới, sang tên, đổi địa chỉ và các thủ tục giấy tờ xe khác một cách nhanh chóng.",
    icon: <DocumentIcon size={48} color="#8B5CF6" />,
    services: [
      "Sang tên đổi chủ xe",
      "Đổi địa chỉ trên đăng ký xe",
      "Làm lại giấy tờ xe bị mất",
      "Cấp lại biển số xe"
    ],
    benefits: [
      "Thủ tục đơn giản, nhanh chóng",
      "Hỗ trợ làm việc với cơ quan chức năng",
      "Đảm bảo pháp lý cho xe",
      "Tư vấn miễn phí các vấn đề liên quan"
    ],
    process: [
      "Tư vấn thủ tục cần thiết",
      "Chuẩn bị hồ sơ theo quy định",
      "Nộp hồ sơ tại cơ quan có thẩm quyền",
      "Nhận kết quả theo hẹn"
    ],
    requiredDocs: [
      "Giấy tờ tùy thân",
      "Giấy đăng ký xe cũ",
      "Hợp đồng mua bán (nếu sang tên)",
      "Các giấy tờ liên quan khác"
    ],
    note: "Chi phí và thời gian thực hiện tùy thuộc vào loại thủ tục. Sang tên xe thường mất 3-7 ngày làm việc."
  }
];

export function InsuranceServicesModal({ isOpen, onClose, onContactUs }: InsuranceServicesModalProps) {
  const [selectedService, setSelectedService] = useState<InsuranceService | null>(null);

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
          maxWidth: selectedService ? '80rem' : '70rem',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transform: 'scale(1)',
          opacity: '1'
        }}
        className="animate-in"
      >
        {!selectedService ? (
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-800">Dịch Vụ Bảo Hiểm & Đăng Kiểm</h2>
                <p className="text-gray-600 mt-2">Các dịch vụ đặc biệt cần liên hệ để có báo giá chính xác nhất</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {insuranceServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedService(service)}
                >
                  <div className="flex items-center mb-4">
                    {service.icon}
                    <h3 className="text-xl font-bold text-gray-800 ml-3">{service.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>

                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-gray-800">Dịch vụ bao gồm:</h4>
                    <ul className="text-sm text-gray-600">
                      {service.services.slice(0, 2).map((item, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ))}
                      {service.services.length > 2 && (
                        <li className="text-blue-600 font-medium">
                          +{service.services.length - 2} dịch vụ khác...
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-orange-600">Liên hệ báo giá</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Cần tư vấn chi tiết?</h3>
                <p className="text-gray-600 mb-4">
                  Liên hệ ngay để được tư vấn miễn phí và nhận báo giá tốt nhất cho nhu cầu của bạn
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={onContactUs}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Liên hệ tư vấn
                  </button>
                  <a
                    href="tel:0123456789"
                    className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-center"
                  >
                    Gọi ngay: 0123 456 789
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8">
            {/* Detailed Service View */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setSelectedService(null)}
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span className="mr-2">←</span> Quay lại
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center mb-6">
                  {selectedService.icon}
                  <div className="ml-4">
                    <h2 className="text-3xl font-bold text-gray-800">{selectedService.title}</h2>
                    <p className="text-gray-600 mt-1">{selectedService.description}</p>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Dịch vụ bao gồm</h3>
                  <ul className="space-y-2">
                    {selectedService.services.map((service, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                        <span className="text-gray-700">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Lợi ích & Quyền lợi</h3>
                  <ul className="space-y-2">
                    {selectedService.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-600 mr-3">✓</span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Process */}
                <div className="bg-yellow-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Quy trình thực hiện</h3>
                  <ol className="space-y-3">
                    {selectedService.process.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-yellow-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Required Documents */}
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Giấy tờ cần thiết</h3>
                  <ul className="space-y-2">
                    {selectedService.requiredDocs.map((doc, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-600 mr-2">📄</span>
                        <span className="text-sm text-gray-700">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Important Note */}
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                  <h4 className="font-bold text-orange-800 mb-2">Lưu ý quan trọng</h4>
                  <p className="text-sm text-orange-700">{selectedService.note}</p>
                </div>

                {/* Contact CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl text-white text-center">
                  <h4 className="text-lg font-bold mb-2">Cần hỗ trợ?</h4>
                  <p className="text-blue-100 text-sm mb-4">
                    Liên hệ ngay để được tư vấn chi tiết và báo giá
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={onContactUs}
                      className="w-full bg-white text-blue-600 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                    >
                      Yêu cầu tư vấn
                    </button>
                    <a
                      href="tel:0123456789"
                      className="block w-full border border-white text-white py-2 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
                    >
                      Gọi: 0123 456 789
                    </a>
                  </div>
                </div>
              </div>
            </div>
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
