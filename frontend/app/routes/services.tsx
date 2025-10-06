import { Header } from '~/components/Header';

export default function Services() {
  const services = [
    {
      id: 1,
      name: 'Sửa chữa chung',
      description: 'Dịch vụ sửa chữa và khắc phục mọi sự cố xe ô tô',
      icon: '🔧',
      price: 'Từ 300,000đ',
      features: ['Kiểm tra tổng thể', 'Sửa chữa động cơ', 'Thay thế linh kiện'],
    },
    {
      id: 2,
      name: 'Bảo dưỡng định kỳ',
      description: 'Bảo dưỡng định kỳ theo hãng, giữ xe luôn trong tình trạng tốt nhất',
      icon: '⚙️',
      price: 'Từ 500,000đ',
      features: ['Thay dầu máy', 'Kiểm tra phanh', 'Vệ sinh động cơ'],
    },
    {
      id: 3,
      name: 'Sơn sửa xe',
      description: 'Dịch vụ sơn xe chuyên nghiệp, phục hồi vẻ đẹp ban đầu',
      icon: '🎨',
      price: 'Từ 2,000,000đ',
      features: ['Sơn toàn bộ', 'Sơn từng phần', 'Đánh bóng xe'],
    },
    {
      id: 4,
      name: 'Phụ tùng chính hãng',
      description: 'Cung cấp phụ tùng chính hãng cho mọi hãng xe',
      icon: '⚡',
      price: 'Liên hệ',
      features: ['Phụ tùng chính hãng', 'Bảo hành dài hạn', 'Giao hàng nhanh'],
    },
    {
      id: 5,
      name: 'Đăng kiểm xe',
      description: 'Hỗ trợ đăng kiểm xe nhanh chóng, tiết kiệm thời gian',
      icon: '📋',
      price: 'Từ 150,000đ',
      features: ['Đăng kiểm nhanh', 'Hỗ trợ giấy tờ', 'Tư vấn miễn phí'],
    },
    {
      id: 6,
      name: 'Bảo hiểm xe',
      description: 'Tư vấn và làm bảo hiểm xe ô tô uy tín',
      icon: '🛡️',
      price: 'Liên hệ',
      features: ['Nhiều gói bảo hiểm', 'Giải quyết bồi thường', 'Tư vấn chuyên nghiệp'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Dịch vụ của chúng tôi</h1>
            <p className="text-xl text-blue-100">
              Đa dạng dịch vụ chăm sóc xe chuyên nghiệp với đội ngũ kỹ thuật viên giàu kinh nghiệm
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                  Đặt lịch ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cần tư vấn về dịch vụ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Liên hệ với chúng tôi để được tư vấn miễn phí
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="tel:0987654321" className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold">
              📞 0987 654 321
            </a>
            <a href="/contact" className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 transition font-semibold">
              Liên hệ ngay
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

