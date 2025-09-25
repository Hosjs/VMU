import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
}

export function ModalPortal({ children, isOpen }: ModalPortalProps) {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create modal root if it doesn't exist
    let modalContainer = document.getElementById('modal-root');

    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'modal-root';
      modalContainer.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 999999 !important;
        pointer-events: auto !important;
      `;
      document.body.appendChild(modalContainer);
    }

    setModalRoot(modalContainer);

    return () => {
      // Only remove container if it's empty and component is unmounting
      if (modalContainer && modalContainer.children.length === 0) {
        const timeoutId = setTimeout(() => {
          if (modalContainer && modalContainer.parentNode && modalContainer.children.length === 0) {
            modalContainer.parentNode.removeChild(modalContainer);
          }
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (modalRoot) {
      modalRoot.style.display = isOpen ? 'block' : 'none';
      modalRoot.style.pointerEvents = isOpen ? 'auto' : 'none';
    }
  }, [isOpen, modalRoot]);

  if (!modalRoot || !isOpen) {
    return null;
  }

  return createPortal(children, modalRoot);
}
