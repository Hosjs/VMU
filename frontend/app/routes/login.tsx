import type { Route } from "./+types/login";
import { useState } from "react";
import { CompanyLogo } from "~/components/Logo";
import { useNavigateWithTransition, usePageTransition } from "~/components/LoadingSystem";
import { useAuth } from "~/contexts/AuthContext";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Đăng Nhập - AutoCare Pro" },
        { name: "description", content: "Đăng nhập vào hệ thống quản lý AutoCare Pro" },
    ];
}

export default function Login() {
    const navigateWithTransition = useNavigateWithTransition();
    const { isTransitioning } = usePageTransition();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            // Gọi API login thật
            await login({
                email: formData.email,
                password: formData.password,
                remember: formData.remember
            });

            // Login thành công, redirect sẽ được xử lý bởi dashboard/_layout.tsx
            navigateWithTransition("/dashboard", {
                transitionType: 'preloader',
                animationType: 'fade'
            });
        } catch (err: any) {
            // Hiển thị lỗi từ API
            setError(err.message || "Email hoặc mật khẩu không đúng");
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
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-fade-in">
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
                                    disabled={isTransitioning}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                                    disabled={isTransitioning}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                                    disabled={isTransitioning}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            <div className="text-sm">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // TODO: Implement forgot password logic
                                        console.log('Forgot password clicked');
                                    }}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isTransitioning}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isTransitioning ? "Đang đăng nhập..." : "Đăng Nhập"}
                        </button>

                        {/* Register Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Chưa có tài khoản?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigateWithTransition('/register', {
                                        transitionType: 'preloader',
                                        animationType: 'slide'
                                    })}
                                    disabled={isTransitioning}
                                    className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                                >
                                    Đăng ký ngay
                                </button>
                            </p>
                        </div>
                    </form>

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

            {/* Right Side - Image/Branding */}
            <div className="hidden lg:block lg:flex-1 relative">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"
                    style={{
                        backgroundImage: 'url("/images/1.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-700/90" />
                </div>

                <div className="relative h-full flex items-center justify-center p-12">
                    <div className="text-center text-white max-w-md">
                        <h1 className="text-4xl font-bold mb-6">
                            Chào mừng đến với AutoCare Pro
                        </h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Hệ thống quản lý garage hiện đại và chuyên nghiệp
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Quản lý đơn hàng dễ dàng</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Theo dõi khách hàng hiệu quả</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Báo cáo thống kê chi tiết</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
