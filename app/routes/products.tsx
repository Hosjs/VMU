import type { Route } from "./+types/products";
import { useState, useEffect } from "react";
import { CompanyLogo } from "~/components/Logo";
import { LocationIcon, PhoneIcon } from "~/components/Icons";
import { BookingModal } from "~/components/BookingModal";
import { ConsultationModal } from "~/components/ConsultationModal";
import { SkeletonLoader } from "~/components/Loading";
import { usePageTransition } from "~/components/PageTransition";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sản Phẩm & Phụ Tùng - AutoCare Pro" },
    { name: "description", content: "Danh sách sản phẩm và phụ tùng ô tô chính hãng từ các nhà cung cấp uy tín như Bosch, Brembo, Michelin, GS Battery với giá tốt nhất." },
  ];
}

interface Product {
  id: number;
  name: string;
  brand: string;
  supplier: string;
  carBrands: string[];
  carTypes: string[];
  category: string;
  price: string;
  originalPrice?: string;
  discount?: number;
  inStock: boolean;
  image: string;
  warranty: string;
  description: string;
  specifications: {
    partNumber: string;
    compatibility: string[];
    material: string;
    origin: string;
  };
}

const products: Product[] = [
  // Engine Parts - Bosch Vietnam
  {
    id: 1,
    name: "Lọc Dầu Động Cơ Mann Filter",
    brand: "Mann Filter",
    supplier: "Bosch Vietnam",
    carBrands: ["Toyota", "Honda", "Mazda", "Ford"],
    carTypes: ["Sedan", "SUV", "Hatchback"],
    category: "Động Cơ",
    price: "285.000đ",
    originalPrice: "320.000đ",
    discount: 11,
    inStock: true,
    image: "🔧",
    warranty: "12 tháng",
    description: "Lọc dầu động cơ chính hãng Mann Filter, chất lượng Đức",
    specifications: {
      partNumber: "W 712/75",
      compatibility: ["Toyota Vios", "Honda City", "Mazda3"],
      material: "Giấy lọc cellulose",
      origin: "Đức"
    }
  },
  {
    id: 2,
    name: "Bugi NGK Iridium IX",
    brand: "NGK",
    supplier: "Bosch Vietnam",
    carBrands: ["Toyota", "Honda", "Nissan", "Mazda"],
    carTypes: ["Sedan", "Hatchback"],
    category: "Động Cơ",
    price: "450.000đ",
    originalPrice: "520.000đ",
    discount: 13,
    inStock: true,
    image: "⚡",
    warranty: "24 tháng",
    description: "Bugi NGK Iridium với công nghệ tiên tiến, tuổi thọ cao",
    specifications: {
      partNumber: "IFR6T11",
      compatibility: ["Honda Civic", "Toyota Altis"],
      material: "Điện cực iridium",
      origin: "Nhật Bản"
    }
  },
  // Brake Parts - Brembo
  {
    id: 3,
    name: "Má Phanh Brembo Premium",
    brand: "Brembo",
    supplier: "Brembo Asia Pacific",
    carBrands: ["BMW", "Mercedes", "Audi"],
    carTypes: ["Sedan", "SUV"],
    category: "Phanh",
    price: "1.250.000đ",
    originalPrice: "1.400.000đ",
    discount: 11,
    inStock: true,
    image: "🛑",
    warranty: "18 tháng",
    description: "Má phanh Brembo cao cấp cho xe sang Châu Âu",
    specifications: {
      partNumber: "P 06 037",
      compatibility: ["BMW 3 Series", "Mercedes C-Class"],
      material: "Ceramic composite",
      origin: "Ý"
    }
  },
  {
    id: 4,
    name: "Đĩa Phanh Brembo Xtra",
    brand: "Brembo",
    supplier: "Brembo Asia Pacific",
    carBrands: ["Toyota", "Honda", "Mazda"],
    carTypes: ["Sedan", "SUV", "Hatchback"],
    category: "Phanh",
    price: "890.000đ",
    originalPrice: "1.050.000đ",
    discount: 15,
    inStock: true,
    image: "⚙️",
    warranty: "24 tháng",
    description: "Đĩa phanh Brembo Xtra với công nghệ chống rỉ sét",
    specifications: {
      partNumber: "09.9772.11",
      compatibility: ["Toyota Camry", "Honda Accord"],
      material: "Cast iron with coating",
      origin: "Ý"
    }
  },
  // Tires - Michelin
  {
    id: 5,
    name: "Lốp Michelin Primacy 4",
    brand: "Michelin",
    supplier: "Michelin Vietnam",
    carBrands: ["Toyota", "Honda", "Mazda", "Hyundai"],
    carTypes: ["Sedan", "Hatchback"],
    category: "Lốp Xe",
    price: "2.650.000đ",
    originalPrice: "2.900.000đ",
    discount: 9,
    inStock: true,
    image: "🚗",
    warranty: "60.000 km",
    description: "Lốp Michelin Primacy 4 - An toàn ướt vượt trội",
    specifications: {
      partNumber: "215/60R16 95V",
      compatibility: ["Toyota Altis", "Honda Civic"],
      material: "Silica compound",
      origin: "Thái Lan"
    }
  },
  {
    id: 6,
    name: "Lốp Michelin Pilot Sport 4",
    brand: "Michelin",
    supplier: "Michelin Vietnam",
    carBrands: ["BMW", "Mercedes", "Audi"],
    carTypes: ["Sedan", "Coupe"],
    category: "Lốp Xe",
    price: "4.250.000đ",
    originalPrice: "4.650.000đ",
    discount: 9,
    inStock: true,
    image: "🏎️",
    warranty: "40.000 km",
    description: "Lốp thể thao cao cấp Michelin Pilot Sport 4",
    specifications: {
      partNumber: "225/45R17 94Y",
      compatibility: ["BMW 3 Series", "Mercedes C-Class"],
      material: "Bi-compound tread",
      origin: "Pháp"
    }
  },
  // Battery - GS Battery
  {
    id: 7,
    name: "Ắc Quy GS Astra Premium",
    brand: "GS Battery",
    supplier: "GS Battery Vietnam",
    carBrands: ["Toyota", "Honda", "Mazda", "Hyundai"],
    carTypes: ["Sedan", "SUV", "Hatchback"],
    category: "Điện",
    price: "1.850.000đ",
    originalPrice: "2.100.000đ",
    discount: 12,
    inStock: true,
    image: "🔋",
    warranty: "18 tháng",
    description: "Ắc quy GS Astra Premium công nghệ AGM",
    specifications: {
      partNumber: "MF75D23L",
      compatibility: ["Toyota Vios", "Honda City"],
      material: "AGM Technology",
      origin: "Indonesia"
    }
  },
  {
    id: 8,
    name: "Ắc Quy GS Incoe Premium",
    brand: "GS Battery",
    supplier: "GS Battery Vietnam",
    carBrands: ["BMW", "Mercedes", "Audi"],
    carTypes: ["Sedan", "SUV"],
    category: "Điện",
    price: "3.250.000đ",
    originalPrice: "3.650.000đ",
    discount: 11,
    inStock: true,
    image: "⚡",
    warranty: "24 tháng",
    description: "Ắc quy cao cấp GS Incoe cho xe sang Châu Âu",
    specifications: {
      partNumber: "MF100D26L",
      compatibility: ["BMW X3", "Mercedes GLC"],
      material: "Enhanced Flooded Battery",
      origin: "Hàn Quốc"
    }
  }
];

const categories = ["Tất Cả", "Động Cơ", "Phanh", "Lốp Xe", "Điện"];
const brands = ["Tất Cả", "Mann Filter", "NGK", "Brembo", "Michelin", "GS Battery"];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("Tất Cả");
  const [selectedBrand, setSelectedBrand] = useState("Tất Cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { setTransitionType } = usePageTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "Tất Cả" || product.category === selectedCategory;
    const matchesBrand = selectedBrand === "Tất Cả" || product.brand === selectedBrand;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.carBrands.some(brand => brand.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesBrand && matchesSearch;
  });

  const handleBookingClick = (productName?: string) => {
    setIsBookingOpen(true);
  };

  const handleConsultationClick = () => {
    setIsConsultationOpen(true);
  };

  const handleCallClick = () => {
    window.open('tel:0123456789', '_self');
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen relative" style={{
      backgroundImage: 'url("/images/background-app.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background overlay để tạo hiệu ứng chìm */}
      <div className="fixed inset-0 bg-white/25 backdrop-blur-[1px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-white/30 relative">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <CompanyLogo />

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Trang Chủ</a>
              <a href="#products" className="text-blue-600 font-medium">Sản Phẩm</a>
              <a href="/#services" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Dịch Vụ</a>
              <a href="/#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Về Chúng Tôi</a>
              <a href="/#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Liên Hệ</a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Phone info */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm text-gray-600">Hotline 24/7</p>
                <p className="text-base sm:text-lg font-bold text-blue-600">0123 456 789</p>
              </div>
              <div className="block sm:hidden">
                <PhoneIcon size={20} color="#3B82F6" />
              </div>
              <div className="hidden sm:block">
                <PhoneIcon size={20} color="#3B82F6" />
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-gray-50">
                  🏠 Trang Chủ
                </a>
                <a href="#products" className="text-blue-600 font-medium py-2 px-2 rounded-lg bg-blue-50">
                  📦 Sản Phẩm
                </a>
                <a href="/#services" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-gray-50">
                  🛠 Dịch Vụ
                </a>
                <a href="/#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-gray-50">
                  ℹ Về Chúng Tôi
                </a>
                <a href="/#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-gray-50">
                  📞 Liên Hệ
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section với background ảnh 3.png */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        {/* Background Image với overlay riêng */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/images/3.png")',
              opacity: 0.3
            }}
          ></div>
          <div className="absolute inset-0 bg-blue-900/60"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Sản phẩm chính hãng</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Phụ Tùng & Sản Phẩm
              <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Chính Hãng</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-100 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Đa dạng phụ tùng ô tô từ <strong className="text-blue-300">các thương hiệu hàng đầu thế giới</strong>
              với chất lượng đảm bảo và giá cả cạnh tranh nhất thị trường.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
              <button
                onClick={() => handleBookingClick()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-blue-500/50"
              >
                📞 Liên Hệ Báo Giá
              </button>
              <button
                onClick={handleConsultationClick}
                className="border-2 border-white/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 hover:scale-105 shadow-lg backdrop-blur-sm"
              >
                💬 Tư Vấn Miễn Phí
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section với background giảm opacity */}
      <section id="products" className="py-12 sm:py-20 relative">
        <div className="absolute inset-0 bg-white/75 backdrop-blur-sm"></div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Tên sản phẩm, thương hiệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedCategory("Tất Cả");
                    setSelectedBrand("Tất Cả");
                    setSearchTerm("");
                  }}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid với background giảm opacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                {/* Product Image */}
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  <span className="text-6xl">{product.image}</span>
                  {product.discount && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{product.discount}%
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Hết Hàng</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                    <span className="text-xs text-gray-500">{product.warranty}</span>
                  </div>

                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">Thương hiệu:</span>
                    <span className="text-sm font-bold text-blue-600">{product.brand}</span>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm text-gray-600">Tương thích:</span>
                    <div className="flex flex-wrap gap-1">
                      {product.carBrands.slice(0, 2).map(brand => (
                        <span key={brand} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {brand}
                        </span>
                      ))}
                      {product.carBrands.length > 2 && (
                        <span className="text-xs text-gray-500">+{product.carBrands.length - 2}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-blue-600">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-xs font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Chi Tiết
                    </button>
                    <button
                      onClick={() => handleBookingClick(product.name)}
                      className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      Liên Hệ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-600">Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-md"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Cần Tư Vấn Thêm?
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn miễn phí về sản phẩm phù hợp nhất cho xe của bạn
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleConsultationClick}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              💬 Tư Vấn Miễn Phí
            </button>
            <button
              onClick={handleCallClick}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              📞 Gọi: 0123 456 789
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md"></div>

        <div className="container mx-auto px-6 relative z-10 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <CompanyLogo />
              <p className="text-gray-400 mt-4 leading-relaxed">
                Chuyên cung cấp phụ tùng ô tô chính hãng từ các thương hiệu uy tín với giá tốt nhất thị trường.
              </p>
            </div>

            <div>
              <h5 className="text-lg font-bold mb-4">Danh Mục Sản Phẩm</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>🔧 Phụ tùng động cơ</li>
                <li>🛑 Hệ thống phanh</li>
                <li>🚗 Lốp xe các loại</li>
                <li>🔋 Ắc quy & điện</li>
                <li>⚙️ Phụ kiện khác</li>
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
                  <LocationIcon size={16} color="#60A5FA" />
                  <span className="text-gray-400">123 Đường ABC, Q.XYZ, TP.HCM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AutoCare Pro. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-8xl">{selectedProduct.image}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">{selectedProduct.price}</span>
                      {selectedProduct.originalPrice && (
                        <span className="text-lg text-gray-500 line-through ml-2">{selectedProduct.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedProduct.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${selectedProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedProduct.inStock ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold text-gray-800">Thương hiệu:</span>
                      <span className="ml-2 text-blue-600">{selectedProduct.brand}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Nhà cung cấp:</span>
                      <span className="ml-2">{selectedProduct.supplier}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Bảo hành:</span>
                      <span className="ml-2">{selectedProduct.warranty}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Mã sản phẩm:</span>
                      <span className="ml-2 font-mono text-sm bg-gray-100 px-2 py-1 rounded">{selectedProduct.specifications.partNumber}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Mô tả:</h4>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Tương thích:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.specifications.compatibility.map(model => (
                        <span key={model} className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    handleBookingClick(selectedProduct.name);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  📞 Liên Hệ Báo Giá
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    handleConsultationClick();
                  }}
                  className="flex-1 border border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                >
                  💬 Tư Vấn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedService=""
      />

      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
}
