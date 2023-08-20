import React, { useState ,Fragment  } from 'react'
import DisplacementSphere from '../Home/DisplacementSphere'
import DecoderText from '../DecoderText'

const Intro = () => {

  return (
    <>
        <div className='relative'>
            <DisplacementSphere />
        </div>
        <div className='pt-[20rem]'>
            <div className='text-8xl font-semibold'>
            <DecoderText delay={10} text={'Shreyas Patange'} />
            </div>
        </div>
    </>
  )
}

export default Intro