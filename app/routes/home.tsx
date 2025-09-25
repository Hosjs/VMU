import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import { ServiceDetail } from "~/components/ServiceDetail";
import { CompanyLogo } from "~/components/Logo";
import { BookingModal } from "~/components/BookingModal";
import { ConsultationModal } from "~/components/ConsultationModal";
import { SkeletonLoader } from "~/components/Loading";
import { ServicesCarousel } from "~/components/ServicesCarousel";
import { Partners } from "~/components/Partners";
import { usePageTransition } from "~/components/PageTransition";
import {
  EngineIcon,
  MaintenanceIcon,
  ToolsIcon,
  InsuranceIcon,
  RegistrationIcon,
  CarWashIcon,
  LocationIcon,
  PhoneIcon,
  MechanicIcon,
  SpeedIcon,
  QualityIcon
} from "~/components/Icons";

interface ServiceDetail {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  price: string;
  isSpecialService?: boolean;
  features: string[];
  details: {
    supportedBrands: string[];
    carTypes: string[];
    features: string[];
    warranty: string;
    duration: string;
    gallery: string[];
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AutoCare Pro - Đối Tác Toàn Diện Cho Xe Của Bạn | 6 Dịch Vụ Chuyên Nghiệp" },
    { name: "description", content: "Đối tác toàn diện cho xe ô tô với 6 dịch vụ chuyên nghiệp: Hỗ trợ đăng kiểm, Bảo hiểm TNDS & Vật chất, Sơn sửa bảo hiểm, Phụ tùng ô tô, Bảo dưỡng định kỳ, Sửa chữa ngoài bảo hiểm" },
  ];
}

export default function Home() {
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { setTransitionType } = usePageTransition();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 6 dịch vụ chính cho ServiceDetail modal
  const mainServices = [
    {
      id: 1,
      title: "Hỗ Trợ Đăng Kiểm",
      subtitle: "Dịch vụ toàn diện từ A-Z",
      description: "Nhận xe, xếp hàng, đăng kiểm và giao trả xe tại nhà. Phục vụ tất cả các ngày trong tuần theo giờ hành chính.",
      icon: <RegistrationIcon size={80} color="#10B981" />,
      price: "Liên hệ báo giá",
      isSpecialService: true,
      features: [
        "Nhận xe tại nhà hoặc công ty",
        "Xếp hàng và thực hiện đăng kiểm",
        "Giao trả xe sau khi hoàn thành",
        "Phục vụ tất cả các ngày trong tuần",
        "Theo giờ hành chính (8:00-17:00)",
        "Hỗ trợ sửa chữa nếu xe không đạt"
      ],
      details: {
        supportedBrands: [
          "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
          "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "Isuzu",
          "BMW", "Mercedes", "Audi", "Lexus", "Tất cả các hãng xe"
        ],
        carTypes: [
          "Xe con dưới 9 chỗ", "SUV/CUV", "MPV 7-9 chỗ", "Pickup truck",
          "Xe tải nhẹ dưới 3.5T", "Xe khách", "Xe chuyên dùng"
        ],
        features: [
          "Nhận xe tại địa chỉ của khách hàng",
          "Kiểm tra sơ bộ trước khi đăng kiểm",
          "Xếp hàng và thực hiện đăng kiểm",
          "Sửa chữa nhỏ nếu xe không đạt tiêu chuẩn",
          "Giao trả xe cùng với giấy tờ đăng kiểm",
          "Nhắc lịch đăng kiểm lần tiếp theo"
        ],
        warranty: "Tem đăng kiểm có hiệu lực",
        duration: "1-2 ngày làm việc",
        gallery: []
      }
    },
    {
      id: 2,
      title: "Mua Bảo Hiểm TNDS & Vật Chất",
      subtitle: "Bảo vệ toàn diện cho xe và người",
      description: "Cung cấp bảo hiểm Trách nhiệm Dân sự bắt buộc và Bảo hiểm Vật chất với mức phí cạnh tranh nhất thị trường.",
      icon: <InsuranceIcon size={80} color="#3B82F6" />,
      price: "Liên hệ báo giá",
      isSpecialService: true,
      features: [
        "Bảo hiểm TNDS bắt buộc theo quy định",
        "Bảo hiểm TNDS tự nguyện",
        "Bảo hiểm Vật chất (thân vỏ xe)",
        "Bảo hiểm người ngồi trên xe",
        "Hỗ trợ làm thủ tục bồi thường",
        "Tư vấn gói bảo hiểm phù hợp"
      ],
      details: {
        supportedBrands: [
          "Tất cả các hãng xe", "Xe con", "Xe tải", "Xe khách",
          "Xe chuyên dùng", "Xe máy", "Moto phân khối lớn"
        ],
        carTypes: [
          "Xe con 4-9 chỗ", "SUV/CUV", "MPV", "Pickup truck",
          "Xe tải các loại", "Xe khách", "Xe chuyên dùng", "Xe container"
        ],
        features: [
          "TNDS bắt buộc: bồi thường tối đa 150 triệu/người",
          "TNDS tự nguyện: mức bồi thường cao hơn",
          "Vật chất: bồi thường 100% khi mất trộm/hỏng toàn bộ",
          "Chi trả 80-100% chi phí sửa chữa khi tai nạn",
          "Cứu hộ 24/7 toàn quốc miễn phí",
          "Hỗ trợ pháp lý khi có tranh chấp"
        ],
        warranty: "Theo hợp đồng bảo hiểm",
        duration: "1 năm (có thể gia hạn)",
        gallery: []
      }
    },
    {
      id: 3,
      title: "Làm Sơn Sửa Bảo Hiểm",
      subtitle: "Phục hồi xe như mới sau tai nạn",
      description: "Dịch vụ sơn sửa chuyên nghiệp cho xe bảo hiểm với quy trình chuẩn, sử dụng sơn chính hãng, khôi phục xe như ban đầu.",
      icon: <CarWashIcon size={80} color="#8B5CF6" />,
      price: "Theo báo giá bảo hiểm",
      isSpecialService: true,
      features: [
        "Sơn sửa theo tiêu chuẩn bảo hiểm",
        "Sử dụng sơn chính hãng",
        "Tháo lắp chuyên nghiệp",
        "Sơn phủ hoàn thiện",
        "Bàn giao xe như mới",
        "Bảo hành chất lượng sơn"
      ],
      details: {
        supportedBrands: [
          "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
          "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "BMW",
          "Mercedes", "Audi", "Lexus", "Infiniti", "Volvo", "Tất cả hãng"
        ],
        carTypes: [
          "Xe con", "SUV", "MPV", "Pickup", "Xe sang", "Xe thể thao",
          "Xe tải nhẹ", "Xe đã qua sử dụng"
        ],
        features: [
          "Định giá thiệt hại theo chuẩn bảo hiểm",
          "Tháo lắp chi tiết bị hư hỏng",
          "Gò đập chỉnh hình thân xe",
          "Sơn lót, sơn phủ bằng sơn chính hãng",
          "Lắp ráp và kiểm tra chất lượng",
          "Đánh bóng và hoàn thiện"
        ],
        warranty: "6-12 tháng",
        duration: "3-7 ngày tùy mức độ hư hỏng",
        gallery: []
      }
    },
    {
      id: 4,
      title: "Mua Phụ Tùng Ô Tô",
      subtitle: "Phụ tùng chính hãng giá tốt nhất",
      description: "Cung cấp phụ tùng chính hãng cho tất cả các hãng xe với giá cạnh tranh, giao hàng nhanh, bảo hành chính thức.",
      icon: <ToolsIcon size={80} color="#F59E0B" />,
      price: "Từ 50.000đ",
      isSpecialService: false,
      features: [
        "Phụ tùng chính hãng 100%",
        "Giá cạnh tranh nhất thị trường",
        "Giao hàng tận nơi",
        "Tư vấn lựa chọn phù hợp",
        "Hỗ trợ lắp đặt",
        "Bảo hành chính hãng"
      ],
      details: {
        supportedBrands: [
          "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
          "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "BMW",
          "Mercedes", "Audi", "Volkswagen", "Peugeot", "Renault",
          "Lexus", "Infiniti", "Acura", "Volvo", "Jaguar", "Land Rover"
        ],
        carTypes: [
          "Xe con các loại", "SUV/CUV", "MPV", "Pickup", "Xe tải nhẹ",
          "Xe sang", "Xe thể thao", "Xe hybrid", "Xe cũ", "Xe độ"
        ],
        features: [
          "Lọc dầu, lọc gió, lọc nhiên liệu các loại",
          "Má phanh, đĩa phanh, dầu phanh chính hãng",
          "Lốp xe các thương hiệu nổi tiếng",
          "Ắc quy, bugi, dây curoa chính hãng",
          "Đèn xe, gương xe, kính xe",
          "Tư vấn và lắp đặt tại garage"
        ],
        warranty: "6-24 tháng tùy sản phẩm",
        duration: "Giao hàng trong ngày",
        gallery: []
      }
    },
    {
      id: 5,
      title: "Bảo Dưỡng Định Kỳ Các Cấp",
      subtitle: "Bảo dưỡng chuẩn nhà sản xuất",
      description: "Dịch vụ bảo dưỡng định kỳ theo chuẩn nhà sản xuất cho tất cả các cấp: 5.000km, 10.000km, 20.000km, 40.000km...",
      icon: <MaintenanceIcon size={80} color="#10B981" />,
      price: "Từ 300.000đ",
      isSpecialService: false,
      features: [
        "Bảo dưỡng cấp 1: 5.000-10.000km",
        "Bảo dưỡng cấp 2: 15.000-20.000km",
        "Bảo dưỡng cấp 3: 30.000-40.000km",
        "Bảo dưỡng cấp 4: 60.000km trở lên",
        "Sử dụng dầu nhớt chính hãng",
        "Kiểm tra tổng thể 56 hạng mục"
      ],
      details: {
        supportedBrands: [
          "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
          "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "Isuzu",
          "Daewoo", "Ssangyong", "Peugeot", "Renault", "Fiat"
        ],
        carTypes: [
          "Xe con 4-5 chỗ", "SUV/CUV", "MPV 7-9 chỗ", "Pickup",
          "Xe tải nhẹ dưới 3.5T", "Xe van/minibus", "Xe hybrid"
        ],
        features: [
          "Thay dầu động cơ + lọc dầu theo chuẩn",
          "Kiểm tra và bổ sung dầu các hệ thống",
          "Thay lọc gió, lọc nhiên liệu theo chu kỳ",
          "Kiểm tra hệ thống phanh và lốp xe",
          "Test ắc quy và hệ thống điện",
          "Vệ sinh động cơ và rửa xe miễn phí"
        ],
        warranty: "3-6 tháng",
        duration: "2-4 giờ",
        gallery: []
      }
    },
    {
      id: 6,
      title: "Kiểm Tra, Sửa Chữa, Sơn Gò Ngoài Bảo Hiểm",
      subtitle: "Sửa chữa tổng thể mọi hư hỏng",
      description: "Dịch vụ kiểm tra, chẩn đoán và sửa chữa toàn diện các hư hỏng xe ngoài bảo hiểm với đội ngũ thợ lành nghề.",
      icon: <EngineIcon size={80} color="#EF4444" />,
      price: "Từ 200.000đ",
      isSpecialService: false,
      features: [
        "Chẩn đoán hư hỏng bằng máy scan",
        "Sửa chữa động cơ, hộp số",
        "Sửa chữa hệ thống điện, điều hóa",
        "Sơn gò thân xe chuyên nghiệp",
        "Thay thế linh kiện hỏng",
        "Kiểm tra tổng thể sau sửa chữa"
      ],
      details: {
        supportedBrands: [
          "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
          "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "Isuzu",
          "BMW", "Mercedes", "Audi", "Lexus", "Infiniti", "Volvo"
        ],
        carTypes: [
          "Xe con", "SUV", "MPV", "Pickup", "Xe tải nhẹ", "Xe sang",
          "Xe thể thao", "Xe cũ", "Xe độ", "Xe tai nạn"
        ],
        features: [
          "Chẩn đoán lỗi bằng máy scan chuyên dụng",
          "Sửa chữa động cơ: piston, xilanh, van...",
          "Sửa hộp số: ly hợp, hộp số tự động/sàn",
          "Sơn gò: chỉnh hình, sơn phủ chuyên nghiệp",
          "Sửa hệ thống điện: đèn, còi, điều hóa",
          "Bảo hành chất lượng sửa chữa"
        ],
        warranty: "3-12 tháng tùy hạng mục",
        duration: "1-7 ngày tùy mức độ hư hỏng",
        gallery: []
      }
    }
  ];

  const testimonials = [
    {
      name: "Anh Minh - Toyota Camry",
      service: "Hỗ trợ đăng kiểm",
      rating: 5,
      comment: "Dịch vụ rất tiện lợi! Nhận xe tại nhà, lo hết thủ tục đăng kiểm và giao trả xe đúng hẹn. Rất hài lòng!"
    },
    {
      name: "Chị Lan - Honda CR-V",
      service: "Bảo hiểm TNDS & Vật chất",
      rating: 5,
      comment: "Tư vấn nhiệt tình, giá bảo hiểm cạnh tranh. Khi có sự cố được hỗ trợ làm thủ tục rất nhanh."
    },
    {
      name: "Anh Hùng - Ford Ranger",
      service: "Sơn sửa bảo hiểm",
      rating: 5,
      comment: "Xe bị tai nạn được sơn sửa như mới, chất lượng tuyệt vời. Thợ làm rất tỉ mỉ và chuyên nghiệp."
    },
    {
      name: "Chị Mai - Mazda CX-5",
      service: "Bảo dưỡng định kỳ",
      rating: 5,
      comment: "Bảo dưỡng đúng chuẩn nhà sản xuất, xe chạy êm ru hơn. Giá cả hợp lý, dịch vụ chu đáo."
    }
  ];

  const handleBookingClick = (serviceName?: string) => {
    setSelectedServiceForBooking(serviceName || '');
    setIsBookingOpen(true);
  };

  const handleConsultationClick = () => {
    setIsConsultationOpen(true);
  };

  const handleCallClick = () => {
    window.open('tel:0123456789', '_self');
  };

  const handleServiceSelect = (serviceTitle: string) => {
    const service = mainServices.find(s => s.title === serviceTitle);
    if (service) {
      setSelectedService(service);
    }
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <CompanyLogo />

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Dịch Vụ</a>
              <a href="/products" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Sản Phẩm</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Về Chúng Tôi</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Đánh Giá</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Liên Hệ</a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Hotline 24/7</p>
                <p className="text-lg font-bold text-blue-600">0123 456 789</p>
              </div>
              <PhoneIcon size={20} color="#3B82F6" />
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Dịch Vụ</a>
                <a href="/products" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Sản Phẩm</a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Về Chúng Tôi</a>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Đánh Giá</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Liên Hệ</a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Cải tiến chuyên nghiệp hơn */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-200/20 to-transparent rounded-full translate-y-40 -translate-x-40"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-8">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dịch vụ ô tô chuyên nghiệp</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-800 mb-8 leading-tight">
              Đối Tác <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Toàn Diện</span>
              <br />
              Cho Xe Của Bạn
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Chúng tôi cung cấp <strong className="text-blue-600">giải pháp hoàn chỉnh</strong> cho mọi nhu cầu về xe ô tô -
              từ những dịch vụ cơ bản đến các dịch vụ chuyên biệt với chất lượng đẳng cấp quốc tế.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <button
                onClick={() => handleBookingClick()}
                className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-blue-500/25 min-w-[200px]"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>📞</span>
                  <span>Đặt Lịch Ngay</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button
                onClick={handleConsultationClick}
                className="group border-2 border-blue-600 text-blue-600 px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-105 shadow-lg min-w-[200px]"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>💬</span>
                  <span>Tư Vấn Miễn Phí</span>
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">6</div>
                <div className="text-gray-600 font-medium">Dịch Vụ Chính</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">10+</div>
                <div className="text-gray-600 font-medium">Năm Kinh Nghiệm</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">5000+</div>
                <div className="text-gray-600 font-medium">Khách Hàng</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Hỗ Trợ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Carousel Section */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Dịch vụ của chúng tôi</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Khám Phá Các
              <br /><span className="text-blue-600">Dịch Vụ Chuyên Nghiệp</span>
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Mỗi dịch vụ được thiết kế để đáp ứng hoàn hảo nhu cầu cụ thể của xe và chủ xe,
              với quy trình chuẩn quốc tế và đội ngũ chuyên gia hàng đầu.
            </p>
          </div>

          {/* Services Carousel */}
          <ServicesCarousel
            onServiceSelect={handleServiceSelect}
            onConsultationClick={handleConsultationClick}
          />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6">Tại Sao Chọn Chúng Tôi?</h3>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Với 6 dịch vụ chuyên biệt, chúng tôi cam kết mang đến giải pháp toàn diện
              cho mọi nhu cầu của xe ô tô
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MechanicIcon size={40} color="#FFFFFF" />
              </div>
              <h4 className="text-xl font-bold mb-3">Đội Ngũ Chuyên Nghiệp</h4>
              <p className="text-blue-100">10+ năm kinh nghiệm, được đào tạo bài bản và cập nhật công nghệ thường xuyên</p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <SpeedIcon size={40} color="#FFFFFF" />
              </div>
              <h4 className="text-xl font-bold mb-3">Phục Vụ Nhanh Chóng</h4>
              <p className="text-blue-100">Cam kết thời gian hoàn thành đúng hẹn, hỗ trợ khẩn cấp 24/7</p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <QualityIcon size={40} color="#FFFFFF" />
              </div>
              <h4 className="text-xl font-bold mb-3">Chất Lượng Đảm Bảo</h4>
              <p className="text-blue-100">Sử dụng 100% phụ tùng chính hãng, quy trình chuẩn nhà sản xuất</p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon size={40} color="#FFFFFF" />
              </div>
              <h4 className="text-xl font-bold mb-3">Hỗ Trợ Tận Tâm</h4>
              <p className="text-blue-100">Tư vấn miễn phí, theo dõi xe sau dịch vụ, hỗ trợ khách hàng chu đáo</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10+</div>
              <div className="text-blue-100">Năm Kinh Nghiệm</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">5000+</div>
              <div className="text-blue-100">Khách Hàng Tin Tưởng</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-blue-100">Hãng Xe Hỗ Trợ</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">Hỗ Trợ Khẩn Cấp</div>
            </div>
          </div>
        </div>
      </section>
      {/* Partners Section */}
      <Partners />


      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">Khách Hàng Nói Gì</h3>
            <p className="text-xl text-gray-600">Những đánh giá thực tế từ khách hàng đã trải nghiệm dịch vụ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4 text-sm">"{testimonial.comment}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-800 text-sm">{testimonial.name}</p>
                  <p className="text-blue-600 font-medium text-xs">{testimonial.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Liên Hệ Với Chúng Tôi</h3>
              <p className="text-gray-600 mb-8">
                Sẵn sàng phục vụ bạn với 6 dịch vụ chuyên nghiệp. Hãy liên hệ để được tư vấn!
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <PhoneIcon size={24} color="#3B82F6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Hotline 24/7</p>
                    <p className="text-blue-600 font-bold text-lg">0123 456 789</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <LocationIcon size={24} color="#3B82F6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Địa chỉ</p>
                    <p className="text-gray-600">123 Đường ABC, Quận XYZ, TP.HCM</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Giờ làm việc</p>
                    <p className="text-gray-600">8:00 - 17:00 (Tất cả các ngày trong tuần)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl">
              <h4 className="text-2xl font-bold text-gray-800 mb-6">Đặt Lịch Hẹn Nhanh</h4>
              <p className="text-gray-600 mb-6">
                Chọn dịch vụ bạn cần và đặt lịch hẹn ngay hôm nay!
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => handleBookingClick()}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  📅 Đặt Lịch Hẹn
                </button>

                <button
                  onClick={handleConsultationClick}
                  className="w-full border-2 border-blue-600 text-blue-600 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  💬 Tư Vấn Miễn Phí
                </button>

                <button
                  onClick={handleCallClick}
                  className="w-full bg-green-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  📞 Gọi Ngay: 0123 456 789
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <CompanyLogo />
              <p className="text-gray-400 mt-4 mb-4 leading-relaxed">
                Đối tác toàn diện cho xe ô tô với 6 dịch vụ chuyên nghiệp: Hỗ trợ đăng kiểm, Bảo hiểm TNDS & Vật chất,
                Sơn sửa bảo hiểm, Phụ tùng ô tô, Bảo dưỡng định kỳ, Sửa chữa ngoài bảo hiểm.
              </p>
              <div className="text-sm text-gray-400">
                <p>🏢 Giấy phép kinh doanh: 0123456789</p>
                <p>🏆 Chứng nhận ISO 9001:2015</p>
              </div>
            </div>

            <div>
              <h5 className="text-lg font-bold mb-4">6 Dịch Vụ Chính</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>🚗 Hỗ trợ đăng kiểm</li>
                <li>🛡️ Bảo hiểm TNDS & Vật chất</li>
                <li>🎨 Sơn sửa bảo hiểm</li>
                <li>🔧 Phụ tùng ô tô</li>
                <li>🛠️ Bảo dưỡng định kỳ</li>
                <li>⚡ Sửa chữa ngoài bảo hiểm</li>
              </ul>
            </div>

            <div>
              <h5 className="text-lg font-bold mb-4">Liên Hệ</h5>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <PhoneIcon size={16} color="#60A5FA" />
                  <span className="text-blue-300 font-bold">0123 456 789</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span className="text-gray-400">info@autocare.pro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <LocationIcon size={16} color="#60A5FA" />
                  <span className="text-gray-400">123 Đường ABC, Q.XYZ, TP.HCM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AutoCare Pro. Tất cả quyền được bảo lưu. | Đối Tác Toàn Diện Cho Xe Của Bạn</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedService && (
        <ServiceDetail
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onBookService={(serviceName) => {
            setSelectedService(null);
            handleBookingClick(serviceName);
          }}
        />
      )}

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedService={selectedServiceForBooking}
      />

      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
}
