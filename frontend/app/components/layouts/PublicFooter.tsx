import React from 'react';
import { CompanyLogo } from '../Logo';
import { LocationIcon, PhoneIcon } from '../Icons';

export function PublicFooter() {
    return (
        <footer className="py-12 relative">
            <div className="absolute inset-0 bg-gray-800/90 backdrop-blur-md"></div>

            <div className="container mx-auto px-6 relative z-10 text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="mb-4">
                            <CompanyLogo size="md" />
                        </div>
                        <p className="text-gray-400 mb-4">
                            Đối tác tin cậy cho mọi nhu cầu về xe ô tô của bạn với 6 dịch vụ chuyên nghiệp.
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h5 className="text-lg font-bold mb-4">Liên Hệ</h5>
                        <div className="space-y-2 text-gray-400">
                            <div className="flex items-center space-x-2">
                                <LocationIcon size={16} color="#9CA3AF" />
                                <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <PhoneIcon size={16} color="#9CA3AF" />
                                <span>0123 456 789</span>
                            </div>
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div>
                        <h5 className="text-lg font-bold mb-4">Giờ Làm Việc</h5>
                        <div className="text-gray-400">
                            <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                            <p>Thứ 7 - Chủ nhật: 8:00 - 17:00</p>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 AutoCare Pro. Tất cả quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
}

