export * from './auth';
export * from './common';
export * from './dashboard';
export * from './student';
export * from './subject';
export * from './major-subject';

// Explicit re-export để tránh xung đột với Major từ student.ts (nếu có)
export type { Major, MajorFormData, MajorQueryParams } from './major';
