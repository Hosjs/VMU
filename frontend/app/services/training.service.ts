import { apiService } from './api.service';

export interface TrainingPlanParams {
  education_type: 'thac-sy' | 'tien-sy';
  nam_vao: number;
  ma_nganh: string;
}

export interface TrainingPlanResponse {
  success: boolean;
  data: any[];
  meta: {
    education_type: string;
    nam_vao: number;
    ma_nganh: string;
    total: number;
  };
}

// Interface cho dữ liệu course từ API bên ngoài
export interface ExternalCourse {
  id?: number;
  khoaHoc?: number;
  maTrinhDoDaoTao?: string;
  maNganh?: string;
  hocPhanSo?: number;
  hocPhanChu?: string;
  tenMon?: string;
  soTinChi?: number;
  baiTapLon?: boolean;
  loaiHocPhan?: string;
  luaChon?: boolean;
}

export interface EducationType {
  key: string;
  value: string;
  label: string;
}

export interface YearOption {
  value: number;
  label: string;
}

class TrainingService {
  /**
   * Lấy kế hoạch đào tạo (training plan - dùng cho course registrations)
   */
  async getTrainingPlan(params: TrainingPlanParams): Promise<TrainingPlanResponse> {
    const token = localStorage.getItem('auth_token');
    const queryString = new URLSearchParams({
      education_type: params.education_type,
      nam_vao: params.nam_vao.toString(),
      ma_nganh: params.ma_nganh
    }).toString();

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/training/course-registrations?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    return response.json();
  }

  /**
   * Lấy kế hoạch học tập (study plans - dùng cho study plans)
   */
  async getStudyPlans(params: TrainingPlanParams): Promise<TrainingPlanResponse> {
    const token = localStorage.getItem('auth_token');
    const queryString = new URLSearchParams({
      education_type: params.education_type,
      nam_vao: params.nam_vao.toString(),
      ma_nganh: params.ma_nganh
    }).toString();

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/training/study-plans?${queryString}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const jsonData = await response.json();
    return jsonData;
  }

  /**
   * Lấy danh sách loại hình đào tạo
   */
  async getEducationTypes(): Promise<EducationType[]> {
    return apiService.get<EducationType[]>('/training/education-types');
  }

  /**
   * Lấy danh sách các năm có sẵn
   */
  async getAvailableYears(): Promise<YearOption[]> {
    return apiService.get<YearOption[]>('/training/available-years');
  }

  /**
   * Lấy danh sách môn học theo ngành (cho giảng viên)
   * Dùng để load môn học khi chọn giảng viên
   *
   * @param maNganh - Mã ngành thực tế từ majors.maNganh (VD: "8310110")
   * @param namVao - Năm tuyển sinh (mặc định là năm trước)
   */
  async getCoursesByMajor(maNganh: string, namVao?: number): Promise<{
    success: boolean;
    data: Array<{
      maHocPhan: string;
      tenMon: string;
      soTinChi: number;
      hocKy?: number;
      loaiMon?: string;
      hocPhanSo?: number;
      hocPhanChu?: string;
    }>;
    message?: string;
  }> {
    // Xác định loại hình đào tạo dựa trên maNganh
    let educationType: 'thac-sy' | 'tien-sy' = 'thac-sy';
    if (maNganh.startsWith('9') || maNganh.startsWith('6')) {
      educationType = 'tien-sy';
    }

    // Thử nhiều năm nếu không có dữ liệu
    const currentYear = new Date().getFullYear();
    const yearsToTry = [
      namVao || currentYear - 1,
      currentYear - 1,
      currentYear - 2,
      currentYear - 3,
      2024,
      2023,
      2022
    ];

    const token = localStorage.getItem('auth_token');

    // Thử từng năm cho đến khi có dữ liệu
    for (const year of yearsToTry) {
      try {
        const params: any = {
          education_type: educationType,
          ma_nganh: maNganh,
          nam_vao: year,
        };

        const queryString = new URLSearchParams(params).toString();
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/training/study-plans?${queryString}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        const jsonData = await response.json();

        // Transform dữ liệu từ API format sang format cần thiết
        if (jsonData.success && Array.isArray(jsonData.data) && jsonData.data.length > 0) {

          const transformedData = jsonData.data.map((course: ExternalCourse) => ({
            // Tạo mã học phần từ hocPhanSo và hocPhanChu
            maHocPhan: course.hocPhanChu
              ? `${course.hocPhanSo || ''} ${course.hocPhanChu}`.trim()
              : (course.hocPhanSo?.toString() || ''),
            tenMon: course.tenMon || '',
            soTinChi: course.soTinChi || 0,
            hocPhanSo: course.hocPhanSo,
            hocPhanChu: course.hocPhanChu,
            loaiMon: course.loaiHocPhan || (course.luaChon ? 'TC' : 'BB'),
          }));

          return {
            success: true,
            data: transformedData,
            message: `Đã tải ${transformedData.length} môn học (năm ${year})`
          };
        }
      } catch (error) {
        console.warn(`Failed to fetch for year ${year}:`, error);
        // Continue to next year
      }
    }

    // Nếu là Tiến sỹ và không có dữ liệu, thử fallback sang Thạc sỹ
    if (educationType === 'tien-sy' && maNganh.startsWith('9')) {
      const masterMaNganh = '8' + maNganh.substring(1);

      for (const year of yearsToTry) {
        try {
          const params: any = {
            education_type: 'thac-sy',
            ma_nganh: masterMaNganh,
            nam_vao: year,
          };

          const queryString = new URLSearchParams(params).toString();
          const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/training/study-plans?${queryString}`;

          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          const jsonData = await response.json();

          if (jsonData.success && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
            const transformedData = jsonData.data.map((course: ExternalCourse) => ({
              maHocPhan: course.hocPhanChu
                ? `${course.hocPhanSo || ''} ${course.hocPhanChu}`.trim()
                : (course.hocPhanSo?.toString() || ''),
              tenMon: course.tenMon || '',
              soTinChi: course.soTinChi || 0,
              hocPhanSo: course.hocPhanSo,
              hocPhanChu: course.hocPhanChu,
              loaiMon: course.loaiHocPhan || (course.luaChon ? 'TC' : 'BB'),
            }));

            return {
              success: true,
              data: transformedData,
              message: `Đã tải ${transformedData.length} môn học từ chương trình Thạc sỹ (năm ${year})`
            };
          }
        } catch (error) {
          console.warn(`Failed to fetch fallback for year ${year}:`, error);
        }
      }
    }

    console.error('❌ No course data found for any year');
    return {
      success: false,
      data: [],
      message: `Không tìm thấy dữ liệu môn học cho ngành ${maNganh}. API bên ngoài có thể chưa có dữ liệu cho ngành này.`
    };
  }
}

export const trainingService = new TrainingService();
