import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pdfjs, Document, Page } from 'react-pdf';
import { AiOutlineClose } from 'react-icons/ai';
import { FiDownload, FiZoomIn, FiZoomOut } from 'react-icons/fi';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import resumePdf from '../../assets/Resume.pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const RESUME_PATH = resumePdf;

const ResumeModal = ({ setResumeModal }) => {
  const [numPages, setNumPages] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [scale, setScale] = useState(1.2);
  const containerRef = useRef(null);

  function closeResumeModal() {
    setResumeModal(false);
  }

  // Pre-fetch PDF as raw binary data to bypass IDM interception
  useEffect(() => {
    let cancelled = false;
    fetch(RESUME_PATH)
      .then((res) => res.arrayBuffer())
      .then((buf) => {
        if (!cancelled) setPdfData({ data: new Uint8Array(buf) });
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') closeResumeModal();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function zoomIn() {
    setScale((s) => Math.min(s + 0.2, 2.5));
  }

  function zoomOut() {
    setScale((s) => Math.max(s - 0.2, 0.6));
  }

  return (
    <AnimatePresence>
      <motion.div
        className='z-[100] w-full h-full fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-md'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={closeResumeModal}
      >
        <motion.div
          className='relative w-[92vw] h-[92vh] max-w-[860px] rounded-xl overflow-hidden shadow-2xl flex flex-col bg-[#525659]'
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Toolbar */}
          <div className='flex items-center justify-between px-4 py-2 bg-[#323639] shrink-0'>
            <span className='text-white/60 text-xs font-mons tracking-wide'>
              {numPages ? `${numPages} page${numPages > 1 ? 's' : ''}` : ''}
            </span>

            <div className='flex items-center gap-3'>
              <button
                onClick={zoomOut}
                className='text-white/70 hover:text-white transition-colors'
                title='Zoom out'
              >
                <FiZoomOut size={18} />
              </button>
              <span className='text-white/50 text-xs font-mono min-w-[3rem] text-center'>
                {Math.round(scale * 100 / 1.2)}%
              </span>
              <button
                onClick={zoomIn}
                className='text-white/70 hover:text-white transition-colors'
                title='Zoom in'
              >
                <FiZoomIn size={18} />
              </button>

              <div className='w-px h-4 bg-white/20 mx-1' />

              <a
                href={RESUME_PATH}
                download="Resume.pdf"
                className='text-white/70 hover:text-white transition-colors'
                title='Download'
              >
                <FiDownload size={18} />
              </a>
              <button
                className='text-white/70 hover:text-white transition-colors'
                onClick={closeResumeModal}
                title='Close'
              >
                <AiOutlineClose size={18} />
              </button>
            </div>
          </div>

          {/* PDF pages */}
          <div
            ref={containerRef}
            className='flex-1 overflow-y-auto overflow-x-auto'
          >
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className='flex items-center justify-center h-full'>
                  <span className='text-white/50 font-mons text-sm'>Loading...</span>
                </div>
              }
            >
              {numPages && Array.from({ length: numPages }, (_, i) => (
                <div key={i} className='flex justify-center py-3'>
                  <Page
                    pageNumber={i + 1}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className='shadow-lg'
                  />
                </div>
              ))}
            </Document>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResumeModal;
