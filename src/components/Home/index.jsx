import React , {useState , useEffect} from 'react'
import DecoderText from '../DecoderText'
import './Home.css'

const Home = () => {

  const [time, setTime] = useState('');

  useEffect(() => {
    const showTime = () => {
      const date = new Date();
      let h = date.getHours(); // 0 - 23
      let m = date.getMinutes(); // 0 - 59
      let s = date.getSeconds(); // 0 - 59
      let session = "AM";
      
      if (h === 0) {
        h = 12;
      }
      
      if (h > 12) {
        h = h - 12;
        session = "PM";
      }
      
      h = (h < 10) ? "0" + h : h;
      m = (m < 10) ? "0" + m : m;
      s = (s < 10) ? "0" + s : s;
      
      const currentTime = h + ":" + m + ":" + s + " " + session;
      setTime(currentTime);
    };

    showTime();
    const intervalId = setInterval(showTime, 1000);

    return () => clearInterval(intervalId);
  }, []);


  return (
    <>
    <div className='h-[100vh]'>
    <div id="MyClockDisplay" className="clock font-mons font-bold hidden lg:block">{time}</div>
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