import React from 'react'
import DecoderText from '../DecoderText'
import './Home.css'

const Home = () => {
  return (
    <>
    <div className='h-[100vh]'>
      <div className='text-center text-5xl my-auto mt-[20rem]'>
        <DecoderText delay={0} className={'font-mons text-[#2f2f2f]'} text='SHREYAS PATANGE'/>
        
        <div className="home__titletext mx-auto">
            <p id="animtext">
              <span>Web Developer</span>
            </p>
        </div>
      </div>

    </div>
      </>
  )
}

export default Home 