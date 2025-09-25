import React, { useState, useEffect } from 'react';

interface Partner {
  id: number;
  name: string;
  logo: string;
  category: string;
  description: string;
  website: string;
  established: string;
  products: string[];
  highlight: string;
}

interface PartnersProps {
  className?: string;
}

export function Partners({ className = '' }: PartnersProps) {
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const partners: Partner[] = [
    {
      id: 1,
      name: "Bosch Vietnam",
      logo: "🔧",
      category: "Phụ tùng động cơ",
      description: "Nhà cung cấp hàng đầu về công nghệ và dịch vụ ô tô toàn cầu",
      website: "bosch.com.vn",
      established: "1886",
      products: ["Hệ thống phun nhiên liệu", "Bugi", "Lọc dầu", "Cảm biến"],
      highlight: "Công nghệ Đức - Chất lượng hàng đầu thế giới"
    },
    {
      id: 2,
      name: "Brembo Asia Pacific",
      logo: "🛑",
      category: "Hệ thống phanh",
      description: "Thương hiệu phanh hàng đầu thế giới, được tin dùng bởi các đội đua F1",
      website: "brembo.com",
      established: "1961",
      products: ["Má phanh", "Đĩa phanh", "Piston phanh", "Dầu phanh"],
      highlight: "Được sử dụng trong đua xe F1 và các xe thể thao cao cấp"
    },
    {
      id: 3,
      name: "Michelin Vietnam",
      logo: "🛞",
      category: "Lốp xe ô tô",
      description: "Nhà sản xuất lốp xe hàng đầu với công nghệ tiên tiến và độ bền cao",
      website: "michelin.com.vn",
      established: "1889",
      products: ["Lốp xe con", "Lốp SUV", "Lốp thương mại", "Lốp xe máy"],
      highlight: "Công nghệ EverGrip - An toàn vượt trội trong mọi điều kiện"
    },
    {
      id: 4,
      name: "GS Battery Vietnam",
      logo: "🔋",
      category: "Ắc quy ô tô",
      description: "Thương hiệu ắc quy số 1 Đông Nam Á với công nghệ Nhật Bản",
      website: "gs-battery.com.vn",
      established: "1985",
      products: ["Ắc quy khô", "Ắc quy nước", "Ắc quy AGM", "Ắc quy Gel"],
      highlight: "Công nghệ Nhật Bản - Tuổi thọ và hiệu năng vượt trội"
    },
    {
      id: 5,
      name: "Toyota Motor Vietnam",
      logo: "🚗",
      category: "Xe ô tô & Phụ tùng",
      description: "Hãng xe hàng đầu Việt Nam với chất lượng và độ tin cậy cao",
      website: "toyota.com.vn",
      established: "1937",
      products: ["Xe con", "SUV", "Phụ tùng chính hãng", "Dịch vụ bảo dưỡng"],
      highlight: "Thương hiệu xe được tin dùng nhất Việt Nam"
    },
    {
      id: 6,
      name: "Honda Vietnam",
      logo: "🏍️",
      category: "Xe ô tô & Xe máy",
      description: "Thương hiệu Nhật Bản với công nghệ động cơ tiên tiến và tiết kiệm nhiên liệu",
      website: "honda.com.vn",
      established: "1948",
      products: ["Xe ô tô", "Xe máy", "Phụ tùng Honda", "Dầu nhớt Honda"],
      highlight: "Công nghệ VTEC và i-VTEC tiên tiến"
    },
    {
      id: 7,
      name: "Castrol Vietnam",
      logo: "🛢️",
      category: "Dầu nhớt & Hóa chất",
      description: "Thương hiệu dầu nhớt hàng đầu thế giới với công thức GTX tiên tiến",
      website: "castrol.com.vn",
      established: "1899",
      products: ["Dầu nhớt động cơ", "Dầu hộp số", "Dầu phanh", "Phụ gia động cơ"],
      highlight: "Công thức Titanium FST - Bảo vệ động cơ tối ưu"
    },
    {
      id: 8,
      name: "3M Vietnam",
      logo: "✨",
      category: "Phim cách nhiệt & Bảo vệ",
      description: "Công nghệ bảo vệ và cải thiện xe hơi với các sản phẩm cao cấp",
      website: "3m.com.vn",
      established: "1902",
      products: ["Phim cách nhiệt", "Phim bảo vệ sơn", "Sản phẩm đánh bóng", "Băng keo chuyên dụng"],
      highlight: "Công nghệ nano ceramic - Cách nhiệt và UV vượt trội"
    }
  ];

  // Auto rotate partners every 4 seconds
  useEffect(() => {
    if (!isAutoPlay || isHovered) return;

    const interval = setInterval(() => {
      setCurrentPartnerIndex((prev) => (prev + 1) % partners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, partners.length]);

  const currentPartner = partners[currentPartnerIndex];

  const handlePartnerSelect = (index: number) => {
    setCurrentPartnerIndex(index);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <section className={`py-20 bg-gradient-to-br from-gray-50 to-blue-50 ${className}`}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Đối tác tin cậy</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Hợp Tác Cùng
            <br /><span className="text-blue-600">Các Thương Hiệu Hàng Đầu</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chúng tôi tự hào là đối tác của những thương hiệu uy tín hàng đầu thế giới,
            đảm bảo chất lượng sản phẩm và dịch vụ tốt nhất cho khách hàng.
          </p>
        </div>

        {/* Featured Partner Showcase */}
        <div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12 transition-all duration-500 hover:shadow-3xl"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Partner Info */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">{currentPartner.logo}</div>
                <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {currentPartner.category}
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                  {currentPartner.name}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  {currentPartner.description}
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-blue-800 font-semibold italic">
                    "{currentPartner.highlight}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Thành lập</p>
                  <p className="text-lg font-bold text-gray-800">{currentPartner.established}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Website</p>
                  <p className="text-lg font-bold text-blue-600">{currentPartner.website}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-3">Sản phẩm chính</p>
                <div className="flex flex-wrap gap-2">
                  {currentPartner.products.map((product, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Partner Visual */}
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-8 lg:p-12 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-9xl mb-6 transition-transform duration-500 ${isHovered ? 'scale-110 rotate-12' : ''}`}>
                  {currentPartner.logo}
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">{currentPartner.name}</h4>
                  <p className="text-gray-600">Đối tác chiến lược từ {currentPartner.established}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="bg-gray-100 h-1">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${((currentPartnerIndex + 1) / partners.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Partner Grid Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {partners.map((partner, index) => (
            <button
              key={partner.id}
              onClick={() => handlePartnerSelect(index)}
              className={`group p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                index === currentPartnerIndex
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="text-center">
                <div className={`text-3xl mb-2 transition-transform duration-300 group-hover:scale-110 ${
                  index === currentPartnerIndex ? 'animate-bounce' : ''
                }`}>
                  {partner.logo}
                </div>
                <p className={`text-xs font-semibold ${
                  index === currentPartnerIndex ? 'text-white' : 'text-gray-700'
                }`}>
                  {partner.name.split(' ')[0]}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isHovered 
                ? 'bg-orange-400 animate-pulse' 
                : isAutoPlay 
                  ? 'bg-green-400 animate-pulse' 
                  : 'bg-gray-300'
            }`}></div>
            <span>
              {isHovered ? 'Tạm dừng' : isAutoPlay ? 'Tự động chuyển đổi' : 'Thủ công'} •{' '}
              <span className="font-semibold text-blue-600">
                {currentPartnerIndex + 1}/{partners.length}
              </span>{' '}
              đối tác
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">{partners.length}+</div>
            <div className="text-gray-600 font-medium">Đối Tác Chiến Lược</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600 font-medium">Thương Hiệu</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-gray-600 font-medium">Chính Hãng</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600 font-medium">Hỗ Trợ</div>
          </div>
        </div>
      </div>
    </section>
  );
}
