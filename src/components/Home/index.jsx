import React from 'react'
import DecoderText from '../DecoderText'
import './Home.css'

const Home = () => {
  return (
    <>
    <div className>
      <div className='w-[1280px] text-center text-5xl mx-auto mt-[20rem]'>
        <DecoderText delay={0} className={'font-mons text-[#2f2f2f]'} text='SHREYAS PATANGE'/>
        
        <div className="home__titletext">
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