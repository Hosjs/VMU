import type { Route } from "./+types/products";
import { useState, useEffect } from "react";
import { CompanyLogo } from "~/components/Logo";
import { LocationIcon, PhoneIcon } from "~/components/Icons";
import { BookingModal } from "~/components/BookingModal";
import { ConsultationModal } from "~/components/ConsultationModal";
import { SkeletonLoader } from "~/components/Loading";
import { usePageTransition } from "~/components/PageTransition";
import { ImagePreloader } from "~/components/ImagePreloader";
import { useImagePreloader } from "~/hooks/useImagePreloader";

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
            partNumber: "P 06 033",
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
        carBrands: ["Toyota", "Honda", "Ford"],
        carTypes: ["Sedan", "SUV", "Hatchback"],
        category: "Phanh",
        price: "980.000đ",
        inStock: true,
        image: "⚙️",
        warranty: "24 tháng",
        description: "Đĩa phanh Brembo Xtra với độ bền vượt trội",
        specifications: {
            partNumber: "09.C341.11",
            compatibility: ["Honda Accord", "Toyota Camry"],
            material: "Cast iron G3000",
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
        price: "3.200.000đ",
        originalPrice: "3.600.000đ",
        discount: 11,
        inStock: true,
        image: "🛞",
        warranty: "36 tháng",
        description: "Lốp Michelin Primacy 4 - An toàn ướt vượt trội",
        specifications: {
            partNumber: "215/60R16 95H",
            compatibility: ["Honda Civic", "Toyota Altis"],
            material: "Compound silica",
            origin: "Pháp"
        }
    },
    // Battery - GS Battery
    {
        id: 6,
        name: "Ắc Quy GS Astra Premium",
        brand: "GS Battery",
        supplier: "GS Battery Vietnam",
        carBrands: ["Toyota", "Honda", "Mazda", "Ford"],
        carTypes: ["Sedan", "SUV", "Hatchback"],
        category: "Điện",
        price: "1.850.000đ",
        inStock: true,
        image: "🔋",
        warranty: "24 tháng",
        description: "Ắc quy GS Astra Premium với công nghệ Nhật Bản",
        specifications: {
            partNumber: "N50ZL (60Ah)",
            compatibility: ["Honda City", "Toyota Vios"],
            material: "Lead Calcium",
            origin: "Nhật Bản"
        }
    }
];

const categories = ["Tất cả", "Động Cơ", "Phanh", "Lốp Xe", "Điện"];
const suppliers = ["Tất cả", "Bosch Vietnam", "Brembo Asia Pacific", "Michelin Vietnam", "GS Battery Vietnam"];
const brands = ["Tất cả", "Toyota", "Honda", "BMW", "Mercedes", "Ford", "Mazda"];

export default function Products() {
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const [selectedSupplier, setSelectedSupplier] = useState("Tất cả");
    const [selectedBrand, setSelectedBrand] = useState("Tất cả");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isConsultationOpen, setIsConsultationOpen] = useState(false);
    const [selectedProductForBooking, setSelectedProductForBooking] = useState('');

    const { setTransitionType } = usePageTransition();

    // Danh sách tất cả ảnh cần preload cho trang products
    const imagesToPreload = [
        '/images/3.png',           // Hero background
        '/images/logo.png',        // Logo
        '/images/background-app.png', // Background app
    ];

    // Preload images
    const { imagesLoaded, loadingProgress, loadedCount, totalImages } = useImagePreloader(imagesToPreload);

    const filteredProducts = products.filter((product) => {
        const matchesCategory = selectedCategory === "Tất cả" || product.category === selectedCategory;
        const matchesSupplier = selectedSupplier === "Tất cả" || product.supplier === selectedSupplier;
        const matchesBrand = selectedBrand === "Tất cả" || product.carBrands.includes(selectedBrand);
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSupplier && matchesBrand && matchesSearch;
    });

    const handleQuoteRequest = (productName: string) => {
        setSelectedProductForBooking(productName);
        setIsBookingOpen(true);
    };

    const handleContactSeller = (productName: string) => {
        setSelectedProductForBooking(productName);
        setIsConsultationOpen(true);
    };

    const handleCallClick = () => {
        window.open('tel:0123456789', '_self');
    };

    const handleWhatsAppClick = () => {
        const message = encodeURIComponent('Xin chào! Tôi muốn tư vấn về sản phẩm phụ tùng ô tô.');
        window.open(`https://wa.me/84123456789?text=${message}`, '_blank');
    };

    const handleHomeNavigation = () => {
        setTransitionType('car');
        window.location.href = '/';
    };

    // Show preloader until images are loaded
    if (!imagesLoaded) {
        return (
            <ImagePreloader
                progress={loadingProgress}
                loadedCount={loadedCount}
                totalImages={totalImages}
            />
        );
    }

    return (
        <div className="min-h-screen relative">
            {/* Header with animation */}
            <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-white/30 slide-in-right">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <CompanyLogo />
                        <div className="hidden md:flex space-x-6">
                            <button
                                onClick={handleHomeNavigation}
                                className="text-gray-700 hover:text-blue-600 transition-colors font-medium btn-hover"
                            >
                                Trang Chủ
                            </button>
                            <a href="/#services" className="text-gray-700 hover:text-blue-600 transition-colors font-medium btn-hover">Dịch Vụ</a>
                            <a href="/products" className="text-blue-600 font-semibold">Sản Phẩm</a>
                            <a href="/#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium btn-hover">Liên Hệ</a>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm text-gray-600">Hotline 24/7</p>
                                <p className="text-lg font-bold text-blue-600">0123 456 789</p>
                            </div>
                            <PhoneIcon size={20} color="#3B82F6" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section with animations */}
            <section className="py-16 text-center relative">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url("/images/3.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />

                {/* Overlay để text dễ đọc */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <h1 className="text-5xl font-bold text-gray-800 mb-4 slide-in-left drop-shadow-lg">
                        Sản Phẩm & <span className="text-blue-600">Phụ Tùng</span>
                    </h1>
                    <p className="text-xl text-gray-800 mb-8 max-w-3xl mx-auto slide-in-right drop-shadow">
                        Phụ tùng ô tô chính hãng từ các nhà cung cấp uy tín với chất lượng đảm bảo
                    </p>

                    {/* Search Bar với nền trong suốt */}
                    <div className="max-w-2xl mx-auto mb-8 slide-up">
                        <div className="relative bg-white/80 backdrop-blur-md rounded-full p-2 shadow-xl">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-6 py-4 text-lg border-0 bg-transparent rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors btn-hover">
                                🔍
                            </button>
                        </div>
                    </div>

                    {/* Filters với nền glassmorphism */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 stagger-item"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            className="px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 stagger-item"
                        >
                            {suppliers.map(supplier => (
                                <option key={supplier} value={supplier}>{supplier}</option>
                            ))}
                        </select>

                        <select
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            className="px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 stagger-item"
                        >
                            {brands.map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>

                    {/* Results Count với nền */}
                    <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 inline-block shadow-lg">
                        <p className="text-gray-700 mb-0 slide-up font-semibold">
                            Tìm thấy <span className="font-bold text-blue-600">{filteredProducts.length}</span> sản phẩm
                        </p>
                    </div>
                </div>
            </section>

            {/* Products Grid with stagger animations */}
            <section className="pb-20 relative">
                {/* Background riêng cho products grid - giảm opacity */}
                <div className="absolute inset-0 bg-white/75 backdrop-blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 to-blue-50/30"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product, index) => (
                            <div key={product.id} className={`bg-white/85 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden card-hover stagger-item border border-white/30`}>
                                {/* Product Image with hover effect */}
                                <div className="h-48 bg-gradient-to-br from-blue-50/70 to-indigo-100/70 flex items-center justify-center text-6xl transition-transform duration-300 hover:scale-110">
                                    {product.image}
                                </div>

                                <div className="p-6">
                                    {/* Category & Stock Status */}
                                    <div className="flex justify-between items-center mb-3">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                      {product.category}
                    </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            product.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                      {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                                    </div>

                                    {/* Product Name */}
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>

                                    {/* Brand & Supplier */}
                                    <div className="text-sm text-gray-600 mb-3">
                                        <p>Thương hiệu: <span className="font-semibold">{product.brand}</span></p>
                                        <p>Nhà cung cấp: <span className="font-semibold">{product.supplier}</span></p>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                                        {product.description}
                                    </p>

                                    {/* Compatible Brands */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-2">Hỗ trợ hãng xe:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {product.carBrands.slice(0, 3).map((brand, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          {brand}
                        </span>
                                            ))}
                                            {product.carBrands.length > 3 && (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          +{product.carBrands.length - 3}
                        </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                                            {product.originalPrice && (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                                                    {product.discount && (
                                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                              -{product.discount}%
                            </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Warranty */}
                                    <div className="text-sm text-gray-600 mb-4">
                                        <span className="font-semibold">Bảo hành:</span> {product.warranty}
                                    </div>

                                    {/* Actions with improved animations */}
                                    <div className="flex space-x-2 mb-3">
                                        <button
                                            onClick={() => setSelectedProduct(product)}
                                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm btn-hover"
                                        >
                                            Chi Tiết
                                        </button>
                                        <button
                                            onClick={() => handleQuoteRequest(product.name)}
                                            className="flex-1 border-2 border-blue-600 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-sm btn-hover"
                                        >
                                            Báo Giá
                                        </button>
                                    </div>

                                    {/* Additional Actions with fab-style animation */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleContactSeller(product.name)}
                                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm flex items-center justify-center space-x-1 fab"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                            </svg>
                                            <span>Chat</span>
                                        </button>
                                        <button
                                            onClick={handleCallClick}
                                            className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm flex items-center justify-center space-x-1 fab"
                                        >
                                            <PhoneIcon size={16} color="currentColor" />
                                            <span>Gọi</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty state with animation */}
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-16 scale-in">
                            <div className="text-6xl mb-4 animate-bounce">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
                            <p className="text-gray-600">Vui lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Product Detail Modal với glassmorphism */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white/85 backdrop-blur-md rounded-2xl max-w-2xl w-full my-auto shadow-2xl modal-enter border border-white/30">
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedProduct.name}</h2>
                                    <p className="text-blue-600 text-xl font-semibold">{selectedProduct.price}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-gray-500 hover:text-gray-700 text-3xl btn-hover"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Product Image */}
                            <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-6xl mb-6 rounded-lg">
                                {selectedProduct.image}
                            </div>

                            {/* Product Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-2">Thông tin sản phẩm</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-semibold">Thương hiệu:</span> {selectedProduct.brand}</p>
                                        <p><span className="font-semibold">Nhà cung cấp:</span> {selectedProduct.supplier}</p>
                                        <p><span className="font-semibold">Danh mục:</span> {selectedProduct.category}</p>
                                        <p><span className="font-semibold">Bảo hành:</span> {selectedProduct.warranty}</p>
                                        <p><span className="font-semibold">Tình trạng:</span>
                                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                                selectedProduct.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                        {selectedProduct.inStock ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-2">Thông số kỹ thuật</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-semibold">Mã sản phẩm:</span> {selectedProduct.specifications.partNumber}</p>
                                        <p><span className="font-semibold">Chất liệu:</span> {selectedProduct.specifications.material}</p>
                                        <p><span className="font-semibold">Xuất xứ:</span> {selectedProduct.specifications.origin}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-800 mb-2">Mô tả</h4>
                                <p className="text-gray-600">{selectedProduct.description}</p>
                            </div>

                            {/* Compatible Cars */}
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-800 mb-2">Tương thích với</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.carBrands.map((brand, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                      {brand}
                    </span>
                                    ))}
                                </div>
                            </div>

                            {/* Compatibility Details */}
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-800 mb-2">Chi tiết tương thích</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.specifications.compatibility.map((model, index) => (
                                        <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {model}
                    </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        setSelectedProduct(null);
                                        handleQuoteRequest(selectedProduct.name);
                                    }}
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold btn-hover"
                                >
                                    Liên Hệ Báo Giá
                                </button>
                                <button
                                    onClick={handleCallClick}
                                    className="flex-1 border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors font-semibold btn-hover"
                                >
                                    Gọi Tư Vấn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
                <button
                    onClick={handleWhatsAppClick}
                    className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center fab"
                    title="Chat WhatsApp"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.694"/>
                    </svg>
                </button>

                <button
                    onClick={handleCallClick}
                    className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center fab"
                    title="Gọi điện"
                >
                    <PhoneIcon size={24} color="currentColor" />
                </button>
            </div>

            {/* Modals */}
            <div className={isBookingOpen ? "modal-enter" : ""}>
                <BookingModal
                    isOpen={isBookingOpen}
                    onClose={() => setIsBookingOpen(false)}
                    selectedService={selectedProductForBooking}
                />
            </div>

            <div className={isConsultationOpen ? "modal-enter" : ""}>
                <ConsultationModal
                    isOpen={isConsultationOpen}
                    onClose={() => setIsConsultationOpen(false)}
                />
            </div>

            {/* Footer */}
            <footer className="py-12 relative">
                <div className="absolute inset-0 bg-gray-800/90 backdrop-blur-md"></div>

                <div className="container mx-auto px-6 relative z-10 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <CompanyLogo />
                            <p className="text-gray-400 mb-4 mt-4">Đối tác tin cậy cho mọi nhu cầu phụ tùng ô tô của bạn.</p>
                        </div>
                        <div>
                            <h5 className="text-lg font-bold mb-4">Liên Hệ</h5>
                            <div className="space-y-2 text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <LocationIcon size={16} color="#9CA3AF" />
                                    <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <PhoneIcon size={16} color="#9CA3AF" />
                                    <span>0123 456 789</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h5 className="text-lg font-bold mb-4">Giờ Làm Việc</h5>
                            <div className="text-gray-400">
                                <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                                <p>Thứ 7 - Chủ nhật: 8:00 - 17:00</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 AutoCare Pro. Tất cả quyền được bảo lưu.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}