import type { Subject, SubjectEnrollment, SubjectQueryParams } from '~/types/subject';
import type { PaginatedResponse } from '~/types/common';
import type { Student } from '~/types/student';
import { getApiBaseUrl } from './api.service';

const API_BASE_URL = getApiBaseUrl();

export const subjectService = {
  async getSubjects(params?: SubjectQueryParams): Promise<PaginatedResponse<Subject>> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const response = await fetch(`${API_BASE_URL}/subjects?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }

    const result = await response.json();
    return {
      data: result.data,
      current_page: result.meta.current_page,
      from: result.meta.from,
      last_page: result.meta.last_page,
      per_page: result.meta.per_page,
      to: result.meta.to,
      total: result.meta.total,
      first_page_url: '',
      last_page_url: '',
      next_page_url: null,
      path: '',
      prev_page_url: null,
    };
  },

  async getSubjectsByMajorAndYear(majorId: number, namHoc?: number): Promise<Subject[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('major_id', majorId.toString());
    if (namHoc) queryParams.append('nam_hoc', namHoc.toString());

    const response = await fetch(`${API_BASE_URL}/subjects/by-major?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subjects by major');
    }

    const result = await response.json();
    return result.data || [];
  },

  async getEnrolledStudents(
    subjectId: number,
    params?: { nam_hoc?: number; major_id?: number; search?: string; page?: number; per_page?: number }
  ): Promise<PaginatedResponse<SubjectEnrollment>> {
    const queryParams = new URLSearchParams();

    if (params?.nam_hoc) queryParams.append('nam_hoc', params.nam_hoc.toString());
    if (params?.major_id) queryParams.append('major_id', params.major_id.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}/students?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch enrolled students');
    }

    const result = await response.json();
    return {
      data: result.data,
      current_page: result.meta.current_page,
      from: result.meta.from,
      last_page: result.meta.last_page,
      per_page: result.meta.per_page,
      to: result.meta.to,
      total: result.meta.total,
      first_page_url: '',
      last_page_url: '',
      next_page_url: null,
      path: '',
      prev_page_url: null,
    };
  },

  async getAvailableStudents(
    subjectId: number,
    namHoc: number,
    majorId: number,
    params?: { search?: string; page?: number; per_page?: number }
  ): Promise<PaginatedResponse<Student>> {
    const queryParams = new URLSearchParams();
    queryParams.append('subject_id', subjectId.toString());
    queryParams.append('nam_hoc', namHoc.toString());
    queryParams.append('major_id', majorId.toString());

    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const response = await fetch(`${API_BASE_URL}/subjects/available-students?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available students');
    }

    const result = await response.json();
    return {
      data: result.data,
      current_page: result.meta.current_page,
      from: result.meta.from,
      last_page: result.meta.last_page,
      per_page: result.meta.per_page,
      to: result.meta.to,
      total: result.meta.total,
      first_page_url: '',
      last_page_url: '',
      next_page_url: null,
      path: '',
      prev_page_url: null,
    };
  },

  async enrollStudent(data: {
    maHV: string;
    subject_id: number;
    major_id: number;
    namHoc: number;
    hocKy?: string;
  }): Promise<SubjectEnrollment> {
    const response = await fetch(`${API_BASE_URL}/subjects/enroll`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to enroll student');
    }

    const result = await response.json();
    return result.data;
  },

  async bulkEnrollStudents(data: {
    maHVs: string[];
    subject_id: number;
    major_id: number;
    namHoc: number;
    hocKy?: string;
  }): Promise<{ enrollments: SubjectEnrollment[]; duplicates: string[] }> {
    const response = await fetch(`${API_BASE_URL}/subjects/bulk-enroll`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to enroll students');
    }

    const result = await response.json();
    return {
      enrollments: result.data,
      duplicates: result.duplicates || [],
    };
  },

  async unenrollStudent(enrollmentId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/subjects/unenroll/${enrollmentId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unenroll student');
    }
  },

  async bulkUnenrollStudents(enrollmentIds: number[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/subjects/bulk-unenroll`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enrollment_ids: enrollmentIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unenroll students');
    }
  },

  async getAllSubjects(): Promise<Subject[]> {
    const response = await fetch(`${API_BASE_URL}/subjects?per_page=1000`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all subjects');
    }

    const result = await response.json();
    return result.data || [];
  },

  async getAvailableSubjectsForMajor(majorId: number): Promise<Subject[]> {
    const response = await fetch(`${API_BASE_URL}/major-subjects/available-subjects/${majorId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available subjects');
    }

    const result = await response.json();
    return result.data || [];
  },

  async bulkAssignSubjectsToMajor(data: {
    major_id: number;
    subject_ids: number[];
  }): Promise<{ added: number; skipped: number }> {
    const response = await fetch(`${API_BASE_URL}/major-subjects/bulk-assign`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to bulk assign subjects');
    }

    const result = await response.json();
    return result.data;
  },

  async createSubject(data: {
    maMon: string;
    tenMon: string;
    soTinChi: number;
    moTa?: string;
  }): Promise<Subject> {
    const response = await fetch(`${API_BASE_URL}/subjects`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create subject');
    }

    const result = await response.json();
    return result.data;
  },

  async updateSubject(id: number, data: {
    maMon: string;
    tenMon: string;
    soTinChi: number;
    moTa?: string;
  }): Promise<Subject> {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update subject');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteSubject(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete subject');
    }
  },
};
