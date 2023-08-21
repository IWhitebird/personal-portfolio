import React from 'react'
import DecoderText from '../DecoderText'
import './Home.css'

const Home = () => {

  return (
    <>
    <div className='h-[100vh]'>
      <div className='w-full text-center text-5xl mx-auto mt-[20rem]'>
          <DecoderText delay={0} className={'font-mons text-[#2f2f2f]'} text='SHREYAS PATANGE'/>
        <div className="home__titletext w-full mx-auto">
          <p id="animtext"> <p className='font-semibold'>Full Stack Developer</p> </p>
        </div>

      </div>
    </div>
    </>
  )
}

export default Home 