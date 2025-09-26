// Define service data structure without importing components
export interface ServiceData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: any; // Use any instead of React.ReactNode to avoid React dependency
  price: string;
  isSpecialService?: boolean;
  features: string[];
  bgColor: string;
  accentColor: string;
  details: {
    supportedBrands: string[];
    carTypes: string[];
    features: string[];
    warranty: string;
    duration: string;
    gallery: string[];
  };
}

export const MAIN_SERVICES: ServiceData[] = [
  {
    id: 1,
    title: "Hỗ Trợ Đăng Kiểm",
    subtitle: "Dịch vụ toàn diện từ A-Z",
    description: "Nhận xe, xếp hàng, đăng kiểm và giao trả xe tại nhà. Phục vụ tất cả các ngày trong tuần theo giờ hành chính.",
    icon: null,
    price: "Liên hệ",
    isSpecialService: true,
    features: [
      "Nhận xe tại nhà hoặc công ty",
      "Xếp hàng và thực hiện đăng kiểm",
      "Giao trả xe sau khi hoàn thành",
      "Phục vụ tất cả các ngày trong tuần",
      "Theo giờ hành chính (8:00-17:00)",
      "Hỗ trợ sửa chữa nếu xe không đạt"
    ],
    bgColor: "from-emerald-50 to-teal-100",
    accentColor: "#10B981",
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
    title: "Bảo Hiểm TNDS & Vật Chất",
    subtitle: "Đối tác chính thức DBV Insurance",
    description: "Cung cấp bảo hiểm Trách nhiệm Dân sự bắt buộc và Bảo hiểm Vật chất với mức phí cạnh tranh nhất thị trường thông qua đối tác chiến lược DBV Insurance.",
    icon: null,
    price: "Liên hệ",
    isSpecialService: true,
    features: [
      "🛡️ Đối tác chính thức DBV Insurance",
      "TNDS bắt buộc theo quy định",
      "TNDS tự nguyện mức bồi thường cao",
      "Bảo hiểm Vật chất (thân vỏ xe)",
      "Bảo hiểm người ngồi trên xe",
      "Hỗ trợ làm thủ tục bồi thường nhanh chóng"
    ],
    bgColor: "from-blue-50 to-indigo-100",
    accentColor: "#3B82F6",
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
        "🛡️ ĐỐI TÁC CHÍNH THỨC: DBV Insurance - Đơn vị bảo hiểm uy tín hàng đầu",
        "TNDS bắt buộc: bồi thường tối đa 150 triệu/người",
        "TNDS tự nguyện: mức bồi thường cao hơn tùy chọn",
        "Vật chất: bồi thường 100% khi mất trộm/hỏng toàn bộ",
        "Chi trả 80-100% chi phí sửa chữa khi tai nạn",
        "Cứu hộ 24/7 toàn quốc miễn phí"
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
    icon: null,
    price: "Liên hệ",
    isSpecialService: true,
    features: [
      "Sơn sửa theo tiêu chuẩn bảo hiểm",
      "Sử dụng sơn chính hãng",
      "Tháo lắp chuyên nghiệp",
      "Sơn phủ hoàn thiện",
      "Bàn giao xe như mới",
      "Bảo hành chất lượng sơn"
    ],
    bgColor: "from-purple-50 to-violet-100",
    accentColor: "#8B5CF6",
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
    subtitle: "Đối tác chiến lược Phụ Tùng Việt Nga",
    description: "Cung cấp phụ tùng chính hãng cho tất cả các hãng xe thông qua đối tác chiến lược Phụ Tùng Ô Tô Việt Nga với giá cạnh tranh, giao hàng nhanh, bảo hành chính thức.",
    icon: null,
    price: "Liên hệ",
    isSpecialService: false,
    features: [
      "🏪 Đối tác chiến lược Phụ Tùng Việt Nga",
      "Phụ tùng chính hãng 100%",
      "Giá cạnh tranh nhất thị trường",
      "Giao hàng tận nơi trong ngày",
      "Tư vấn lựa chọn phù hợp",
      "Hỗ trợ lắp đặt chuyên nghiệp"
    ],
    bgColor: "from-amber-50 to-yellow-100",
    accentColor: "#F59E0B",
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
        "🏪 ĐỐI TÁC CHIẾN LƯỢC: Phụ Tùng Ô Tô Việt Nga - Nhà phân phối uy tín",
        "Lọc dầu, lọc gió, lọc nhiên liệu các loại hãng",
        "Má phanh, đĩa phanh, dầu phanh chính hãng",
        "Lốp xe các thương hiệu nổi tiếng (Michelin, Bridgestone)",
        "Ắc quy, bugi, dây curoa chính hãng",
        "Đèn xe, gương xe, kính xe đầy đủ các loại"
      ],
      warranty: "6-24 tháng tùy sản phẩm",
      duration: "Giao hàng trong ngày hoặc 24h",
      gallery: []
    }
  },
  {
    id: 5,
    title: "Bảo Dưỡng Định Kỳ Các Cấp",
    subtitle: "Bảo dưỡng chuẩn nhà sản xuất",
    description: "Dịch vụ bảo dưỡng định kỳ theo chuẩn nhà sản xuất cho tất cả các cấp: 5.000km, 10.000km, 20.000km, 40.000km...",
    icon: null,
    price: "Liên hệ",
    isSpecialService: false,
    features: [
      "Bảo dưỡng cấp 1: 5.000-10.000km",
      "Bảo dưỡng cấp 2: 15.000-20.000km",
      "Bảo dưỡng cấp 3: 30.000-40.000km",
      "Bảo dưỡng cấp 4: 60.000km trở lên",
      "Sử dụng dầu nhớt chính hãng",
      "Kiểm tra tổng thể 56 hạng mục"
    ],
    bgColor: "from-green-50 to-emerald-100",
    accentColor: "#10B981",
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
        "Thay dầu động cơ + lọc dầu theo chuẩn nhà sản xuất",
        "Kiểm tra và bổ sung dầu các hệ thống (phanh, lái, làm mát)",
        "Thay lọc gió, lọc nhiên liệu theo chu kỳ quy định",
        "Kiểm tra hệ thống phanh và độ mòn lốp xe",
        "Test ắc quy và hệ thống điện toàn xe",
        "Vệ sinh động cơ và rửa xe miễn phí"
      ],
      warranty: "3-6 tháng hoặc 5.000-10.000km",
      duration: "2-4 giờ tùy cấp độ bảo dưỡng",
      gallery: []
    }
  },
  {
    id: 6,
    title: "Sửa Chữa Toàn Diện Ngoài Bảo Hiểm",
    subtitle: "Trung tâm sửa chữa chuyên nghiệp đa dịch vụ",
    description: "Trung tâm sửa chữa tổng thể với đầy đủ trang thiết bị hiện đại, đội ngũ thợ lành nghề, chuyên sửa chữa mọi hư hỏng từ động cơ đến thân vỏ.",
    icon: null,
    price: "Liên hệ",
    isSpecialService: false,
    features: [
      "🔧 Sửa chữa động cơ: Đại tu, sửa chữa piston, xilanh, trục khuỷu",
      "⚙️ Sửa chữa hộp số: Hộp số sàn, tự động, ly hợp, bán trục",
      "🔌 Sửa chữa hệ thống điện: Máy phát, ma tơ khởi động, đánh lửa",
      "❄️ Sửa chữa điều hòa: Nạp gas, thay lọc, sửa giàn lạnh",
      "🚗 Sửa chữa gầm xe: Thay thế cao su, bi rotuyn, cần góp",
      "🎨 Sơn gò thân xe: Chỉnh hình, sơn phủ, đánh bóng chuyên nghiệp"
    ],
    bgColor: "from-red-50 to-rose-100",
    accentColor: "#EF4444",
    details: {
      supportedBrands: [
        "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
        "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "Isuzu",
        "BMW", "Mercedes", "Audi", "Lexus", "Infiniti", "Volvo",
        "Peugeot", "Renault", "Fiat", "Tất cả các hãng xe"
      ],
      carTypes: [
        "Xe con 4-9 chỗ", "SUV/CUV các loại", "MPV 7-16 chỗ", "Pickup truck",
        "Xe tải nhẹ dưới 5T", "Xe sang", "Xe thể thao", "Xe cũ", "Xe độ",
        "Xe tai nạn", "Xe hybrid", "Xe chuyên dùng"
      ],
      features: [
        "🔧 SỬA CHỮA ĐỘNG CƠ: Đại tu động cơ, thay piston, xilanh, sửa trục khuỷu",
        "⚙️ SỬA CHỮA HỘP SỐ: Hộp số sàn/tự động, ly hợp, bán trục, cầu trước/sau",
        "🚘 SỬA CHỮA GẦM XE: Thay cao su cân bằng, bi rotuyn, cần góp, giảm xóc",
        "🔌 HỆ THỐNG ĐIỆN: Máy phát điện, ma tơ khởi động, hệ thống đánh lửa",
        "❄️ ĐIỀU HÒA Ô TÔ: Nạp gas R134a/R1234yf, thay lọc gió, sửa giàn lạnh",
        "🎨 SƠN GÒ CHUYÊN NGHIỆP: Chỉnh hình thân xe, sơn phủ hoàn thiện",
        "🛞 DỊCH VỤ LỐP XE: Vá vỏ không săm, thay lốp mới, cân bằng động",
        "🔍 CHẨN ĐOÁN LỖI: Máy scan đa hãng, kiểm tra 50+ hạng mục"
      ],
      warranty: "3-12 tháng tùy hạng mục sửa chữa",
      duration: "1-7 ngày tùy mức độ hư hỏng và phức tạp",
      gallery: []
    }
  }
];

// Helper functions
export const getServiceById = (id: number): ServiceData | undefined => {
  return MAIN_SERVICES.find(service => service.id === id);
};

export const getServiceByTitle = (title: string): ServiceData | undefined => {
  return MAIN_SERVICES.find(service => service.title === title);
};

export const getSpecialServices = (): ServiceData[] => {
  return MAIN_SERVICES.filter(service => service.isSpecialService);
};

export const getRegularServices = (): ServiceData[] => {
  return MAIN_SERVICES.filter(service => !service.isSpecialService);
};
