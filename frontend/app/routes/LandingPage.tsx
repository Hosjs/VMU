import type { Route } from "./+types/LandingPage";
import { useNavigateWithTransition } from "~/components/LoadingSystem";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Viện Sau Đại học - Trường Đại học Hàng hải Việt Nam" },
        { name: "description", content: "Hệ thống quản lý đào tạo sau đại học hiện đại, chuyên nghiệp của Trường Đại học Hàng hải Việt Nam" },
    ];
}

export default function LandingPage() {
    const navigateWithTransition = useNavigateWithTransition();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Header */}
            <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <img
                                src="/images/vmu-bg.jpg"
                                alt="VMU Logo"
                                className="h-10 w-10 rounded-full"
                            />
                            <div className="hidden md:block">
                                <h1 className="font-bold text-gray-900 text-lg">VMU</h1>
                                <p className="text-xs text-gray-600">Viện Sau Đại học</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Tính năng</a>
                            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">Về chúng tôi</a>
                            <a href="#programs" className="text-gray-700 hover:text-blue-600 transition-colors">Chương trình</a>
                            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Liên hệ</a>
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <button
                                onClick={() => navigateWithTransition('/login', {
                                    transitionType: 'preloader',
                                    animationType: 'fade'
                                })}
                                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Đăng nhập
                            </button>
                            <button
                                onClick={() => navigateWithTransition('/register', {
                                    transitionType: 'preloader',
                                    animationType: 'fade'
                                })}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all transform hover:scale-105"
                            >
                                Đăng ký
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-200">
                            <div className="flex flex-col space-y-4">
                                <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Tính năng</a>
                                <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">Về chúng tôi</a>
                                <a href="#programs" className="text-gray-700 hover:text-blue-600 transition-colors">Chương trình</a>
                                <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Liên hệ</a>
                                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => navigateWithTransition('/login', {
                                            transitionType: 'preloader',
                                            animationType: 'fade'
                                        })}
                                        className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
                                    >
                                        Đăng nhập
                                    </button>
                                    <button
                                        onClick={() => navigateWithTransition('/register', {
                                            transitionType: 'preloader',
                                            animationType: 'fade'
                                        })}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all"
                                    >
                                        Đăng ký
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Hệ Thống Quản Lý
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Đào Tạo Sau Đại học
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                                Giải pháp quản lý đào tạo toàn diện, hiện đại và chuyên nghiệp cho Viện Sau Đại học - Trường Đại học Hàng hải Việt Nam
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={() => navigateWithTransition('/register', {
                                        transitionType: 'preloader',
                                        animationType: 'fade'
                                    })}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    Bắt đầu ngay
                                </button>
                                <button
                                    onClick={() => {
                                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-all"
                                >
                                    Tìm hiểu thêm
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative z-10">
                                <img
                                    src="/images/vmu-hero.jpg"
                                    alt="VMU Campus"
                                    className="rounded-2xl shadow-2xl"
                                    onError={(e) => {
                                        e.currentTarget.src = "data:image/svg+xml,%3Csvg width='600' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='600' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%236b7280' text-anchor='middle' dy='.3em'%3EVMU Campus%3C/text%3E%3C/svg%3E";
                                    }}
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl -z-0 opacity-20"></div>
                            <div className="absolute -top-6 -left-6 w-72 h-72 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-2xl -z-0 opacity-20"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1000+</div>
                            <div className="text-gray-600">Sinh viên</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">200+</div>
                            <div className="text-gray-600">Giảng viên</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">50+</div>
                            <div className="text-gray-600">Chương trình đào tạo</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">15+</div>
                            <div className="text-gray-600">Năm kinh nghiệm</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Tính Năng Nổi Bật
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Hệ thống quản lý toàn diện với đầy đủ tính năng hiện đại
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Quản lý Sinh viên</h3>
                            <p className="text-gray-600">
                                Quản lý thông tin sinh viên, theo dõi quá trình học tập và kết quả đào tạo một cách dễ dàng
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Quản lý Giảng viên</h3>
                            <p className="text-gray-600">
                                Quản lý phân công giảng dạy, theo dõi lịch trình và tính toán lương giảng viên tự động
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Quản lý Học phần</h3>
                            <p className="text-gray-600">
                                Quản lý môn học, lớp học, thời khóa biểu và điểm số một cách khoa học và hiệu quả
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Lịch học linh hoạt</h3>
                            <p className="text-gray-600">
                                Xem lịch học, lịch thi và nhận thông báo tự động về các sự kiện quan trọng
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Báo cáo & Thống kê</h3>
                            <p className="text-gray-600">
                                Báo cáo chi tiết với biểu đồ trực quan giúp phân tích và đưa ra quyết định chính xác
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Bảo mật cao</h3>
                            <p className="text-gray-600">
                                Hệ thống bảo mật đa lớp với phân quyền chi tiết đảm bảo an toàn dữ liệu tuyệt đối
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Về Viện Sau Đại học VMU
                            </h2>
                            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                                Viện Sau Đại học - Trường Đại học Hàng hải Việt Nam là đơn vị đào tạo sau đại học uy tín,
                                chất lượng cao trong lĩnh vực hàng hải và các ngành liên quan.
                            </p>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Với đội ngũ giảng viên giàu kinh nghiệm, cơ sở vật chất hiện đại và phương pháp đào tạo
                                tiên tiến, chúng tôi cam kết mang đến chất lượng đào tạo xuất sắc cho học viên.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="text-gray-700">Chương trình đào tạo được chuẩn hóa theo tiêu chuẩn quốc tế</p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="text-gray-700">Đội ngũ giảng viên có trình độ cao, giàu kinh nghiệm thực tiễn</p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="text-gray-700">Cơ sở vật chất, trang thiết bị học tập hiện đại</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="/images/vmu-about.jpg"
                                alt="About VMU"
                                className="rounded-2xl shadow-xl"
                                onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml,%3Csvg width='600' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='600' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%236b7280' text-anchor='middle' dy='.3em'%3EAbout VMU%3C/text%3E%3C/svg%3E";
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section id="programs" className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Chương Trình Đào Tạo
                        </h2>
                        <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                            Đa dạng các chương trình đào tạo chất lượng cao
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Program 1 */}
                        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
                            <div className="text-4xl mb-4">🎓</div>
                            <h3 className="text-2xl font-bold mb-3">Thạc sĩ</h3>
                            <p className="text-blue-100 mb-4">
                                Các chương trình thạc sĩ chuyên sâu trong lĩnh vực hàng hải, logistics và các ngành liên quan
                            </p>
                            <ul className="space-y-2 text-blue-100">
                                <li className="flex items-center">
                                    <span className="mr-2">•</span>
                                    Thời gian: 2 năm
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">•</span>
                                    Hình thức: Tập trung & Vừa học vừa làm
                                </li>
                            </ul>
                        </div>

                        {/* Program 2 */}
                        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
                            <div className="text-4xl mb-4">🔬</div>
                            <h3 className="text-2xl font-bold mb-3">Tiến sĩ</h3>
                            <p className="text-blue-100 mb-4">
                                Chương trình tiến sĩ với nghiên cứu chuyên sâu và ứng dụng thực tiễn cao
                            </p>
                            <ul className="space-y-2 text-blue-100">
                                <li className="flex items-center">
                                    <span className="mr-2">•</span>
                                    Thời gian: 3-4 năm
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">•</span>
                                    Hình thức: Tập trung & Không tập trung
                                </li>
                            </ul>
                        </div>

                        {/* Program 3 */}
                        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
                            <div className="text-4xl mb-4">📚</div>
                            <h3 className="text-2xl font-bold mb-3">Chương trình ngắn hạn</h3>
                            <p className="text-blue-100 mb-4">
                                Các khóa đào tạo ngắn hạn, bồi dưỡng chuyên môn và nâng cao kỹ năng
                            </p>
                            <ul className="space-y-2 text-blue-100">
                                <li className="flex items-center">
                                    <span className="mr-2">•</span>
                                    Thời gian: Linh hoạt
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">•</span>
                                    Hình thức: Online & Offline
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Học Viên Nói Gì Về Chúng Tôi
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Những chia sẻ chân thành từ học viên
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="bg-white p-8 rounded-xl shadow-md">
                            <div className="flex items-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-gray-600 mb-4 italic">
                                "Chương trình đào tạo chất lượng cao, giảng viên nhiệt tình. Hệ thống quản lý rất tiện lợi và dễ sử dụng."
                            </p>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    NV
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-gray-900">Nguyễn Văn A</h4>
                                    <p className="text-sm text-gray-600">Thạc sĩ K21</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="bg-white p-8 rounded-xl shadow-md">
                            <div className="flex items-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-gray-600 mb-4 italic">
                                "Môi trường học tập chuyên nghiệp, cơ sở vật chất hiện đại. Rất hài lòng với chất lượng đào tạo."
                            </p>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                    TH
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-gray-900">Trần Thị B</h4>
                                    <p className="text-sm text-gray-600">Tiến sĩ K20</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="bg-white p-8 rounded-xl shadow-md">
                            <div className="flex items-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-gray-600 mb-4 italic">
                                "Hệ thống quản lý thông minh, tra cứu thông tin nhanh chóng. Tiết kiệm rất nhiều thời gian."
                            </p>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                                    LM
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-gray-900">Lê Minh C</h4>
                                    <p className="text-sm text-gray-600">Thạc sĩ K22</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Sẵn sàng bắt đầu hành trình học tập?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Đăng ký ngay hôm nay để trải nghiệm hệ thống quản lý đào tạo hiện đại
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigateWithTransition('/register', {
                                transitionType: 'preloader',
                                animationType: 'fade'
                            })}
                            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium transition-all transform hover:scale-105 shadow-lg"
                        >
                            Đăng ký miễn phí
                        </button>
                        <button
                            onClick={() => navigateWithTransition('/login', {
                                transitionType: 'preloader',
                                animationType: 'fade'
                            })}
                            className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 font-medium transition-all"
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Liên Hệ Với Chúng Tôi
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các thông tin dưới đây.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Địa chỉ</h3>
                                        <p className="text-gray-600">
                                            484 Lạch Tray, Lê Chân, Hải Phòng
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Điện thoại</h3>
                                        <p className="text-gray-600">
                                            +84 225 3842 468
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                                        <p className="text-gray-600">
                                            info@vmu.edu.vn
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Giờ làm việc</h3>
                                        <p className="text-gray-600">
                                            Thứ 2 - Thứ 6: 8:00 - 17:00<br />
                                            Thứ 7: 8:00 - 12:00
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Gửi tin nhắn</h3>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="example@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0123456789"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nội dung
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập nội dung tin nhắn..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all"
                                >
                                    Gửi tin nhắn
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <img
                                    src="/images/vmu-bg.jpg"
                                    alt="VMU Logo"
                                    className="h-10 w-10 rounded-full"
                                />
                                <div>
                                    <h3 className="font-bold text-lg">VMU</h3>
                                    <p className="text-sm text-gray-400">Viện Sau Đại học</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Trường Đại học Hàng hải Việt Nam
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4">Liên kết nhanh</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#features" className="hover:text-white transition-colors">Tính năng</a></li>
                                <li><a href="#about" className="hover:text-white transition-colors">Về chúng tôi</a></li>
                                <li><a href="#programs" className="hover:text-white transition-colors">Chương trình</a></li>
                                <li><a href="#contact" className="hover:text-white transition-colors">Liên hệ</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4">Hỗ trợ</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn sử dụng</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4">Kết nối với chúng tôi</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                        <p>&copy; 2025 Viện Sau Đại học - Trường Đại học Hàng hải Việt Nam. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

