import React from 'react';
import { motion } from 'framer-motion';
import { ContentBlock } from '../../types/project';
import { usePortfolio } from '../../context/PortfolioContext';
import { Maximize2, Quote as QuoteIcon } from 'lucide-react';

interface BlockRendererProps {
  block: ContentBlock;
  index: number;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, index }) => {
  const { openLightbox } = usePortfolio();
  const easeApple = [0.22, 1, 0.36, 1];
  const { content, block_type } = block;

  const motionProps = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.7, ease: easeApple },
  };

  switch (block_type) {
    // 1. PROJECT METADATA BLOCK
    case 'PROJECT_METADATA': {
      return (
        <motion.div {...motionProps} className="w-full py-8 border-y border-[#E5E5E5] my-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[14px]">
            {content.client && (
              <div>
                <div className="text-[#8A8A8A] uppercase text-[12px] font-semibold tracking-wider">CLIENT</div>
                <div className="text-[#111111] font-medium mt-1">{content.client}</div>
              </div>
            )}
            {content.year && (
              <div>
                <div className="text-[#8A8A8A] uppercase text-[12px] font-semibold tracking-wider">YEAR</div>
                <div className="text-[#111111] font-medium mt-1">{content.year}</div>
              </div>
            )}
            {content.role && (
              <div>
                <div className="text-[#8A8A8A] uppercase text-[12px] font-semibold tracking-wider">ROLE</div>
                <div className="text-[#111111] font-medium mt-1">{content.role}</div>
              </div>
            )}
            {content.services && (
              <div>
                <div className="text-[#8A8A8A] uppercase text-[12px] font-semibold tracking-wider">SERVICES</div>
                <div className="text-[#111111] font-medium mt-1">
                  {Array.isArray(content.services) ? content.services.join(' · ') : content.services}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    // 2. TEXT BLOCK
    case 'TEXT': {
      return (
        <motion.div {...motionProps} className="w-full my-16 max-w-[800px]">
          {content.eyebrow && (
            <div className="text-[12px] md:text-[13px] font-semibold tracking-[0.1em] uppercase text-[#8A8A8A] mb-4">
              {content.eyebrow}
            </div>
          )}
          {content.headline && (
            <h3 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-[#111111] tracking-[-0.03em] leading-[1.1] uppercase mb-6">
              {content.headline}
            </h3>
          )}
          {content.body && (
            <p className="text-[17px] sm:text-[19px] text-[#6B6B6B] leading-[1.6] tracking-[-0.01em] whitespace-pre-line">
              {content.body}
            </p>
          )}
        </motion.div>
      );
    }

    // 3. IMAGE BLOCK
    case 'IMAGE': {
      return (
        <motion.div {...motionProps} className="w-full my-14">
          <div
            className="relative rounded-[12px] overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5] cursor-pointer group"
            onClick={() => content.url && openLightbox(content.url, content.caption)}
          >
            <img
              src={content.url}
              alt={content.caption || 'Project visual'}
              className="w-full max-h-[85vh] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.01]"
            />
            <button
              type="button"
              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 size={16} />
            </button>
          </div>
          {content.caption && (
            <p className="mt-3 text-[13px] text-[#8A8A8A] tracking-tight">{content.caption}</p>
          )}
        </motion.div>
      );
    }

    // 4. FULL BLEED IMAGE BLOCK
    case 'FULL_BLEED_IMAGE': {
      return (
        <motion.div {...motionProps} className="w-full my-16">
          <div
            className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[16px] overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5] cursor-pointer group"
            onClick={() => content.url && openLightbox(content.url, content.caption)}
          >
            <img
              src={content.url}
              alt={content.caption || 'Full bleed visual'}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <button
              type="button"
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 size={16} />
            </button>
          </div>
          {content.caption && (
            <p className="mt-3 text-[13px] text-[#8A8A8A] tracking-tight">{content.caption}</p>
          )}
        </motion.div>
      );
    }

    // 5. TWO IMAGE BLOCK
    case 'TWO_IMAGE': {
      const img1 = content.image1 || { url: content.url1, caption: content.caption1 };
      const img2 = content.image2 || { url: content.url2, caption: content.caption2 };

      return (
        <motion.div {...motionProps} className="w-full my-14 grid grid-cols-1 md:grid-cols-2 gap-8">
          {img1?.url && (
            <div>
              <div
                className="relative min-h-[300px] aspect-[4/3] rounded-[12px] overflow-hidden bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center p-3 cursor-pointer group"
                onClick={() => openLightbox(img1.url, img1.caption)}
              >
                <img
                  src={img1.url}
                  alt={img1.caption || 'Visual 1'}
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              {img1.caption && <p className="mt-2.5 text-[13px] text-[#8A8A8A]">{img1.caption}</p>}
            </div>
          )}
          {img2?.url && (
            <div>
              <div
                className="relative min-h-[300px] aspect-[4/3] rounded-[12px] overflow-hidden bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center p-3 cursor-pointer group"
                onClick={() => openLightbox(img2.url, img2.caption)}
              >
                <img
                  src={img2.url}
                  alt={img2.caption || 'Visual 2'}
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              {img2.caption && <p className="mt-2.5 text-[13px] text-[#8A8A8A]">{img2.caption}</p>}
            </div>
          )}
        </motion.div>
      );
    }

    // 6. THREE IMAGE BLOCK
    case 'THREE_IMAGE': {
      const images = [content.image1, content.image2, content.image3].filter(Boolean);
      return (
        <motion.div {...motionProps} className="w-full my-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.map((img: any, i: number) => (
            <div key={i}>
              <div
                className="relative min-h-[260px] aspect-[4/5] rounded-[12px] overflow-hidden bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center p-3 cursor-pointer group"
                onClick={() => openLightbox(img.url, img.caption)}
              >
                <img
                  src={img.url}
                  alt={img.caption || `Visual ${i + 1}`}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              {img.caption && <p className="mt-2.5 text-[12px] text-[#8A8A8A]">{img.caption}</p>}
            </div>
          ))}
        </motion.div>
      );
    }

    // 7. IMAGE GRID
    case 'IMAGE_GRID': {
      const items = Array.isArray(content.items) ? content.items : [];
      return (
        <motion.div {...motionProps} className="w-full my-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item: any, i: number) => (
            <div
              key={i}
              className="relative aspect-square rounded-[8px] overflow-hidden bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center p-2 cursor-pointer group"
              onClick={() => openLightbox(item.url, item.caption)}
            >
              <img
                src={item.url}
                alt={item.caption || 'Grid asset'}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </motion.div>
      );
    }

    // 8. GALLERY / HORIZONTAL GALLERY
    case 'GALLERY':
    case 'HORIZONTAL_GALLERY': {
      const items = Array.isArray(content.items) ? content.items : [];
      return (
        <motion.div {...motionProps} className="w-full my-16">
          <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-none snap-x">
            {items.map((item: any, i: number) => (
              <div
                key={i}
                className="flex-shrink-0 w-[300px] md:w-[460px] aspect-[4/3] rounded-[12px] overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5] snap-start cursor-pointer group"
                onClick={() => openLightbox(item.url, item.caption)}
              >
                <img
                  src={item.url}
                  alt={item.caption || 'Gallery item'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    // 9. VIDEO BLOCK
    case 'VIDEO': {
      return (
        <motion.div {...motionProps} className="w-full my-16">
          <div className="relative aspect-[16/9] rounded-[16px] overflow-hidden bg-black border border-[#E5E5E5]">
            <video
              src={content.url}
              controls
              autoPlay={Boolean(content.autoPlay)}
              muted={Boolean(content.autoPlay)}
              loop={Boolean(content.loop)}
              className="w-full h-full object-cover"
            />
          </div>
          {content.caption && (
            <p className="mt-3 text-[13px] text-[#8A8A8A] tracking-tight">{content.caption}</p>
          )}
        </motion.div>
      );
    }

    // 10. QUOTE BLOCK
    case 'QUOTE': {
      return (
        <motion.div
          {...motionProps}
          className="w-full my-20 py-12 px-8 md:px-16 rounded-[16px] bg-[#F5F5F5] border border-[#E5E5E5] flex flex-col items-center text-center"
        >
          <QuoteIcon size={32} className="text-[#8A8A8A] mb-6 opacity-60" />
          <blockquote className="text-[22px] sm:text-[28px] md:text-[34px] font-semibold text-[#111111] tracking-[-0.025em] leading-[1.25] max-w-[850px]">
            "{content.quote}"
          </blockquote>
          {(content.author || content.title) && (
            <div className="mt-6 text-[14px] text-[#6B6B6B] font-medium tracking-tight">
              {content.author && <span className="text-[#111111]">{content.author}</span>}
              {content.author && content.title && <span> · </span>}
              {content.title && <span>{content.title}</span>}
            </div>
          )}
        </motion.div>
      );
    }

    // 11. TWO COLUMN BLOCK
    case 'TWO_COLUMN': {
      return (
        <motion.div {...motionProps} className="w-full my-16 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <div>
            {content.leftTitle && (
              <h4 className="text-[20px] md:text-[24px] font-bold text-[#111111] uppercase tracking-tight mb-3">
                {content.leftTitle}
              </h4>
            )}
            <p className="text-[16px] md:text-[17px] text-[#6B6B6B] leading-[1.6]">
              {content.leftContent}
            </p>
          </div>
          <div>
            {content.rightTitle && (
              <h4 className="text-[20px] md:text-[24px] font-bold text-[#111111] uppercase tracking-tight mb-3">
                {content.rightTitle}
              </h4>
            )}
            <p className="text-[16px] md:text-[17px] text-[#6B6B6B] leading-[1.6]">
              {content.rightContent}
            </p>
          </div>
        </motion.div>
      );
    }

    // 12. THREE COLUMN BLOCK
    case 'THREE_COLUMN': {
      const cols = [
        { title: content.col1Title, body: content.col1Body },
        { title: content.col2Title, body: content.col2Body },
        { title: content.col3Title, body: content.col3Body },
      ];
      return (
        <motion.div {...motionProps} className="w-full my-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {cols.map((col, i) => (
            <div key={i}>
              {col.title && (
                <h4 className="text-[18px] font-bold text-[#111111] uppercase tracking-tight mb-2">
                  {col.title}
                </h4>
              )}
              <p className="text-[15px] text-[#6B6B6B] leading-[1.6]">{col.body}</p>
            </div>
          ))}
        </motion.div>
      );
    }

    // 13. SPACER BLOCK
    case 'SPACER': {
      const height = content.height || 64;
      return <div style={{ height: `${height}px` }} className="w-full" />;
    }

    default:
      return null;
  }
};
