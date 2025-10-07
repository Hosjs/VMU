import type { Route } from "./+types/login";
import { useState } from "react";
import { CompanyLogo } from "~/components/Logo";
import { PhoneIcon } from "~/components/Icons";
import { useNavigateWithTransition } from "~/components/PageTransition";
import { LoadingSpinner } from "~/components/Loading";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Đăng Nhập - AutoCare Pro" },
        { name: "description", content: "Đăng nhập vào hệ thống quản lý AutoCare Pro" },
    ];
}

export default function Login() {
    const navigateWithTransition = useNavigateWithTransition();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // TODO: Implement actual login API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Navigate với preloader đẹp
            navigateWithTransition("/dashboard", { transitionType: 'preloader' });
        } catch (err) {
            setError("Email hoặc mật khẩu không đúng");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-md w-full space-y-8">
                    {/* Logo and Title */}
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <CompanyLogo size="lg" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Đăng Nhập
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Chào mừng bạn quay trở lại!
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
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
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="example@email.com"
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
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    checked={formData.remember}
                                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                        {/* Submit Button - SỬ DỤNG LoadingSpinner */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                "Đăng Nhập"
                            )}
                        </button>

                        {/* Register Link - SỬ DỤNG navigateWithTransition */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Chưa có tài khoản?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigateWithTransition('/register', { transitionType: 'preloader' })}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Đăng ký ngay
                                </button>
                            </p>
                        </div>
                    </form>

                    {/* Back to Home - SỬ DỤNG navigateWithTransition */}
                    <div className="text-center">
                        <button
                            onClick={() => navigateWithTransition('/', { transitionType: 'preloader' })}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Info */}
            <div className="hidden lg:block relative flex-1">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url("/images/1.png")' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-600/90"></div>
                </div>

                <div className="relative h-full flex flex-col justify-center px-12 text-white">
                    <h2 className="text-4xl font-bold mb-6">
                        Chào mừng đến với AutoCare Pro
                    </h2>
                    <p className="text-xl mb-8 leading-relaxed">
                        Hệ thống quản lý gara ô tô chuyên nghiệp với đầy đủ tính năng:
                    </p>

                    <ul className="space-y-4">
                        <li className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-lg">Quản lý khách hàng & xe</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-lg">Quản lý dịch vụ & đơn hàng</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-lg">Quản lý kho & phụ tùng</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-lg">Báo cáo & thống kê</span>
                        </li>
                    </ul>

                    <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <p className="text-sm text-blue-100 mb-2">Hotline hỗ trợ 24/7</p>
                        <div className="flex items-center space-x-2">
                            <PhoneIcon size={20} color="#ffffff" />
                            <span className="text-xl font-bold">0123 456 789</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
