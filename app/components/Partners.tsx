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
      name: "Castrol Vietnam",
      logo: "🛢️",
      category: "Dầu nhớt cao cấp",
      description: "Thương hiệu dầu nhớt hàng đầu thế giới với công nghệ Titanium FST tiên tiến",
      website: "castrol.com.vn",
      established: "1899",
      products: ["Dầu nhớt động cơ", "Dầu hộp số", "Dầu phanh", "Phụ gia động cơ"],
      highlight: "Công nghệ Titanium FST - Bảo vệ động cơ vượt trội"
    },
    {
      id: 2,
      name: "Hyundai Mobis",
      logo: "🚗",
      category: "Phụ tùng chính hãng",
      description: "Nhà cung cấp phụ tùng chính hãng cho tất cả dòng xe Hyundai và KIA",
      website: "mobis.hyundai.com",
      established: "1977",
      products: ["Đồ gầm chính hãng", "Đồ vỏ các loại", "Đồ máy xe con", "Phụ tùng từ 4-45 chỗ"],
      highlight: "Phụ tùng chính hãng cho xe từ 4 chỗ đến 45 chỗ"
    },
    {
      id: 3,
      name: "Mando Corporation",
      logo: "⚙️",
      category: "Hệ thống gầm & vỏ xe",
      description: "Chuyên gia hàng đầu về đồ gầm, đồ vỏ và đồ máy cho mọi loại xe từ 4-45 chỗ",
      website: "mando.com",
      established: "1962",
      products: ["Giảm xóc", "Hệ thống lái", "Phanh ABS", "Cảm biến xe"],
      highlight: "Công nghệ Hàn Quốc - Chuyên về đồ gầm, vỏ, máy các loại xe"
    },
    {
      id: 4,
      name: "Koyo Bearings Hải Phòng",
      logo: "⚡",
      category: "Vòng bi chính hãng",
      description: "Đại lý cấp 1 tại Hải Phòng về vòng bi chính hãng Koyo - Thương hiệu Nhật Bản",
      website: "koyo.co.jp",
      established: "1921",
      products: ["Vòng bi bánh xe", "Vòng bi động cơ", "Vòng bi hộp số", "Vòng bi công nghiệp"],
      highlight: "Đại lý cấp 1 tại Hải Phòng - Vòng bi chính hãng Nhật Bản"
    },
    {
      id: 5,
      name: "Valeo Vietnam",
      logo: "🔧",
      category: "Hệ thống ly hợp & phanh",
      description: "Chuyên gia về bàn ép, lá côn và các hệ thống truyền động",
      website: "valeo.com",
      established: "1923",
      products: ["Bàn ép ly hợp", "Lá côn", "Hệ thống làm mát", "Đèn pha LED"],
      highlight: "Công nghệ Pháp - Chuyên về bàn ép, lá côn chất lượng cao"
    },
    {
      id: 6,
      name: "Bosch Vietnam",
      logo: "🛠️",
      category: "Phụ tùng đa ngành",
      description: "Thương hiệu Đức hàng đầu về gạt mưa, má phanh, bugi và các sản phẩm ô tô",
      website: "bosch.com.vn",
      established: "1886",
      products: ["Gạt mưa", "Má phanh", "Bugi", "Cảm biến", "Hệ thống phun xăng"],
      highlight: "Made in Germany - Gạt mưa, má phanh, bugi chính hãng"
    },
    {
      id: 7,
      name: "Mahle Filter Systems",
      logo: "🔍",
      category: "Hệ thống lọc & bugi",
      description: "Chuyên gia về lọc động cơ, lọc điều hòa, bugi và má phanh chất lượng cao",
      website: "mahle.com",
      established: "1920",
      products: ["Lọc động cơ", "Lọc điều hòa", "Bugi cao cấp", "Má phanh", "Piston"],
      highlight: "Công nghệ Đức - Lọc động cơ, điều hòa, bugi, má phanh"
    },
    {
      id: 8,
      name: "Phụ Tùng Ô Tô Việt Nga",
      logo: "🏪",
      category: "Nhà phân phối phụ tùng",
      description: "Đối tác chiến lược cung cấp phụ tùng chính hãng với mạng lưới rộng khắp",
      website: "phuтungviетnga.com",
      established: "2010",
      products: ["Phụ tùng đa hãng", "Dầu nhớt", "Lốp xe", "Ắc quy", "Phụ kiện ô tô"],
      highlight: "⭐ ĐỐI TÁC CHIẾN LƯỢC - Nhà phân phối phụ tùng uy tín"
    },
    {
      id: 9,
      name: "DBV Insurance",
      logo: "🛡️",
      category: "Bảo hiểm ô tô",
      description: "Đơn vị bảo hiểm uy tín chuyên cung cấp bảo hiểm TNDS và Vật chất cho ô tô",
      website: "dbv.com.vn",
      established: "2008",
      products: ["TNDS bắt buộc", "TNDS tự nguyện", "Bảo hiểm vật chất", "Bảo hiểm người"],
      highlight: "⭐ ĐỐI TÁC BẢO HIỂM CHÍNH - Đơn vị bảo hiểm uy tín"
    },
    {
      id: 10,
      name: "Mạng Lưới Gara Hải Phòng",
      logo: "🔗",
      category: "Hợp tác sửa chữa",
      description: "Mạng lưới hợp tác với các gara uy tín tại các phường: Hải An, Lê Chân, Hồng Bàng, Kiến An",
      website: "gara-haiphong.vn",
      established: "2015",
      products: ["Sửa chữa chuyên sâu", "Đại tu động cơ", "Sơn gò", "Bảo dưỡng"],
      highlight: "⭐ HỢP TÁC SĐỬA CHỮA - Gara uy tín lâu đời tại Hải Phòng"
    },
    {
      id: 11,
      name: "Toyota Motor Vietnam",
      logo: "🚘",
      category: "Xe ô tô & Phụ tùng",
      description: "Hãng xe hàng đầu Việt Nam với chất lượng và độ tin cậy cao",
      website: "toyota.com.vn",
      established: "1937",
      products: ["Xe con", "SUV", "Phụ tùng chính hãng", "Dịch vụ bảo dưỡng"],
      highlight: "Thương hiệu xe được tin dùng nhất Việt Nam"
    },
    {
      id: 12,
      name: "Nhiều Thương Hiệu Lớn Khác",
      logo: "🌟",
      category: "Đa thương hiệu",
      description: "Hợp tác với nhiều thương hiệu lớn khác để đảm bảo cung cấp đầy đủ các sản phẩm chất lượng",
      website: "partners.network",
      established: "2020",
      products: ["Phụ tùng đa hãng", "Dầu nhớt", "Lốp xe", "Phụ kiện", "Dịch vụ"],
      highlight: "Mạng lưới đối tác rộng khắp - Đảm bảo nguồn hàng ổn định"
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
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Đối tác tin cậy</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Hợp Tác Cùng
            <br /><span className="text-blue-600">Các Thương Hiệu Hàng Đầu</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Chúng tôi tự hào hợp tác cùng <strong className="text-blue-600">Castrol (Dầu nhớt)</strong>,
            <strong className="text-blue-600"> Hyundai Mobis</strong>, <strong className="text-blue-600">Mando (Đồ gầm, đồ vỏ, đồ máy)</strong>,
            <strong className="text-blue-600"> Koyo (Đại lý cấp 1 tại Hải Phòng về vòng bi)</strong>,
            <strong className="text-blue-600"> Valeo (Bàn ép, lá côn)</strong>,
            <strong className="text-blue-600"> Bosch (Gạt mưa, má phanh, bugi)</strong>,
            <strong className="text-blue-600"> Mahle (Lọc động cơ, điều hòa, bugi, má phanh)</strong>
            và nhiều thương hiệu lớn khác.
          </p>
        </div>

        {/* Main Partner Display */}
        <div
          className="bg-white/60 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl mb-12 border border-white/30"
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

        {/* Partner Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {partners.map((partner, index) => (
            <button
              key={partner.id}
              onClick={() => handlePartnerSelect(index)}
              className={`p-4 rounded-xl transition-all duration-300 backdrop-blur-sm border ${
                index === currentPartnerIndex
                  ? 'bg-blue-600/20 border-blue-400/50 shadow-lg scale-105'
                  : 'bg-white/40 border-white/30 hover:bg-white/60 hover:scale-105'
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
      </div>
    </section>
  );
}
