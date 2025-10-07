// Format utilities
export const formatters = {
  // Format currency (VND)
  currency: (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  },

  // Format number with thousands separator
  number: (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  },

  // Format date
  date: (value: string | Date, format: 'short' | 'long' | 'full' = 'short'): string => {
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    switch (format) {
      case 'short':
        return date.toLocaleDateString('vi-VN');
      case 'long':
        return date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'full':
        return date.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      default:
        return date.toLocaleDateString('vi-VN');
    }
  },

  // Format datetime
  datetime: (value: string | Date): string => {
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Format time
  time: (value: string | Date): string => {
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Format phone number
  phone: (value: string): string => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.startsWith('84')) {
      // +84 format
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    } else {
      // 0xxx format
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
  },

  // Format license plate
  licensePlate: (value: string): string => {
    if (!value) return '';
    const cleaned = value.replace(/[^0-9A-Z]/g, '').toUpperCase();

    // Format: 30A-12345
    if (cleaned.length >= 5) {
      const prefix = cleaned.slice(0, 3);
      const suffix = cleaned.slice(3);
      return `${prefix}-${suffix}`;
    }
    return cleaned;
  },

  // Format percentage
  percentage: (value: number, decimals: number = 2): string => {
    if (isNaN(value)) return '0%';
    return `${value.toFixed(decimals)}%`;
  },

  // Format file size
  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Format duration (minutes to hours and minutes)
  duration: (minutes: number): string => {
    if (minutes < 60) return `${minutes} phút`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) return `${hours} giờ`;
    return `${hours} giờ ${mins} phút`;
  },

  // Truncate text
  truncate: (text: string, maxLength: number, suffix: string = '...'): string => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
  },

  // Capitalize first letter
  capitalize: (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Title case
  titleCase: (text: string): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  // Format arrays to string with separator
  arrayToString: (arr: string[], separator: string = ', '): string => {
    if (!arr || arr.length === 0) return '';
    return arr.join(separator);
  },

  // Parse string to array (from database format)
  stringToArray: (str: string, separator: string = '|'): string[] => {
    if (!str) return [];
    return str.split(separator).filter(item => item.trim());
  },

  // Format key-value pairs (from database format)
  parseKeyValue: (str: string, separator: string = '|'): Record<string, string> => {
    if (!str) return {};

    const pairs = str.split(separator);
    const result: Record<string, string> = {};

    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    });

    return result;
  },

  // Format relative time (time ago)
  timeAgo: (date: string | Date): string => {
    const past = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (seconds < 60) return 'vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} ngày trước`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} tháng trước`;
    return `${Math.floor(seconds / 31536000)} năm trước`;
  },

  // Format status badge text
  status: (status: string): string => {
    const statusMap: Record<string, string> = {
      // Order status
      'draft': 'Nháp',
      'quoted': 'Đã báo giá',
      'confirmed': 'Đã xác nhận',
      'in_progress': 'Đang xử lý',
      'completed': 'Hoàn thành',
      'delivered': 'Đã giao',
      'paid': 'Đã thanh toán',
      'cancelled': 'Đã hủy',

      // Payment status
      'pending': 'Chờ xử lý',
      'partial': 'Thanh toán 1 phần',
      'refunded': 'Đã hoàn tiền',

      // Provider status
      'active': 'Hoạt động',
      'inactive': 'Không hoạt động',
      'suspended': 'Tạm ngưng',
      'blacklisted': 'Danh sách đen',

      // Priority
      'low': 'Thấp',
      'normal': 'Bình thường',
      'high': 'Cao',
      'urgent': 'Khẩn cấp',
    };

    return statusMap[status] || status;
  },
};

