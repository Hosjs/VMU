import { Link } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { Header } from '~/components/Header';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Dịch vụ chăm sóc xe
              <br />
              <span className="text-yellow-400">chuyên nghiệp</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Thắng Trường - Trung tâm dịch vụ ô tô uy tín với hơn 10 năm kinh nghiệm
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/services"
                className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-300 transition shadow-lg"
              >
                Xem dịch vụ
              </Link>
              <Link
                to="/booking"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
              >
                Đặt lịch ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Message for Logged In Users */}
      {isAuthenticated && user && (
        <section className="bg-white border-b border-gray-200 py-6">
          <div className="container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Xin chào, {user.name}!
                  </h2>
                  <p className="text-sm text-gray-600">
                    Vai trò: <span className="font-medium">{user.role?.display_name}</span>
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Vào hệ thống
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Dịch vụ của chúng tôi</h2>
            <p className="text-gray-600 text-lg">Đa dạng dịch vụ chăm sóc xe chuyên nghiệp</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 group">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                  <span className="text-3xl group-hover:scale-110 transition">{service.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <Link
                  to={`/services/${service.id}`}
                  className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center gap-2"
                >
                  Xem chi tiết
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-y border-gray-200">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng trải nghiệm dịch vụ chất lượng?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Đặt lịch ngay hôm nay và nhận ưu đãi đặc biệt
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {!isAuthenticated && (
              <Link
                to="/register"
                className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-300 transition shadow-lg"
              >
                Đăng ký ngay
              </Link>
            )}
            <Link
              to="/contact"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Thắng Trường</h3>
              <p className="text-sm">Trung tâm dịch vụ ô tô chuyên nghiệp</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Dịch vụ</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="hover:text-white">Sửa chữa</Link></li>
                <li><Link to="/services" className="hover:text-white">Bảo dưỡng</Link></li>
                <li><Link to="/services" className="hover:text-white">Phụ tùng</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Công ty</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">Về chúng tôi</Link></li>
                <li><Link to="/contact" className="hover:text-white">Liên hệ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 0987 654 321</li>
                <li>✉️ info@thangtruong.com</li>
                <li>📍 Hà Nội, Việt Nam</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 Thắng Trường. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const services = [
  {
    id: 1,
    name: 'Sửa chữa',
    description: 'Sửa chữa và khắc phục mọi sự cố xe',
    icon: '🔧',
  },
  {
    id: 2,
    name: 'Bảo dưỡng',
    description: 'Bảo dưỡng định kỳ chuyên nghiệp',
    icon: '⚙️',
  },
  {
    id: 3,
    name: 'Phụ tùng',
    description: 'Phụ tùng chính hãng, giá tốt',
    icon: '🛠️',
  },
  {
    id: 4,
    name: 'Đăng kiểm',
    description: 'Hỗ trợ đăng kiểm nhanh chóng',
    icon: '📋',
  },
];

const stats = [
  { value: '10+', label: 'Năm kinh nghiệm' },
  { value: '5000+', label: 'Khách hàng' },
  { value: '50+', label: 'Nhân viên' },
  { value: '24/7', label: 'Hỗ trợ' },
];

