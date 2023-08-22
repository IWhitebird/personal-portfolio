import React from 'react';
import PDFFile from './PDFFile';
import { GrClose } from 'react-icons/gr';
import Zoom from 'react-reveal/Zoom';

const ResumeModal = ({ setResumeModal }) => {

  const [exit, setExit] = React.useState(false);


  function closeResumeModal() {
    setResumeModal(false);
    setExit(true);
  }

  return (
    <>
      <Zoom duration={200}>
      <div className='z-[100] w-full h-full fixed bg-[#0000003c] flex items-center justify-center backdrop-blur-md'>
        <div className='w-full h-full rounded-md'>
            <button className=' absolute right-5 top-5 text-4xl transition-all duration-200 ease-in-out hover:scale-125' onClick={closeResumeModal}>
              <GrClose />
            </button>

            <div className='w-full h-full flex item-center justify-center mt-2 mb-1 overflow-y-auto'>
                <div className=' mr-[20%]'>
                    <PDFFile/> 
                </div>
            </div>
        </div>
      </div>
      </Zoom>
    </>
  );
};

export default ResumeModal;
