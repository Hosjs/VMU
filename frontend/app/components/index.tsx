// Main Components Export - Single Source of Truth
// This file serves as the central export point for all reusable components

// ============================================
// UNIFIED LOADING SYSTEM - All-in-one
// ============================================
export {
  // Basic loaders
  LoadingSpinner,
  SkeletonLoader,

  // Full-screen loaders
  FullScreenLoader,
  GradientLoader,
  ModalLoader,

  // Progress loaders
  ProgressLoader,
  ImagePreloader,

  // Content loaders (cho protected routes)
  ContentLoader,
  SimpleContentLoader,

  // Specialized loaders
  CarAnimationLoader,

  // Page Transition System
  usePageTransition,
  PageTransitionProvider,
  useNavigateWithTransition,
  useRouteAnimation,

  // Image Preloader Hooks
  useImagePreloader,
  usePreloadImages,
} from './LoadingSystem';

// Legacy exports - giữ để tương thích ngược
export { CompanyLogo } from './Logo';

// UI Components
export { Input, Select, Button, Badge, Card, Modal, Table, Toast, Pagination } from './ui';

// Feature Components
export { BookingModal } from './BookingModal';
export { ConsultationModal } from './ConsultationModal';
export { ServiceDetail } from './ServiceDetail';
export { ServicesList } from './ServicesList';
export { ServicesCarousel } from './ServicesCarousel';
export { Partners } from './Partners';
export { GoogleMap, LocationSection } from './GoogleMap';
export { InsuranceServices } from './InsuranceServices';
export { ModalPortal } from './ModalPortal';

// Icons
export * from './Icons';
