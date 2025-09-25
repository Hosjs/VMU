import React, { useState, useMemo } from 'react';

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
    image: "/api/placeholder/300/200",
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
    carBrands: ["Toyota", "Honda", "Nissan", "Mitsubishi"],
    carTypes: ["Sedan", "SUV", "Hatchback"],
    category: "Động Cơ",
    price: "450.000đ",
    originalPrice: "520.000đ",
    discount: 13,
    inStock: true,
    image: "/api/placeholder/300/200",
    warranty: "24 tháng",
    description: "Bugi Iridium chính hãng NGK với tuổi thọ cao",
    specifications: {
      partNumber: "BKR6EIX",
      compatibility: ["Toyota Altis", "Honda Civic", "Nissan Sunny"],
      material: "Iridium electrode",
      origin: "Nhật Bản"
    }
  },
  // Brake Parts - Brembo
  {
    id: 3,
    name: "Má Phanh Trước Brembo",
    brand: "Brembo",
    supplier: "Brembo Asia Pacific",
    carBrands: ["BMW", "Mercedes-Benz", "Audi"],
    carTypes: ["Sedan", "SUV", "Coupe"],
    category: "Hệ Thống Phanh",
    price: "2.850.000đ",
    originalPrice: "3.200.000đ",
    discount: 11,
    inStock: true,
    image: "/api/placeholder/300/200",
    warranty: "24 tháng",
    description: "Má phanh Brembo cao cấp cho xe sang Châu Âu",
    specifications: {
      partNumber: "P 06 037",
      compatibility: ["BMW 3 Series", "Mercedes C-Class", "Audi A4"],
      material: "Ceramic compound",
      origin: "Ý"
    }
  },
  {
    id: 4,
    name: "Đĩa Phanh Brembo Ventilated",
    brand: "Brembo",
    supplier: "Brembo Asia Pacific",
    carBrands: ["BMW", "Mercedes-Benz", "Volkswagen"],
    carTypes: ["Sedan", "SUV"],
    category: "Hệ Thống Phanh",
    price: "3.450.000đ",
    inStock: true,
    image: "/api/placeholder/300/200",
    warranty: "36 tháng",
    description: "Đĩa phanh thông gió Brembo cho hiệu suất phanh tối ưu",
    specifications: {
      partNumber: "09.C398.11",
      compatibility: ["BMW X3", "Mercedes GLC", "VW Tiguan"],
      material: "Cast iron ventilated",
      origin: "Ý"
    }
  },
  // Tires - Michelin
  {
    id: 5,
    name: "Lốp Michelin Primacy 4",
    brand: "Michelin",
    supplier: "Michelin Vietnam",
    carBrands: ["Toyota", "Honda", "Hyundai", "KIA"],
    carTypes: ["Sedan", "Hatchback"],
    category: "Lốp Xe",
    price: "2.450.000đ",
    inStock: true,
    image: "/api/placeholder/300/200",
    warranty: "60.000km hoặc 5 năm",
    description: "Lốp cao su Michelin với công nghệ EverGrip",
    specifications: {
      partNumber: "205/55R16 91V",
      compatibility: ["Toyota Altis", "Honda Civic", "Hyundai Elantra"],
      material: "Cao su silica",
      origin: "Thái Lan"
    }
  },
  {
    id: 6,
    name: "Lốp Michelin Pilot Sport 4",
    brand: "Michelin",
    supplier: "Michelin Vietnam",
    carBrands: ["BMW", "Mercedes-Benz", "Audi"],
    carTypes: ["Sedan", "Coupe", "SUV"],
    category: "Lốp Xe",
    price: "4.850.000đ",
    originalPrice: "5.200.000đ",
    discount: 7,
    inStock: true,
    image: "/api/placeholder/300/200",
    warranty: "80.000km hoặc 6 năm",
    description: "Lốp thể thao cao cấp Michelin cho xe sang",
    specifications: {
      partNumber: "225/40R18 92Y",
      compatibility: ["BMW 3 Series", "Mercedes C-Class", "Audi A4"],
      material: "High-performance compound",
      origin: "Pháp"
    }
  },
  // Battery - GS Battery
  {
    id: 7,
    name: "Ắc Quy GS Astra",
    brand: "GS Battery",
    supplier: "GS Battery Vietnam",
    carBrands: ["Toyota", "Honda", "Mitsubishi", "Suzuki"],
    carTypes: ["Sedan", "SUV", "MPV"],
    category: "Hệ Thống Điện",
    price: "1.850.000đ",
    originalPrice: "2.100.000đ",
    discount: 12,
    inStock: true,
    image: "/api/placeholder/300/200",
    warranty: "18 tháng",
    description: "Ắc quy khô GS với công nghệ Calcium+",
    specifications: {
      partNumber: "NS60L 12V-45Ah",
      compatibility: ["Toyota Vios", "Honda City", "Mitsubishi Attrage"],
      material: "Lead Calcium",
      origin: "Indonesia"
    }
  },
  {
    id: 8,
    name: "Ắc Quy GS Premium",
    brand: "GS Battery",
    supplier: "GS Battery Vietnam",
    carBrands: ["BMW", "Mercedes-Benz", "Lexus"],
    carTypes: ["Sedan", "SUV"],
    category: "Hệ Thống Điện",
    price: "3.250.000đ",
    inStock: true,
    image: "/api/placeholder/300/200",
    warranty: "24 tháng",
    description: "Ắc quy cao cấp cho xe sang với công nghệ AGM",
    specifications: {
      partNumber: "AGM70 12V-70Ah",
      compatibility: ["BMW 5 Series", "Mercedes E-Class", "Lexus ES"],
      material: "AGM Technology",
      origin: "Hàn Quốc"
    }
  },
  // Suspension - KYB
  {
    id: 9,
    name: "Amortisseur KYB Gas-A-Just",
    brand: "KYB",
    supplier: "KYB Manufacturing",
    carBrands: ["Toyota", "Honda", "Nissan", "Mazda"],
    carTypes: ["Sedan", "SUV", "Pickup"],
    category: "Hệ Thống Treo",
    price: "1.650.000đ",
    inStock: true,
    image: "/api/placeholder/300/200",
    warranty: "24 tháng",
    description: "Amortisseur khí nén KYB chính hãng Nhật Bản",
    specifications: {
      partNumber: "KG5434",
      compatibility: ["Toyota Fortuner", "Honda CR-V", "Nissan X-Trail"],
      material: "Steel with gas pressure",
      origin: "Nhật Bản"
    }
  },
  {
    id: 10,
    name: "Lò Xo Treo KYB",
    brand: "KYB",
    supplier: "KYB Manufacturing",
    carBrands: ["Toyota", "Honda", "Mazda"],
    carTypes: ["Sedan", "Hatchback"],
    category: "Hệ Thống Treo",
    price: "890.000đ",
    originalPrice: "1.050.000đ",
    discount: 15,
    inStock: true,
    image: "/api/placeholder/300/200",
    warranty: "18 tháng",
    description: "Lò xo treo chính hãng KYB với độ bền cao",
    specifications: {
      partNumber: "RH2749",
      compatibility: ["Toyota Vios", "Honda City", "Mazda2"],
      material: "High tensile steel",
      origin: "Thái Lan"
    }
  },
  // Engine Oil - Castrol
  {
    id: 11,
    name: "Dầu Nhớt Castrol GTX 10W-40",
    brand: "Castrol",
    supplier: "BP Castrol Vietnam",
    carBrands: ["Tất cả các hãng"],
    carTypes: ["Sedan", "SUV", "Pickup", "Hatchback"],
    category: "Dầu Nhớt",
    price: "485.000đ",
    originalPrice: "550.000đ",
    discount: 12,
    inStock: true,
    image: "/api/placeholder/300/200",
    warranty: "12 tháng",
    description: "Dầu nhớt bán tổng hợp Castrol GTX bảo vệ động cơ tối ưu",
    specifications: {
      partNumber: "GTX 10W-40 4L",
      compatibility: ["Mọi loại xe xăng"],
      material: "Semi-synthetic",
      origin: "Malaysia"
    }
  },
  {
    id: 12,
    name: "Dầu Nhớt Castrol Edge 0W-20",
    brand: "Castrol",
    supplier: "BP Castrol Vietnam",
    carBrands: ["Toyota", "Honda", "Lexus", "Acura"],
    carTypes: ["Sedan", "SUV", "Hybrid"],
    category: "Dầu Nhớt",
    price: "1.250.000đ",
    inStock: true,
    image: "/api/placeholder/300/200",
    warranty: "15 tháng",
    description: "Dầu nhớt toàn tổng hợp cao cấp cho xe hybrid",
    specifications: {
      partNumber: "EDGE 0W-20 4L",
      compatibility: ["Toyota Camry Hybrid", "Honda Accord Hybrid"],
      material: "Full synthetic",
      origin: "Bỉ"
    }
  }
];

const categories = ["Tất cả", "Động Cơ", "Hệ Thống Phanh", "Lốp Xe", "Hệ Thống Điện", "Hệ Thống Treo", "Dầu Nhớt"];
const suppliers = ["Tất cả", "Bosch Vietnam", "Brembo Asia Pacific", "Michelin Vietnam", "GS Battery Vietnam", "KYB Manufacturing", "BP Castrol Vietnam"];
const carBrands = ["Tất cả", "Toyota", "Honda", "Mazda", "Ford", "BMW", "Mercedes-Benz", "Audi", "Hyundai", "KIA", "Mitsubishi", "Suzuki", "Nissan"];

interface ProductsListProps {
  className?: string;
}

export default function ProductsList({ className = "" }: ProductsListProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedSupplier, setSelectedSupplier] = useState("Tất cả");
  const [selectedCarBrand, setSelectedCarBrand] = useState("Tất cả");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === "Tất cả" || product.category === selectedCategory;
      const matchesSupplier = selectedSupplier === "Tất cả" || product.supplier === selectedSupplier;
      const matchesCarBrand = selectedCarBrand === "Tất cả" || product.carBrands.includes(selectedCarBrand) || product.carBrands.includes("Tất cả các hãng");
      const matchesSearch = searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSupplier && matchesCarBrand && matchesSearch;
    });
  }, [selectedCategory, selectedSupplier, selectedCarBrand, searchTerm]);

  return (
    <section id="products" className={`py-20 bg-white ${className}`}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-gray-800 mb-4">Phụ Tùng Chính Hãng</h3>
          <p className="text-xl text-gray-600">Đa dạng phụ tùng từ các nhà cung cấp uy tín hàng đầu thế giới</p>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm kiếm phụ tùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Supplier Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhà cung cấp</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>

            {/* Car Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hãng xe</label>
              <select
                value={selectedCarBrand}
                onChange={(e) => setSelectedCarBrand(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                {carBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== "Tất cả" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Danh mục: {selectedCategory}
                <button onClick={() => setSelectedCategory("Tất cả")} className="ml-2 text-blue-600 hover:text-blue-800">×</button>
              </span>
            )}
            {selectedSupplier !== "Tất cả" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Nhà cung cấp: {selectedSupplier}
                <button onClick={() => setSelectedSupplier("Tất cả")} className="ml-2 text-green-600 hover:text-green-800">×</button>
              </span>
            )}
            {selectedCarBrand !== "Tất cả" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Hãng xe: {selectedCarBrand}
                <button onClick={() => setSelectedCarBrand("Tất cả")} className="ml-2 text-purple-600 hover:text-purple-800">×</button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                Tìm kiếm: "{searchTerm}"
                <button onClick={() => setSearchTerm("")} className="ml-2 text-orange-600 hover:text-orange-800">×</button>
              </span>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Hiển thị <span className="font-semibold">{filteredProducts.length}</span> sản phẩm từ tổng số <span className="font-semibold">{products.length}</span> sản phẩm
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105 border border-gray-100">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                        <rect width="300" height="200" fill="#f3f4f6"/>
                        <text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-size="14">${product.name}</text>
                      </svg>
                    `)}`;
                  }}
                />
                {product.discount && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                    -{product.discount}%
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold">Hết hàng</span>
                  </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                  {product.category}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1">{product.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                    product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Thương hiệu:</span>
                    <span className="font-semibold text-blue-600">{product.brand}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Nhà cung cấp:</span>
                    <span className="font-semibold text-gray-700 text-xs">{product.supplier}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bảo hành:</span>
                    <span className="font-semibold text-green-600">{product.warranty}</span>
                  </div>
                </div>

                {/* Compatible Car Brands */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Tương thích:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.carBrands.slice(0, 3).map(brand => (
                      <span key={brand} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {brand}
                      </span>
                    ))}
                    {product.carBrands.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{product.carBrands.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-blue-600">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h4 className="text-2xl font-bold text-gray-600 mb-2">Không tìm thấy sản phẩm</h4>
            <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={() => {
                setSelectedCategory("Tất cả");
                setSelectedSupplier("Tất cả");
                setSelectedCarBrand("Tất cả");
                setSearchTerm("");
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}

// Product Detail Modal Component
interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mr-3">
                  {product.category}
                </span>
                {product.discount && (
                  <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Thương hiệu: <strong className="text-blue-600">{product.brand}</strong></span>
                <span>•</span>
                <span>Nhà cung cấp: <strong>{product.supplier}</strong></span>
                <span className={`px-3 py-1 rounded-full font-semibold ${
                  product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="h-80 bg-gray-200 rounded-xl overflow-hidden shadow-inner">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                      <svg width="400" height="320" xmlns="http://www.w3.org/2000/svg">
                        <rect width="400" height="320" fill="#f3f4f6"/>
                        <text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-size="16">${product.name}</text>
                      </svg>
                    `)}`;
                  }}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Price */}
              <div className="border-b pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-4xl font-bold text-blue-600">{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">{product.originalPrice}</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-bold rounded">
                        -{product.discount}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Thông số kỹ thuật
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mã phụ tùng:</span>
                    <span className="font-semibold">{product.specifications.partNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chất liệu:</span>
                    <span className="font-semibold">{product.specifications.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Xuất xứ:</span>
                    <span className="font-semibold">{product.specifications.origin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bảo hành:</span>
                    <span className="font-semibold text-green-600">{product.warranty}</span>
                  </div>
                </div>
              </div>

              {/* Compatibility */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Xe tương thích
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.specifications.compatibility.map(car => (
                    <span key={car} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {car}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-4 mb-6">
                  <label className="text-gray-700 font-semibold">Số lượng:</label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 rounded-l-lg"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-l border-r">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Tổng: <span className="font-bold text-blue-600">
                      {(parseInt(product.price.replace(/[đ,.]/g, '')) * quantity).toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    disabled={!product.inStock}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                      product.inStock 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                    </svg>
                    {product.inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                  </button>
                  <button className="flex-1 border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    Liên hệ tư vấn
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
