import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const Lightbox: React.FC = () => {
  const { activeLightboxImage, closeLightbox } = usePortfolio();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    if (activeLightboxImage) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeLightboxImage, closeLightbox]);

  return (
    <AnimatePresence>
      {activeLightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {/* Modal Container */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              src={activeLightboxImage.url}
              alt={activeLightboxImage.caption || 'Enlarged view'}
              className="max-w-full max-h-[80vh] object-contain rounded-[8px] shadow-2xl"
            />

            {activeLightboxImage.caption && (
              <p className="mt-4 text-[14px] text-[#8A8A8A] text-center font-normal max-w-[700px]">
                {activeLightboxImage.caption}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
