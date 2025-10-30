import type { Grade } from '~/types/grade';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const gradeService = {
    async getGrades(maHV: string): Promise<any[]> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/grades?MaHV=${encodeURIComponent(maHV)}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch grades');
            }

            const result = await response.json();
            const arr = Array.isArray(result) ? result : (result.data || []);
            return arr;
        } catch (error) {
            console.error('Error fetching grades:', error);
            throw error;
        }
    },
};
