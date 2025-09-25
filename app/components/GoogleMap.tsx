import React from 'react';

export function GoogleMap() {
  return (
    <div className="w-full h-full bg-gray-200 rounded-xl overflow-hidden shadow-lg">
      {/* Google Maps Embed */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.325718071891!2d106.6844411!3d10.7829159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1c06f4e1dd%3A0x43900f1d4539a3d!2sGara%20%C3%94%20T%C3%B4!5e0!3m2!1svi!2s!4v1695000000000!5m2!1svi!2s"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Vị trí Gara Ô Tô ABC"
      ></iframe>

      {/* Overlay Info */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🚗</span>
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Gara Ô Tô ABC</h4>
            <p className="text-sm text-gray-600">Chuyên nghiệp - Uy tín</p>
          </div>
        </div>
        <div className="space-y-1 text-sm text-gray-700">
          <p>📍 123 Đường ABC, Quận XYZ, TP.HCM</p>
          <p>📞 0123 456 789</p>
          <p>🕒 8:00 - 18:00 (Thứ 2 - CN)</p>
        </div>
        <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          Chỉ đường
        </button>
      </div>
    </div>
  );
}

export function LocationSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-gray-800 mb-4">Vị Trí Gara</h3>
          <p className="text-xl text-gray-600">Dễ dàng tìm đến và thuận tiện di chuyển</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2 h-96 relative">
            <GoogleMap />
          </div>

          {/* Location Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h4 className="text-2xl font-bold text-gray-800 mb-4">Thông Tin Liên Hệ</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Địa chỉ</h5>
                    <p className="text-gray-600">123 Đường ABC, Phường XYZ, Quận 1, TP.HCM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🚌</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Phương tiện công cộng</h5>
                    <p className="text-gray-600">Bus: 01, 05, 19, 42<br/>Metro: Ga Bến Thành (500m)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🅿️</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Bãi đỗ xe</h5>
                    <p className="text-gray-600">Miễn phí cho khách hàng<br/>Có mái che, bảo vệ 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Giờ Hoạt Động</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Thứ 2 - Thứ 6:</span>
                  <span className="font-semibold text-gray-800">8:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thứ 7:</span>
                  <span className="font-semibold text-gray-800">8:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chủ nhật:</span>
                  <span className="font-semibold text-gray-800">9:00 - 16:00</span>
                </div>
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between">
                    <span className="text-red-600">Cấp cứu 24/7:</span>
                    <span className="font-bold text-red-600">0987 654 321</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
