// Define service data structure
export interface ServiceData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
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
    title: "Sơn Sửa Bảo Hiểm",
    subtitle: "Sơn phục hồi như xe mới",
    description: "Dịch vụ sơn sửa chuyên nghiệp với công nghệ hiện đại, phục hồi xe sau tai nạn về trạng thái như mới. Hỗ trợ làm thủ tục bảo hiểm.",
    icon: null,
    price: "Liên hệ",
    features: [
      "Sơn phục hồi hoàn toàn sau tai nạn",
      "Sử dụng sơn chính hãng",
      "Công nghệ sơn hiện đại",
      "Hỗ trợ làm thủ tục bảo hiểm",
      "Bảo hành sơn 2 năm",
      "Giao xe đúng hẹn"
    ],
    bgColor: "from-purple-50 to-violet-100",
    accentColor: "#8B5CF6",
    details: {
      supportedBrands: [
        "Tất cả các hãng xe", "Mercedes", "BMW", "Audi", "Lexus",
        "Toyota", "Honda", "Mazda", "Ford", "Hyundai"
      ],
      carTypes: [
        "Xe con cao cấp", "SUV/CUV", "Xe thể thao", "Xe sang",
        "Xe cổ điển", "Xe độ"
      ],
      features: [
        "Đánh bóng và làm mới toàn bộ xe",
        "Sơn chống trầy xước cao cấp",
        "Phục hồi màu sơn nguyên bản",
        "Xử lý chống rỉ sét chuyên nghiệp",
        "Bảo vệ sơn bằng nano coating",
        "Kiểm tra chất lượng nhiều lần"
      ],
      warranty: "2 năm bảo hành sơn",
      duration: "5-10 ngày làm việc",
      gallery: []
    }
  },
  {
    id: 4,
    title: "Phụ Tùng Ô Tô",
    subtitle: "Đối tác Phụ Tùng Việt Nga",
    description: "Cung cấp phụ tùng chính hãng cho tất cả các loại xe với giá cạnh tranh thông qua đối tác chiến lược Phụ Tùng Ô Tô Việt Nga và các thương hiệu uy tín khác.",
    icon: null,
    price: "Liên hệ",
    isSpecialService: true,
    features: [
      "🏪 Đối tác chính: Phụ Tùng Ô Tô Việt Nga",
      "🛢️ Castrol - Dầu nhớt cao cấp",
      "🚗 Hyundai Mobis - Phụ tùng gầm, vỏ, máy (4-45 chỗ)",
      "⚙️ Mando - Đồ gầm, đồ vỏ, đồ máy",
      "⚡ Koyo - Đại lý cấp 1 vòng bi chính hãng tại Hải Phòng",
      "🔧 Valeo - Bàn ép, lá côn chuyên nghiệp"
    ],
    bgColor: "from-amber-50 to-orange-100",
    accentColor: "#F59E0B",
    details: {
      supportedBrands: [
        "Castrol (Dầu nhớt)", "Hyundai Mobis", "Mando", "Koyo",
        "Valeo (Bàn ép, lá côn)", "Bosch (Gạt mưa, má phanh, bugi)",
        "Mahle (Lọc động cơ, lọc điều hòa, bugi, má phanh)", "Và nhiều thương hiệu khác"
      ],
      carTypes: [
        "Xe từ 4 chỗ đến 45 chỗ", "Xe con", "SUV/CUV", "MPV",
        "Xe tải nhẹ", "Xe khách", "Xe chuyên dùng"
      ],
      features: [
        "🏪 ĐỐI TÁC CHÍNH: Phụ Tùng Ô Tô Việt Nga - Nhà phân phối uy tín",
        "Phụ tùng chính hãng 100%",
        "Castrol: Dầu nhớt cao cấp với công nghệ tiên tiến",
        "Hyundai Mobis: Đồ gầm, vỏ, máy cho xe 4-45 chỗ",
        "Koyo: Đại lý cấp 1 vòng bi chính hãng tại Hải Phòng",
        "Bosch & Mahle: Gạt mưa, má phanh, bugi, lọc các loại"
      ],
      warranty: "6-24 tháng tùy loại phụ tùng",
      duration: "Giao hàng trong ngày",
      gallery: []
    }
  },
  {
    id: 5,
    title: "Bảo Dưỡng Định Kỳ",
    subtitle: "Bảo dưỡng chuẩn nhà sản xuất",
    description: "Dịch vụ bảo dưỡng định kỳ theo chuẩn nhà sản xuất với phụ tùng chính hãng, giúp xe vận hành ổn định và tiết kiệm nhiên liệu.",
    icon: null,
    price: "Liên hệ",
    features: [
      "Bảo dưỡng theo chuẩn nhà sản xuất",
      "Sử dụng phụ tùng và dầu nhớt chính hãng",
      "Kiểm tra toàn diện 50 hạng mục",
      "Cập nhật lịch bảo dưỡng tiếp theo",
      "Tư vấn tình trạng xe chi tiết",
      "Bảo hành dịch vụ 6 tháng"
    ],
    bgColor: "from-green-50 to-emerald-100",
    accentColor: "#10B981",
    details: {
      supportedBrands: [
        "Toyota", "Honda", "Mazda", "Ford", "Hyundai", "KIA",
        "Mitsubishi", "Nissan", "Chevrolet", "Suzuki", "Subaru"
      ],
      carTypes: [
        "Xe con các loại", "SUV/CUV", "MPV", "Pickup truck",
        "Xe hybrid", "Xe điện"
      ],
      features: [
        "Thay dầu động cơ và lọc dầu",
        "Kiểm tra và thay lọc gió, lọc nhiên liệu",
        "Kiểm tra hệ thống phanh và lốp xe",
        "Kiểm tra hệ thống điện và đèn",
        "Kiểm tra hệ thống làm mát và điều hòa",
        "Vệ sinh buồng đốt và kim phun"
      ],
      warranty: "6 tháng hoặc 10.000km",
      duration: "2-4 giờ",
      gallery: []
    }
  },
  {
    id: 6,
    title: "Sửa Chữa Ngoài Bảo Hiểm",
    subtitle: "Sửa chữa chuyên nghiệp toàn diện",
    description: "Dịch vụ sửa chữa chuyên nghiệp cho tất cả các hạng mục: Sửa chữa máy, gầm, điện, điều hòa và các hệ thống khác với đội ngũ thợ giàu kinh nghiệm.",
    icon: null,
    price: "Liên hệ",
    features: [
      "🔧 Sửa chữa động cơ và hộp số",
      "⚙️ Sửa chữa hệ thống gầm bệ",
      "⚡ Sửa chữa hệ thống điện",
      "❄️ Sửa chữa hệ thống điều hòa",
      "🛠️ Sửa chữa hệ thống phanh",
      "🔩 Và nhiều hạng mục khác"
    ],
    bgColor: "from-red-50 to-rose-100",
    accentColor: "#EF4444",
    details: {
      supportedBrands: [
        "Tất cả các hãng xe", "Xe Nhật", "Xe Hàn", "Xe Âu", "Xe Mỹ",
        "Xe cổ", "Xe độ", "Xe thương mại"
      ],
      carTypes: [
        "Xe con mọi loại", "SUV/CUV", "MPV", "Pickup truck",
        "Xe tải", "Xe khách", "Xe chuyên dùng"
      ],
      features: [
        "🔧 SỬA CHỮA ĐỘNG CƠ: Đại tu, sửa chữa các hỏng hóc",
        "⚙️ SỬA CHỮA GẦM BỆ: Thay thế giảm xóc, cầu trước/sau",
        "⚡ SỬA CHỮA HỆ THỐNG ĐIỆN: Máy phát, má từ, hệ thống đánh lửa",
        "❄️ SỬA CHỮA ĐIỀU HÒA: Block lạnh, dàn nóng, hệ thống gas",
        "🛠️ SỬA CHỮA PHANH: Má phanh, đĩa phanh, hệ thống phanh ABS",
        "🔩 HỢP TÁC với các Gara uy tín tại Hải Phòng (Hải An, Lê Chân, Hồng Bàng, Kiến An)"
      ],
      warranty: "3-12 tháng tùy hạng mục",
      duration: "1-7 ngày tùy mức độ",
      gallery: []
    }
  }
];

export function getServiceByTitle(title: string): ServiceData | undefined {
  return MAIN_SERVICES.find(service => service.title === title);
}

export function getServiceById(id: number): ServiceData | undefined {
  return MAIN_SERVICES.find(service => service.id === id);
}
