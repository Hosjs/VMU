// Main Components Export - Single Source of Truth
// This file serves as the central export point for all reusable components

// Loading Components
export {
  Loading,
  LoadingSpinner,
  LoadingOverlay,
  SkeletonLoader,
  PageTransitionLoader,
  ProgressLoader,
  CarAnimationLoader,
} from './Loading';

// Image Preloader Components
export { ImagePreloader, SimpleImageLoader } from './ImagePreloader';

// Page Transition
export {
  usePageTransition,
  PageTransitionProvider,
  useNavigateWithTransition,
} from './PageTransition';

// UI Components
export {
  Input,
  Select,
  Button,
  Badge,
  Card,
  Modal,
  Table,
  Toast,
  Pagination,
} from './ui';

// Layout Components
export { CompanyLogo } from './Logo';
// Feature Components
export { BookingModal } from './BookingModal';
export { ConsultationModal } from './ConsultationModal';
export { ServiceDetail } from './ServiceDetail';
export { ServicesList } from './ServicesList';
export { ServicesCarousel } from './ServicesCarousel';
export { Partners } from './Partners';
export { GoogleMap, LocationSection } from './GoogleMap';
export { InsuranceServices } from './InsuranceServices';

// HOC Components
export { ModalPortal } from './ModalPortal';

// Icons
export * from './Icons';
