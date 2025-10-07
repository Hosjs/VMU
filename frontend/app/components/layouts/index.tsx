export { PublicHeader } from './PublicHeader';
export { PublicFooter } from './PublicFooter';
import React, { useState } from 'react';
import { CompanyLogo } from '../Logo';
import { PhoneIcon } from '../Icons';

interface PublicHeaderProps {
    onBookingClick?: () => void;
    onCallClick?: () => void;
}

export function PublicHeader({ onBookingClick, onCallClick }: PublicHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleCallClick = () => {
        if (onCallClick) {
            onCallClick();
        } else {
            window.open('tel:0123456789', '_self');
        }
    };

    const handleBookingClick = () => {
        setIsMobileMenuOpen(false);
        if (onBookingClick) {
            onBookingClick();
        }
    };

    return (
        <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-white/30">
            <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="hover:opacity-80 transition-opacity">
                        <CompanyLogo size="md" />
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-6">
                        <a href="/#services" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Dịch Vụ
                        </a>
                        <a href="/products" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Sản Phẩm
                        </a>
                        <a href="/#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Về Chúng Tôi
                        </a>
                        <a href="/#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Đánh Giá
                        </a>
                        <a href="/#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Liên Hệ
                        </a>
                    </nav>

                    {/* Phone Info - Desktop */}
                    <div className="hidden md:flex items-center space-x-3">
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Hotline 24/7</p>
                            <p className="text-lg font-bold text-blue-600">0123 456 789</p>
                        </div>
                        <PhoneIcon size={20} color="#3B82F6" />
                    </div>

                    {/* Mobile Menu Button + Phone */}
                    <div className="flex md:hidden items-center space-x-3">
                        <button
                            onClick={handleCallClick}
                            className="p-2 touch-friendly"
                            aria-label="Call us"
                        >
                            <PhoneIcon size={20} color="#3B82F6" />
                        </button>
                        <button
                            className="p-3 touch-friendly mobile-button rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-gray-200 animate-fade-in">
                        <nav className="flex flex-col space-y-4 pt-4">
                            <a
                                href="/#services"
                                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-gray-50 touch-friendly"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                🛠️ Dịch Vụ
                            </a>
                            <a
                                href="/products"
                                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-gray-50 touch-friendly"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                📦 Sản Phẩm
                            </a>
                            <a
                                href="/#about"
                                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-gray-50 touch-friendly"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                ℹ️ Về Chúng Tôi
                            </a>
                            <a
                                href="/#testimonials"
                                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-gray-50 touch-friendly"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                ⭐ Đánh Giá
                            </a>
                            <a
                                href="/#contact"
                                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-gray-50 touch-friendly"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                📞 Liên Hệ
                            </a>

                            {/* Mobile Quick Actions */}
                            <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={handleBookingClick}
                                    className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold touch-friendly mobile-button hover:bg-blue-700 transition-colors"
                                >
                                    📅 Đặt Lịch Ngay
                                </button>
                                <button
                                    onClick={handleCallClick}
                                    className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold touch-friendly mobile-button hover:bg-green-700 transition-colors"
                                >
                                    📞 Gọi: 0123 456 789
                                </button>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

