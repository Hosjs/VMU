import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import { ServiceDetail } from "~/components/ServiceDetail";
import { CompanyLogo } from "~/components/Logo";
import { BookingModal } from "~/components/BookingModal";
import { ConsultationModal } from "~/components/ConsultationModal";
import { SkeletonLoader } from "~/components/Loading";
import { ServicesCarousel } from "~/components/ServicesCarousel";
import { Partners } from "~/components/Partners";
import { GoogleMap, LocationSection } from "~/components/GoogleMap";
import { usePageTransition } from "~/components/PageTransition";
import { MAIN_SERVICES, getServiceByTitle } from "~/data/services";
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

  // Sử dụng dữ liệu từ services.ts và thêm icon
  const mainServices = MAIN_SERVICES.map(service => ({
    ...service,
    icon: service.id === 1 ? <RegistrationIcon size={80} color="#10B981" /> :
          service.id === 2 ? <InsuranceIcon size={80} color="#3B82F6" /> :
          service.id === 3 ? <CarWashIcon size={80} color="#8B5CF6" /> :
          service.id === 4 ? <ToolsIcon size={80} color="#F59E0B" /> :
          service.id === 5 ? <MaintenanceIcon size={80} color="#10B981" /> :
          service.id === 6 ? <EngineIcon size={80} color="#EF4444" /> : null
  }));

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

  const scrollToPartners = () => {
    const partnersSection = document.getElementById('strategic-partners');
    if (partnersSection) {
      partnersSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Header Section */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-white/30">
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

      {/* Hero Section - Giữ ảnh riêng */}
      <section className="py-20 md:py-32 relative overflow-hidden min-h-screen flex items-center">
        {/* Background Image với overlay riêng */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/images/1.png")'
            }}
          ></div>
          <div className="absolute inset-0 bg-black/15"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-8">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dịch vụ ô tô chuyên nghiệp</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight drop-shadow-2xl">
              Đối Tác <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Toàn Diện</span>
              <br />
              Cho Xe Của Bạn
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
              Chúng tôi cung cấp <strong className="text-blue-300">giải pháp hoàn chỉnh</strong> cho mọi nhu cầu về xe ô tô -
              từ những dịch vụ cơ bản đến các dịch vụ chuyên biệt với chất lượng đẳng cấp quốc tế.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <button
                onClick={() => handleBookingClick()}
                className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-blue-500/50 min-w-[200px]"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>📞</span>
                  <span>Đặt Lịch Ngay</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button
                onClick={handleConsultationClick}
                className="group border-2 border-white/80 text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 hover:scale-105 shadow-lg min-w-[200px] backdrop-blur-sm"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>💬</span>
                  <span>Tư Vấn Miễn Phí</span>
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 px-4">
                <div className="text-4xl md:text-5xl font-bold text-blue-300 mb-2">6</div>
                <div className="text-gray-200 font-medium">Dịch Vụ Chính</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 px-4">
                <div className="text-4xl md:text-5xl font-bold text-blue-300 mb-2">10+</div>
                <div className="text-gray-200 font-medium">Năm Kinh Nghiệm</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 px-4">
                <div className="text-4xl md:text-5xl font-bold text-blue-300 mb-2">5000+</div>
                <div className="text-gray-200 font-medium">Khách Hàng</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 px-4">
                <div className="text-4xl md:text-5xl font-bold text-blue-300 mb-2">24/7</div>
                <div className="text-gray-200 font-medium">Hỗ Trợ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Carousel Section - Background riêng */}
      <section id="services" className="py-24 relative">
        {/* Background riêng cho section này - giảm opacity */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 to-indigo-100/70 backdrop-blur-sm"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
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

      {/* Strategic Partners - Background riêng */}
      <section id="strategic-partners" className="py-20 relative overflow-hidden">
        {/* Background riêng với gradient đậm - giảm opacity */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-md"></div>

        {/* Enhanced background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-white">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold uppercase tracking-wide">Đối tác chiến lược</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              🌟 Đối Tác Chiến Lược
              <br /><span className="text-yellow-300">Hàng Đầu</span>
            </h2>

            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
              Chúng tôi tự hào hợp tác cùng <strong className="text-yellow-400">2 đơn vị uy tín hàng đầu</strong>
              trong lĩnh vực bảo hiểm và phụ tùng ô tô, đảm bảo chất lượng dịch vụ tốt nhất cho khách hàng.
            </p>
          </div>

          {/* Two Main Partners */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* DBV Insurance */}
            <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🛡️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">DBV Insurance</h3>
                    <p className="text-blue-200">Đơn vị bảo hiểm chính thức</p>
                  </div>
                </div>
                <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                  CHÍNH THỨC
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-white">Bảo hiểm TNDS bắt buộc & tự nguyện</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-white">Bảo hiểm vật chất thân vỏ xe</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-white">Hỗ trợ bồi thường nhanh chóng</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-white">Cứu hộ 24/7 toàn quốc miễn phí</span>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-xl mb-6">
                <h4 className="font-bold text-yellow-400 mb-2">✨ Ưu điểm vượt trội:</h4>
                <p className="text-blue-100 text-sm">
                  "Quy trình bồi thường minh bạch, nhanh chóng. Được tin tưởng bởi hàng nghìn khách hàng
                  với mức phí cạnh tranh nhất thị trường."
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-200">
                  <span className="font-semibold">5000+</span> khách hàng tin tưởng
                </div>
                <button
                  onClick={handleConsultationClick}
                  className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                >
                  Tư Vấn Ngay
                </button>
              </div>
            </div>

            {/* Phụ Tùng Việt Nga */}
            <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🏪</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Phụ Tùng Ô Tô Việt Nga</h3>
                    <p className="text-blue-200">Nhà phân phối phụ tùng uy tín</p>
                  </div>
                </div>
                <div className="bg-amber-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                  CHIẾN LƯỢC
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-white">Phụ tùng chính hãng 100%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-white">Mạng lưới phân phối rộng khắp</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-white">Giao hàng nhanh trong ngày</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-white">Bảo hành chính thức từ 6-24 tháng</span>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-xl mb-6">
                <h4 className="font-bold text-amber-400 mb-2">🎯 Cam kết chất lượng:</h4>
                <p className="text-blue-100 text-sm">
                  "Đối tác tin cậy với kho phụ tùng đa dạng, phục vụ tất cả các hãng xe từ phổ thông đến cao cấp,
                  giá cạnh tranh nhất thị trường."
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-200">
                  <span className="font-semibold">10+</span> năm kinh nghiệm
                </div>
                <button
                  onClick={handleConsultationClick}
                  className="bg-amber-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-amber-300 transition-colors"
                >
                  Xem Phụ Tùng
                </button>
              </div>
            </div>
          </div>

          {/* Additional Partners Preview */}
          <div className="text-center">
            <p className="text-blue-200 mb-6">
              Ngoài ra, chúng tôi còn hợp tác với nhiều thương hiệu uy tín khác:
            </p>

            <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">🛢️ Castrol</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">🚗 Hyundai Mobis</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">⚙️ Mando</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">⚡ Koyo</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">🔧 Valeo</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">🛠️ Bosch</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">🔍 Mahle</span>
              </div>
            </div>

            <button
              onClick={handleConsultationClick}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg hover:scale-105 transform duration-300"
            >
              💬 Tư Vấn Miễn Phí Ngay
            </button>
          </div>
        </div>
      </section>

      {/* Partners Section - Background riêng với ảnh 2.png */}
      <section className="py-20 relative">
        {/* Background với ảnh 2.png */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/2.png")'
          }}
        ></div>

        {/* Overlay giảm opacity xuống 20% để ảnh nền hiển thị rõ hơn */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"></div>

        <div className="relative z-10">
          <Partners />
        </div>
      </section>

      {/* Testimonials - Background riêng */}
      <section id="testimonials" className="py-20 relative">
        {/* Background riêng - giảm opacity */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/75 to-blue-50/75 backdrop-blur-sm"></div>

        <div className="container mx-auto px-6 relative z-10">
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

      {/* About Section - Background riêng */}
      <section id="about" className="py-20 relative">
        {/* Background trắng riêng - giảm opacity */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 to-blue-50/30"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Về chúng tôi</span>
            </div>

            <h3 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Tại Sao Chọn
              <br /><span className="text-blue-600">Chúng Tôi?</span>
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Với 6 dịch vụ chuyên biệt, chúng tôi cam kết mang đến giải pháp toàn diện
              cho mọi nhu cầu của xe ô tô với chất lượng đẳng cấp quốc tế.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <MechanicIcon size={40} color="#3B82F6" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">Đội Ngũ Chuyên Nghiệp</h4>
              <p className="text-gray-600 leading-relaxed">10+ năm kinh nghiệm, được đào tạo bài bản và cập nhật công nghệ thường xuyên</p>
            </div>

            <div className="text-center group">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300">
                <SpeedIcon size={40} color="#10B981" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">Phục Vụ Nhanh Chóng</h4>
              <p className="text-gray-600 leading-relaxed">Cam kết thời gian hoàn thành đúng hẹn, hỗ trợ khẩn cấp 24/7</p>
            </div>

            <div className="text-center group">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-300">
                <QualityIcon size={40} color="#8B5CF6" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">Chất Lượng Đảm Bảo</h4>
              <p className="text-gray-600 leading-relaxed">Sử dụng 100% phụ tùng chính hãng, quy trình chuẩn nhà sản xuất</p>
            </div>

            <div className="text-center group">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors duration-300">
                <PhoneIcon size={40} color="#F59E0B" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">Hỗ Trợ Tận Tâm</h4>
              <p className="text-gray-600 leading-relaxed">Tư vấn miễn phí, theo dõi xe sau dịch vụ, hỗ trợ khách hàng chu đáo</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-gray-700 font-medium">Năm Kinh Nghiệm</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl font-bold text-green-600 mb-2">5000+</div>
              <div className="text-gray-700 font-medium">Khách Hàng Tin Tưởng</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-700 font-medium">Hãng Xe Hỗ Trợ</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-700 font-medium">Hỗ Trợ Khẩn Cấp</div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section - Background riêng */}
      <section className="relative">
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>

        <div className="relative z-10">
          <LocationSection />
        </div>
      </section>

      {/* Contact Section - Background riêng */}
      <section id="contact" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-100/80 backdrop-blur-sm"></div>

        <div className="container mx-auto px-6 relative z-10">
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
                  className="w-full border-2 border-blue-600 text-blue-600 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
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

      {/* Footer - Background riêng */}
      <footer className="py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md"></div>

        <div className="container mx-auto px-6 relative z-10 text-white">
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
