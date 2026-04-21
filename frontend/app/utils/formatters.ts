// Format utilities
type CourseCodeLike = {
  ma_khoa_hoc?: string | null;
  nam_hoc?: number | string | null;
  dot?: number | string | null;
};

const formatCourseCodeValue = (value?: string | null): string => {
  if (!value) return '';

  const parts = String(value).split('.').map(part => part.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return `${parts[0]}.${parts[2]}`;
  }
  if (parts.length === 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  return String(value).trim();
};

const extractCourseCodeParts = (course: CourseCodeLike): { year?: string; dot?: string } => {
  if (course.nam_hoc !== undefined && course.nam_hoc !== null && course.dot !== undefined && course.dot !== null) {
    return { year: String(course.nam_hoc), dot: String(course.dot) };
  }

  const raw = course.ma_khoa_hoc ? String(course.ma_khoa_hoc).trim() : '';
  if (!raw) return {};

  const parts = raw.split('.').map(part => part.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return { year: parts[0], dot: parts[2] };
  }
  if (parts.length === 2) {
    return { year: parts[0], dot: parts[1] };
  }
  return { year: parts[0] };
};

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

  // Format time from HH:MM:SS or datetime string to HH:MM
  formatTime: (value: string): string => {
    if (!value) return '';

    // If it's a full datetime string, parse it
    if (value.includes('T') || value.includes(' ')) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }

    return value.substring(0, 5);
  },

  // Format date from various formats
  formatDate: (value: string | Date): string => {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString('vi-VN');
  },

  // Format date for HTML input (YYYY-MM-DD)
  dateForInput: (value?: string | Date): string => {
    if (!value) return '';

    try {
      const date = typeof value === 'string' ? new Date(value) : value;
      if (isNaN(date.getTime())) return '';

      // Format as YYYY-MM-DD for HTML input type="date"
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
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

  licensePlate: (value: string): string => {
    if (!value) return '';
    return value.toUpperCase();
  },

  // Format percentage
  percentage: (value: number): string => {
    return `${value.toFixed(2)}%`;
  },

  // Format file size
  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
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

  // Format khóa/năm học code as YYYY.dot (drop học kỳ)
  courseCode: (course: string | CourseCodeLike): string => {
    if (typeof course === 'string') {
      return formatCourseCodeValue(course);
    }

    if (course.nam_hoc !== undefined && course.nam_hoc !== null && course.dot !== undefined && course.dot !== null) {
      return `${course.nam_hoc}.${course.dot}`;
    }

    return formatCourseCodeValue(course.ma_khoa_hoc);
  },

  // Human-friendly description for the course code
  courseCodeDetail: (course: CourseCodeLike): string => {
    const { year, dot } = extractCourseCodeParts(course);
    if (year === '' && dot === '') return '';
    if (year && dot) {
      return `Năm học ${year}, đợt ${dot}`;
    }
    if (year) {
      return `Năm học ${year}`;
    }
    return dot ? `Đợt ${dot}` : '';
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
  timeAgo: (value: string | Date): string => {
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) {
      return 'Vừa xong';
    } else if (diffMin < 60) {
      return `${diffMin} phút trước`;
    } else if (diffHour < 24) {
      return `${diffHour} giờ trước`;
    } else if (diffDay < 7) {
      return `${diffDay} ngày trước`;
    } else if (diffWeek < 4) {
      return `${diffWeek} tuần trước`;
    } else if (diffMonth < 12) {
      return `${diffMonth} tháng trước`;
    } else {
      return `${diffYear} năm trước`;
    }
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
