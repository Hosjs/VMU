import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import { ServiceDetail } from "~/components/ServiceDetail";
import { LocationSection } from "~/components/GoogleMap";
import { CompanyLogo } from "~/components/Logo";
import { BookingModal } from "~/components/BookingModal";
import { ConsultationModal } from "~/components/ConsultationModal";
import { SkeletonLoader } from "~/components/Loading";
import { usePageTransition } from "~/components/PageTransition";
import {
  EngineIcon,
  MaintenanceIcon,
  TireIcon,
  BrakeIcon,
  CarWashIcon,
  DiagnosticIcon,
  InsuranceIcon,
  RegistrationIcon,
  DocumentIcon,
  LocationIcon,
  PhoneIcon,
  MechanicIcon,
  ToolsIcon,
  SpeedIcon,
  QualityIcon
} from "~/components/Icons";

interface ServiceDetail {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  price: string;
  isSpecialService?: boolean; // Đánh dấu dịch vụ đặc biệt cần báo giá
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
    { title: "AutoCare Pro - Dịch Vụ Bảo Hiểm & Đăng Kiểm Xe Hơi Chuyên Nghiệp" },
    { name: "description", content: "Dịch vụ bảo hiểm xe, đăng ký đăng kiểm và sửa chữa ô tô chuyên nghiệp. Đăng kiểm hộ, bảo hiểm trách nhiệm dân sự, bảo hiểm thân vỏ với giá tốt nhất." },
  ];
}

export default function Home() {
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [servicesLoaded, setServicesLoaded] = useState(false);

  const { setTransitionType } = usePageTransition();

  // Simulate loading for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setServicesLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Danh sách các hãng cung cấp nổi bật - chỉ hiển thị tổng quan
  const featuredSuppliers = [
    {
      id: 1,
      name: "Bosch Vietnam",
      logo: "🔧",
      description: "Nhà cung cấp phụ tùng động cơ và hệ thống điện hàng đầu",
      specialties: ["Lọc dầu", "Bugi", "Cảm biến", "Hệ thống phun xăng"],
      productCount: "500+ sản phẩm",
      established: "1995",
      color: "#E11D48"
    },
    {
      id: 2,
      name: "Brembo Asia Pacific",
      logo: "🛑",
      description: "Chuyên gia hệ thống phanh cao cấp từ Ý",
      specialties: ["Má phanh", "Đĩa phanh", "Caliper", "Dầu phanh"],
      productCount: "200+ sản phẩm",
      established: "1985",
      color: "#DC2626"
    },
    {
      id: 3,
      name: "Michelin Vietnam",
      logo: "🛞",
      description: "Thương hiệu lốp xe hàng đầu thế giới từ Pháp",
      specialties: ["Lốp du lịch", "Lốp SUV", "Lốp truck", "Van hơi"],
      productCount: "300+ sản phẩm",
      established: "1998",
      color: "#0EA5E9"
    },
    {
      id: 4,
      name: "GS Battery Vietnam",
      logo: "🔋",
      description: "Nhà sản xuất ắc quy ô tô uy tín từ Nhật Bản",
      specialties: ["Ắc quy khô", "Ắc quy nước", "Ắc quy hybrid", "Phụ kiện"],
      productCount: "150+ sản phẩm",
      established: "2000",
      color: "#059669"
    },
    {
      id: 5,
      name: "KYB Manufacturing",
      logo: "⚙️",
      description: "Chuyên gia hệ thống treo và giảm chấn từ Nhật",
      specialties: ["Amortisseur", "Lò xo", "Gối đỡ", "Kit sửa chữa"],
      productCount: "400+ sản phẩm",
      established: "1992",
      color: "#7C3AED"
    },
    {
      id: 6,
      name: "BP Castrol Vietnam",
      logo: "🛢️",
      description: "Thương hiệu dầu nhớt và hóa chất ô tô hàng đầu",
      specialties: ["Dầu động cơ", "Dầu hộp số", "Dầu phanh", "Phụ gia"],
      productCount: "250+ sản phẩm",
      established: "1994",
      color: "#F59E0B"
    }
  ];

  const handleSupplierClick = (supplierName: string) => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featuredServices = [
    {
      id: 1,
      title: "Sửa Chữa Động Cơ",
      description: "Chẩn đoán và sửa chữa mọi vấn đề về động cơ xe với công nghệ hiện đại",
      icon: <EngineIcon size={64} color="#3B82F6" />,
      price: "Liên hệ",
      details: {
        supportedBrands: [
          "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
          "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "BMW",
          "Mercedes-Benz", "Audi", "Lexus", "Infiniti", "Volvo"
        ],
        carTypes: [
          "Sedan 4-5 chỗ", "SUV/Crossover", "Hatchback", "Pickup Truck",
          "MPV/Van 7-9 chỗ", "Coupe/Convertible", "Xe tải nhẹ"
        ],
        features: [
          "Chẩn đoán bằng máy scan chuyên dụng",
          "Kiểm tra hệ thống phun xăng/dầu",
          "Thay thế piston, xilanh khi cần",
          "Bảo trì hệ thống làm mát",
          "Kiểm tra và thay dầu động cơ",
          "Vệ sinh buồng đốt carbon"
        ],
        warranty: "6-12 tháng",
        duration: "2-5 ngày",
        gallery: []
      }
    },
    {
      id: 2,
      title: "Bảo Dưỡng Định Kỳ",
      description: "Dịch vụ bảo dưỡng toàn diện theo lịch trình của nhà sản xuất",
      icon: <MaintenanceIcon size={64} color="#10B981" />,
      price: "Liên hệ",
      details: {
        supportedBrands: [
          "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
          "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "Isuzu",
          "Daewoo", "Ssangyong", "Peugeot", "Renault", "Fiat"
        ],
        carTypes: [
          "Xe con 4-5 chỗ", "SUV/CUV", "MPV 7-9 chỗ", "Pickup",
          "Xe tải nhẹ dưới 3.5T", "Xe van/minibus"
        ],
        features: [
          "Thay dầu động cơ + lọc dầu",
          "Kiểm tra hệ thống phanh",
          "Thay lọc gió, lọc nhiên liệu",
          "Kiểm tra áp suất lốp",
          "Test ắc quy và hệ thống điện",
          "Rửa xe miễn phí"
        ],
        warranty: "3-6 tháng",
        duration: "2-4 giờ",
        gallery: []
      }
    },
    {
      id: 3,
      title: "Thay Thế Lốp Xe",
      description: "Lốp xe chính hãng từ các thương hiệu uy tín, lắp đặt chuyên nghiệp",
      icon: <TireIcon size={64} color="#F59E0B" />,
      price: "Liên hệ",
      details: {
        supportedBrands: [
          "Bridgestone", "Michelin", "Continental", "Pirelli", "Yokohama",
          "Dunlop", "Toyo", "Kumho", "Hankook", "Goodyear", "Maxxis",
          "BFGoodrich", "Falken", "Nitto", "Cooper", "General"
        ],
        carTypes: [
          "Xe du lịch 13-17 inch", "SUV/CUV 16-22 inch", "Pickup 15-20 inch",
          "Xe tải nhẹ 14-16 inch", "Xe thể thao 17-20 inch", "Xe sang 18-22 inch"
        ],
        features: [
          "Cân bằng động bánh xe",
          "Căn chỉnh góc đặt bánh",
          "Kiểm tra hệ thống treo",
          "Thay van hơi mới",
          "Bảo hành thủng, nứt",
          "Dịch vụ cứu hộ lốp 24/7"
        ],
        warranty: "12-24 tháng",
        duration: "1-2 giờ",
        gallery: []
      }
    },
    {
      id: 4,
      title: "Sửa Chữa Phanh",
      description: "Kiểm tra và thay thế hệ thống phanh đảm bảo an toàn tuyệt đối",
      icon: <BrakeIcon size={64} color="#EF4444" />,
      price: "Liên hệ",
      details: {
        supportedBrands: [
          "Toyota", "Honda", "Ford", "Hyundai", "KIA", "Mazda",
          "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "BMW",
          "Mercedes", "Audi", "Lexus", "Acura", "Infiniti"
        ],
        carTypes: [
          "Xe con phanh đĩa/tang", "SUV phanh đĩa 4 bánh", "Pickup phanh hỗn hợp",
          "MPV phanh đĩa trước", "Xe tải phanh khí nén", "Xe sang phanh ceramic"
        ],
        features: [
          "Thay má phanh/guốc phanh",
          "Thay đĩa phanh khi mòn",
          "Thay dầu phanh định kỳ",
          "Kiểm tra phanh tay",
          "Test hệ thống ABS",
          "Căn chỉnh phanh 4 bánh"
        ],
        warranty: "6-12 tháng",
        duration: "3-6 giờ",
        gallery: []
      }
    },
    {
      id: 5,
      title: "Rửa Xe & Làm Đẹp",
      description: "Dịch vụ rửa xe, đánh bóng và chăm sóc ngoại thất chuyên nghiệp",
      icon: <CarWashIcon size={64} color="#8B5CF6" />,
      price: "Liên hệ",
      details: {
        supportedBrands: [
          "Tất cả các hãng xe", "Xe Nhật Bản", "Xe Hàn Quốc", "Xe Châu Âu",
          "Xe Mỹ", "Xe sang", "Xe thể thao", "Xe cổ điển"
        ],
        carTypes: [
          "Sedan/Hatchback", "SUV/Crossover", "Pickup/Truck",
          "MPV/Van", "Coupe/Convertible", "Xe tải nhẹ", "Xe moto"
        ],
        features: [
          "Rửa xe máy áp lực cao",
          "Đánh bóng sơn nano ceramic",
          "Vệ sinh nội thất da/nỉ",
          "Phủ bóng lốp và nhựa",
          "Khử mùi ozon chuyên nghiệp",
          "Dịch vụ wax bảo vệ sơn"
        ],
        warranty: "1-3 tháng",
        duration: "1-4 giờ",
        gallery: []
      }
    },
    {
      id: 6,
      title: "Kiểm Tra Tổng Thể",
      description: "Kiểm tra toàn bộ hệ thống xe với thiết bị chẩn đoán hiện đại",
      icon: <DiagnosticIcon size={64} color="#06B6D4" />,
      price: "Liên hệ",
      details: {
        supportedBrands: [
          "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
          "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "Subaru",
          "BMW", "Mercedes", "Audi", "Volkswagen", "Volvo"
        ],
        carTypes: [
          "Xe con các loại", "SUV/CUV", "MPV", "Pickup", "Xe tải nhẹ",
          "Xe hybrid", "Xe điện", "Xe số tự động/số sàn"
        ],
        features: [
          "Scan lỗi máy tính xe",
          "Kiểm tra hệ thống điện",
          "Test áp suất động cơ",
          "Đo khí thải Euro 4/5",
          "Kiểm tra hệ thống treo",
          "Báo cáo chi tiết tình trạng xe"
        ],
        warranty: "30 ngày",
        duration: "2-3 giờ",
        gallery: []
      }
    },
    {
      id: 7,
      title: "Bảo Hiểm Xe Hơi",
      description: "Các gói bảo hiểm xe hơi toàn diện, bảo vệ bạn và xe trước rủi ro",
      icon: <InsuranceIcon size={64} color="#3B82F6" />,
      price: "Liên hệ",
      isSpecialService: true,
      details: {
        supportedBrands: [],
        carTypes: [],
        features: [],
        warranty: "",
        duration: "",
        gallery: []
      }
    },
    {
      id: 8,
      title: "Đăng Kiểm Xe Ô Tô",
      description: "Dịch vụ đăng kiểm xe ô tô nhanh chóng, thủ tục đơn giản, giá cả cạnh tranh",
      icon: <RegistrationIcon size={64} color="#10B981" />,
      price: "Liên hệ",
      isSpecialService: true,
      details: {
        supportedBrands: [],
        carTypes: [],
        features: [],
        warranty: "",
        duration: "",
        gallery: []
      }
    },
    {
      id: 9,
      title: "Làm Giấy Tờ Xe",
      description: "Dịch vụ làm giấy tờ xe nhanh chóng, bao gồm đăng ký, sang tên, đổi biển số",
      icon: <DocumentIcon size={64} color="#F59E0B" />,
      price: "Liên hệ",
      isSpecialService: true,
      details: {
        supportedBrands: [],
        carTypes: [],
        features: [],
        warranty: "",
        duration: "",
        gallery: []
      }
    }
  ];

  // Thêm các dịch vụ bảo hiểm và đăng kiểm nổi bật
  const specialServices = [
    {
      id: 10,
      title: "Đăng Kiểm Hộ",
      description: "Dịch vụ đăng kiểm xe nhanh chóng, tiết kiệm thời gian, thủ tục đơn giản",
      icon: <RegistrationIcon size={64} color="#10B981" />,
      price: "Liên hệ báo giá",
      isSpecialService: true,
      details: {
        supportedBrands: ["Tất cả các hãng xe"],
        carTypes: ["Xe con", "SUV", "Pickup", "Xe tải nhẹ", "MPV"],
        features: [
          "Đăng kiểm định kỳ theo quy định",
          "Kiểm tra kỹ thuật toàn diện",
          "Hỗ trợ sửa chữa nếu không đạt",
          "Nhận tem đăng kiểm trong ngày"
        ],
        warranty: "Tem đăng kiểm hợp lệ",
        duration: "1 ngày",
        gallery: []
      }
    },
    {
      id: 11,
      title: "Bảo Hiểm TNDS",
      description: "Bảo hiểm trách nhiệm dân sự bắt buộc và tự nguyện với mức phí cạnh tranh",
      icon: <InsuranceIcon size={64} color="#3B82F6" />,
      price: "Liên hệ báo giá",
      isSpecialService: true,
      details: {
        supportedBrands: ["Tất cả các hãng xe"],
        carTypes: ["Xe con", "SUV", "MPV", "Pickup", "Xe tải", "Xe khách"],
        features: [
          "Bảo hiểm TNDS bắt buộc",
          "Bảo hiểm TNDS tự nguyện",
          "Bảo hiểm người ngồi trên xe",
          "Hỗ trợ giải quyết bồi thường"
        ],
        warranty: "Theo hợp đồng bảo hiểm",
        duration: "1 năm",
        gallery: []
      }
    },
    {
      id: 12,
      title: "Bảo Hiểm Thân Vỏ",
      description: "Bảo vệ tài sản xe trước rủi ro tai nạn, cháy nổ, trộm cắp, thiên tai",
      icon: <InsuranceIcon size={64} color="#8B5CF6" />,
      price: "Liên hệ báo giá",
      isSpecialService: true,
      details: {
        supportedBrands: ["Tất cả các hãng xe"],
        carTypes: ["Xe con", "SUV", "MPV", "Xe sang", "Xe thể thao"],
        features: [
          "Bảo hiểm vật chất xe",
          "Bảo hiểm cháy nổ",
          "Bảo hiểm trộm cắp",
          "Cứu hộ 24/7"
        ],
        warranty: "Theo hợp đồng bảo hiểm",
        duration: "1 năm",
        gallery: []
      }
    },
    {
      id: 13,
      title: "Mua Phụ Tùng",
      description: "Cung cấp phụ tùng chính hãng cho tất cả các hãng xe với giá cạnh tranh",
      icon: <ToolsIcon size={64} color="#F59E0B" />,
      price: "Liên hệ",
      details: {
        supportedBrands: [
          "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
          "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "BMW",
          "Mercedes", "Audi", "Volkswagen", "Peugeot", "Renault"
        ],
        carTypes: [
          "Xe con các loại", "SUV/CUV", "MPV", "Pickup", "Xe tải nhẹ",
          "Xe sang", "Xe thể thao", "Xe hybrid"
        ],
        features: [
          "Phụ tùng chính hãng 100%",
          "Bảo hành chính hãng",
          "Giao hàng tận nơi",
          "Tư vấn lựa chọn phù hợp",
          "Hỗ trợ lắp đặt",
          "Đổi trả trong 7 ngày"
        ],
        warranty: "6-24 tháng",
        duration: "Giao hàng trong ngày",
        gallery: []
      }
    },
    {
      id: 14,
      title: "Sửa Chữa & Sơn Sửa",
      description: "Dịch vụ sửa chữa tổng thể và sơn sửa ngoài bảo hiểm với chất lượng cao",
      icon: <MaintenanceIcon size={64} color="#EF4444" />,
      price: "Liên hệ",
      details: {
        supportedBrands: [
          "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
          "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "Isuzu",
          "BMW", "Mercedes", "Audi", "Lexus", "Infiniti", "Volvo"
        ],
        carTypes: [
          "Xe con", "SUV", "MPV", "Pickup", "Xe tải nhẹ", "Xe sang",
          "Xe thể thao", "Xe cổ", "Xe độ"
        ],
        features: [
          "Sửa chữa sau tai nạn",
          "Sơn sửa chuyên nghiệp",
          "Khôi phục nguyên bản",
          "Sử dụng sơn chính hãng",
          "Đánh bóng hoàn thiện",
          "Bảo hành chất lượng"
        ],
        warranty: "6-12 tháng",
        duration: "3-7 ngày",
        gallery: []
      }
    }
  ];

  // Gộp tất cả dịch vụ
  const allServices = [...featuredServices, ...specialServices];

  const testimonials = [
    {
      name: "Anh Minh Toyota",
      car: "Toyota Camry 2020",
      service: "Bảo dưỡng định kỳ",
      rating: 5,
      comment: "Dịch vụ chuyên nghiệp, thợ kỹ thuật giỏi. Xe chạy êm ru sau khi bảo dưỡng."
    },
    {
      name: "Chị Lan Honda",
      car: "Honda CR-V 2019",
      service: "Sửa chữa động cơ",
      rating: 5,
      comment: "Giá cả hợp lý, sửa chữa nhanh chóng. Động cơ hoạt động tốt như mới."
    },
    {
      name: "Anh Hùng Ford",
      car: "Ford Ranger 2021",
      service: "Thay lốp xe",
      rating: 5,
      comment: "Lốp chính hãng, lắp đặt cẩn thận. Tư vấn nhiệt tình, giá tốt."
    }
  ];

  const handleBookingClick = (serviceName?: string) => {
    setSelectedServiceForBooking(serviceName || '');
    setIsBookingOpen(true);
  };

  const handleConsultationClick = () => {
    setIsConsultationOpen(true);
  };

  const handleProductsNavigation = () => {
    setTransitionType('progress');
    window.location.href = '/products';
  };

  const handleCallClick = () => {
    window.open('tel:0123456789', '_self');
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <header className="bg-white shadow-lg sticky top-0 z-40 slide-in-right">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <CompanyLogo />

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors font-medium btn-hover">Dịch Vụ</a>
              <a href="#suppliers" className="text-gray-700 hover:text-blue-600 transition-colors font-medium btn-hover">Đối Tác</a>
              <button
                onClick={handleProductsNavigation}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium btn-hover"
              >
                Sản Phẩm
              </button>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors font-medium btn-hover">Đánh Giá</a>
              <a href="#location" className="text-gray-700 hover:text-blue-600 transition-colors font-medium btn-hover">Vị Trí</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium btn-hover">Liên Hệ</a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 btn-hover"
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

          {/* Mobile Navigation with animation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200 slide-up">
              <div className="flex flex-col space-y-4">
                <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Dịch Vụ</a>
                <a href="#suppliers" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Đối Tác</a>
                <button
                  onClick={handleProductsNavigation}
                  className="text-left text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Sản Phẩm
                </button>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Đánh Giá</a>
                <a href="#location" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Vị Trí</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Liên Hệ</a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with animations */}
      <section className="py-12 md:py-20 text-center relative overflow-hidden scale-in">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-700/10"></div>
        <div className="container mx-auto px-6 relative">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 slide-in-left">
            Dịch Vụ Gara Ô Tô <span className="text-blue-600">Chuyên Nghiệp</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed slide-in-right">
            Với hơn 10 năm kinh nghiệm, chúng tôi cam kết mang đến các dịch vụ sửa chữa,
            bảo dưỡng xe ô tô chất lượng cao với đội ngũ kỹ thuật viên chuyên nghiệp và trang thiết bị hiện đại.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12 slide-up">
            <button
              onClick={() => handleBookingClick()}
              className="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl btn-hover"
            >
              Đặt Lịch Ngay
            </button>
            <button
              onClick={handleConsultationClick}
              className="border-2 border-blue-600 text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-blue-50 transition-all duration-300 btn-hover"
            >
              Tư Vấn Miễn Phí
            </button>
          </div>

          {/* Stats with stagger animation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center stagger-item">
              <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-gray-600">Năm kinh nghiệm</div>
            </div>
            <div className="text-center stagger-item">
              <div className="text-4xl font-bold text-blue-600 mb-2">5000+</div>
              <div className="text-gray-600">Khách hàng tin tưởng</div>
            </div>
            <div className="text-center stagger-item">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Hãng xe hỗ trợ</div>
            </div>
            <div className="text-center stagger-item">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Hỗ trợ khẩn cấp</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Section with card animations */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 slide-up">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">Cung Cấp Các Dịch Vụ</h3>
            <p className="text-xl text-gray-600">Các dịch vụ chất lượng cao được khách hàng tin tưởng với hỗ trợ đa dạng hãng xe</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allServices.map((service, index) => (
              <div key={service.id} className={`bg-gradient-to-br from-white to-blue-50 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 card-hover stagger-item ${service.isSpecialService ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50' : ''}`}>
                <div className="flex justify-center mb-4">{service.icon}</div>
                <h4 className="text-2xl font-bold text-gray-800 mb-4 text-center">{service.title}</h4>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">{service.description}</p>

                {/* Special Service Badge */}
                {service.isSpecialService && (
                  <div className="mb-4 text-center">
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                      📞 Dịch vụ đặc biệt - Liên hệ báo giá
                    </span>
                  </div>
                )}

                {/* Quick Info - chỉ hiển thị cho dịch vụ thường */}
                {!service.isSpecialService && (
                  <div className="mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Hãng xe hỗ trợ:</span>
                      <span className="text-gray-700 font-semibold">{service.details.supportedBrands.length}+ hãng</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Thời gian:</span>
                      <span className="text-gray-700 font-semibold">{service.details.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bảo hành:</span>
                      <span className="text-gray-700 font-semibold">{service.details.warranty}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className={`text-2xl font-bold ${service.isSpecialService ? 'text-orange-600' : 'text-blue-600'}`}>
                    {service.price}
                  </span>
                  {service.isSpecialService ? (
                    <button
                      onClick={handleConsultationClick}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold btn-hover"
                    >
                      Liên Hệ Ngay
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedService(service)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold btn-hover"
                    >
                      Xem Chi Tiết
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Suppliers Section */}
      <section id="suppliers" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">Đối Tác Cung Cấp</h3>
            <p className="text-xl text-gray-600">Các nhà cung cấp phụ tùng ô tô uy tín hàng đầu thế giới</p>
            <div className="mt-6">
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Xem Tất Cả Sản Phẩm →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105 border-l-4 cursor-pointer"
                style={{ borderLeftColor: supplier.color }}
                onClick={() => handleSupplierClick(supplier.name)}
              >
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mr-4"
                    style={{ backgroundColor: `${supplier.color}20` }}
                  >
                    {supplier.logo}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-800">{supplier.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>Từ {supplier.established}</span>
                      <span>•</span>
                      <span>{supplier.productCount}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed">{supplier.description}</p>

                {/* Specialties */}
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Chuyên môn:</h5>
                  <div className="flex flex-wrap gap-2">
                    {supplier.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: `${supplier.color}15`,
                          color: supplier.color
                        }}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Click để xem sản phẩm</span>
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke={supplier.color}
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">6+</div>
              <div className="text-gray-600 text-sm">Đối tác chiến lược</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">2000+</div>
              <div className="text-gray-600 text-sm">Sản phẩm có sẵn</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600 text-sm">Phụ tùng chính hãng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">24h</div>
              <div className="text-gray-600 text-sm">Giao hàng nhanh</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">Khách Hàng Nói Gì Về Chúng Tôi</h3>
            <p className="text-xl text-gray-600">Những đánh giá thực tế từ khách hàng đã sử dụng dịch vụ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">{testimonial.name[0]}</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.car}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.comment}"</p>
                <div className="text-sm text-blue-600 font-semibold">Dịch vụ: {testimonial.service}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-6 text-center text-white">
          <h3 className="text-4xl font-bold mb-4">Tại Sao Chọn Chúng Tôi?</h3>
          <p className="text-xl mb-12">Những ưu điểm vượt trội khiến khách hàng tin tưởng</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <MechanicIcon size={64} color="#FFFFFF" />
              </div>
              <h4 className="text-xl font-bold mb-3">Thợ Chuyên Nghiệp</h4>
              <p className="text-blue-100">Đội ngũ kỹ thuật viên có chứng chỉ và kinh nghiệm lâu năm với các hãng xe</p>
            </div>
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <ToolsIcon size={64} color="#FFFFFF" />
              </div>
              <h4 className="text-xl font-bold mb-3">Thiết Bị Hiện Đại</h4>
              <p className="text-blue-100">Đầu tư máy móc, thiết bị chẩn đoán công nghệ cao cho mọi loại xe</p>
            </div>
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <SpeedIcon size={64} color="#FFFFFF" />
              </div>
              <h4 className="text-xl font-bold mb-3">Phục Vụ Nhanh</h4>
              <p className="text-blue-100">Cam kết thời gian hoàn thành dịch vụ đúng hẹn với chất lượng đảm bảo</p>
            </div>
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <QualityIcon size={64} color="#FFFFFF" />
              </div>
              <h4 className="text-xl font-bold mb-3">Phụ Tùng Chính Hãng</h4>
              <p className="text-blue-100">Sử dụng 100% phụ tùng chính hãng có bảo hành từ các nhà phân phối uy tín</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section with Google Maps */}
      <LocationSection />

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Liên Hệ Với Chúng Tôi</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <LocationIcon size={24} color="#3B82F6" />
                  <span className="text-lg text-gray-700">123 Đường ABC, Quận XYZ, TP.HCM</span>
                </div>
                <div
                  className="flex items-center space-x-3 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleCallClick}
                >
                  <PhoneIcon size={24} color="#3B82F6" />
                  <span className="text-lg text-gray-700 font-semibold">0123 456 789</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span className="text-lg text-gray-700">info@autocare.pro</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <span className="text-lg text-gray-700">Mở cửa: 8:00 - 18:00 (Thứ 2 - Chủ nhật)</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h4 className="text-2xl font-bold text-gray-800 mb-6">Đặt Lịch Hẹn Nhanh</h4>
              <p className="text-gray-600 mb-6">
                Điền thông tin cơ bản, chúng tôi sẽ liên hệ để xác nhận lịch hẹn chi tiết.
              </p>
              <button
                onClick={() => handleBookingClick()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
              >
                Mở Form Đặt Lịch
              </button>
              <button
                onClick={handleConsultationClick}
                className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Tư Vấn Trực Tuyến
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <CompanyLogo />
              <p className="text-gray-400 mb-4 mt-4">Đối tác tin cậy cho mọi nhu cầu sửa chữa và bảo dưỡng xe ô tô của bạn.</p>
              <div className="text-sm text-gray-400">
                <p>Giấy phép kinh doanh: 0123456789</p>
                <p>Chứng nhận ISO 9001:2015</p>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Dịch Vụ Chính</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-white transition-colors">Sửa chữa động cơ các hãng</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Bảo dưỡng định kỳ</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Thay lốp xe chính hãng</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Rửa xe & làm đẹp</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Cứu hộ xe 24/7</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Kết Nối Với Chúng Tôi</h5>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors text-white font-bold">f</a>
                <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors text-white font-bold">t</a>
                <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors text-white font-bold">i</a>
                <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors text-white font-bold">y</a>
              </div>
              <div className="text-sm text-gray-400">
                <p className="mb-1">Hotline: <span className="text-white font-bold">0123 456 789</span></p>
                <p>Email: info@autocare.pro</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AutoCare Pro. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>

      {/* Modals with animation */}
      {selectedService && (
        <div className="modal-enter">
          <ServiceDetail
            service={selectedService}
            onClose={() => setSelectedService(null)}
            onBookService={(serviceName) => {
              setSelectedService(null);
              handleBookingClick(serviceName);
            }}
          />
        </div>
      )}

      <div className={isBookingOpen ? "modal-enter" : ""}>
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          selectedService={selectedServiceForBooking}
        />
      </div>

      <div className={isConsultationOpen ? "modal-enter" : ""}>
        <ConsultationModal
          isOpen={isConsultationOpen}
          onClose={() => setIsConsultationOpen(false)}
        />
      </div>
    </div>
  );
}
