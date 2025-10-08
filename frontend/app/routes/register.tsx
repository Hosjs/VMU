import type { Route } from "./+types/register";
import { useState } from "react";
import { CompanyLogo } from "~/components/Logo";
import { PhoneIcon } from "~/components/Icons";
import { useNavigateWithTransition, usePageTransition } from "~/components/LoadingSystem";
import { useAuth } from "~/contexts/AuthContext";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Đăng Ký - AutoCare Pro" },
        { name: "description", content: "Đăng ký tài khoản AutoCare Pro" },
    ];
}

export default function Register() {
    const navigateWithTransition = useNavigateWithTransition();
    const { isTransitioning } = usePageTransition();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        if (formData.password.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        if (!formData.acceptTerms) {
            setError("Vui lòng đồng ý với điều khoản sử dụng");
            return;
        }

        try {
            // Gọi API register thật
            await register({
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.confirmPassword,
                phone: formData.phone,
            });

            // Register thành công, chuyển đến dashboard
            navigateWithTransition("/dashboard", {
                transitionType: 'preloader',
                animationType: 'slide'
            });
        } catch (err: any) {
            // Hiển thị lỗi từ API
            setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image/Info */}
            <div className="hidden lg:block relative flex-1">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url("/images/2.png")' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-600/90"></div>
                </div>

                <div className="relative h-full flex flex-col justify-center px-12 text-white">
                    <h2 className="text-4xl font-bold mb-6">
                        Tham gia cùng AutoCare Pro
                    </h2>
                    <p className="text-xl mb-8 leading-relaxed">
                        Đăng ký ngay để trải nghiệm dịch vụ quản lý gara chuyên nghiệp:
                    </p>

                    <ul className="space-y-4">
                        <li className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-lg">Miễn phí dùng thử 30 ngày</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-lg">Hỗ trợ 24/7</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-lg">Cập nhật tính năng liên tục</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-lg">Bảo mật dữ liệu tuyệt đối</span>
                        </li>
                    </ul>

                    <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <p className="text-sm text-purple-100 mb-2">Liên hệ tư vấn</p>
                        <div className="flex items-center space-x-2">
                            <PhoneIcon size={20} color="#ffffff" />
                            <span className="text-xl font-bold">0123 456 789</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-md w-full space-y-8">
                    {/* Logo and Title */}
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <CompanyLogo size="lg" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Đăng Ký Tài Khoản
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Tạo tài khoản để bắt đầu sử dụng
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Register Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    disabled={isTransitioning}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={isTransitioning}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    placeholder="example@email.com"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={isTransitioning}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    placeholder="0123456789"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={isTransitioning}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    disabled={isTransitioning}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Accept Terms */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    type="checkbox"
                                    checked={formData.acceptTerms}
                                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                                    disabled={isTransitioning}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="acceptTerms" className="text-gray-700">
                                    Tôi đồng ý với{" "}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // TODO: Implement terms modal
                                            console.log('Terms clicked');
                                        }}
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        điều khoản sử dụng
                                    </button>{" "}
                                    và{" "}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // TODO: Implement privacy modal
                                            console.log('Privacy clicked');
                                        }}
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        chính sách bảo mật
                                    </button>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isTransitioning}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isTransitioning ? "Đang xử lý..." : "Đăng Ký"}
                        </button>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Đã có tài khoản?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigateWithTransition('/login', {
                                        transitionType: 'preloader',
                                        animationType: 'slide'
                                    })}
                                    disabled={isTransitioning}
                                    className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                                >
                                    Đăng nhập ngay
                                </button>
                            </p>
                        </div>
                    </form>

                    {/* Back to Home */}
                    <div className="text-center">
                        <button
                            onClick={() => navigateWithTransition('/', {
                                transitionType: 'preloader',
                                animationType: 'fade'
                            })}
                            disabled={isTransitioning}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
