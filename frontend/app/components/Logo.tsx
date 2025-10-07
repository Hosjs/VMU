import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'light' | 'dark';
    showSlogan?: boolean;
}

// Component Logo chính thức cho dự án
export function CompanyLogo({
    className = '',
    size = 'md',
    showSlogan = true
}: LogoProps) {
    const sizeClasses = {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-14'
    };

    const textSizeClasses = {
        sm: 'text-base',
        md: 'text-xl',
        lg: 'text-2xl'
    };

    const sloganSizeClasses = {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm'
    };

    return (
        <div className={`flex items-center space-x-2 sm:space-x-3 ${className}`}>
            {/* Logo Image */}
            <img
                src="/images/logo.png"
                alt="AutoCare Pro Logo"
                className={`${sizeClasses[size]} w-auto object-contain`}
                onError={(e) => {
                    // Fallback nếu logo không load được
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                }}
            />

            {/* Text Logo */}
            <div className="flex flex-col">
                <span className={`font-bold ${textSizeClasses[size]} text-gray-800 leading-tight`}>
                    AutoCare Pro
                </span>
                {showSlogan && (
                    <span className={`${sloganSizeClasses[size]} text-blue-600 font-medium leading-tight`}>
                        Dịch vụ khác biệt, trải nghiệm đỉnh cao
                    </span>
                )}
            </div>
        </div>
    );
}

// Export alias để tương thích
export default CompanyLogo;
