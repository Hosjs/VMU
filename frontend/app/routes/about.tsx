import { Header } from '~/components/Header';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Về Thắng Trường</h1>
            <p className="text-xl text-blue-100">
              Trung tâm dịch vụ ô tô uy tín với hơn 10 năm kinh nghiệm
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
              <div className="prose prose-lg text-gray-600 space-y-4">
                <p>
                  Được thành lập từ năm 2014, Thắng Trường đã không ngừng phát triển và trở thành một trong những
                  trung tâm dịch vụ ô tô uy tín nhất tại Việt Nam. Với đội ngũ kỹ thuật viên giàu kinh nghiệm và
                  trang thiết bị hiện đại, chúng tôi cam kết mang đến cho khách hàng những dịch vụ tốt nhất.
                </p>
                <p>
                  Chúng tôi hiểu rằng chiếc xe không chỉ là phương tiện di chuyển mà còn là tài sản quý giá của
                  mỗi gia đình. Vì vậy, chúng tôi luôn đặt chất lượng dịch vụ và sự hài lòng của khách hàng lên
                  hàng đầu.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Chuyên nghiệp</h3>
                <p className="text-gray-600">Đội ngũ kỹ thuật viên được đào tạo bài bản</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Uy tín</h3>
                <p className="text-gray-600">Cam kết chất lượng và bảo hành dài hạn</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nhanh chóng</h3>
                <p className="text-gray-600">Thời gian xử lý nhanh, tiết kiệm thời gian</p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 md:p-12 text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">10+</div>
                  <div className="text-blue-100">Năm kinh nghiệm</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">5000+</div>
                  <div className="text-blue-100">Khách hàng</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">15+</div>
                  <div className="text-blue-100">Kỹ thuật viên</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">99%</div>
                  <div className="text-blue-100">Hài lòng</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

