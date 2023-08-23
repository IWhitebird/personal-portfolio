import React, { useState, useEffect, useContext } from "react";
import DecoderText from "../DecoderText";
import ResumeModal from "../Resume/ResumeModal";
import Fade from "react-reveal/Fade";
import { MyContext } from "../../MyContext";
import { TypeAnimation } from "react-type-animation";
import "./Home.css";

const Home = () => {
  const [resumeModal, setResumeModal] = useState(false);
  const [time, setTime] = useState("");

  const { mode, setMode } = useContext(MyContext);

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

      h = h < 10 ? "0" + h : h;
      m = m < 10 ? "0" + m : m;
      s = s < 10 ? "0" + s : s;

      const currentTime = h + ":" + m + ":" + s + " " + session;
      setTime(currentTime);
    };

    showTime();
    const intervalId = setInterval(showTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (resumeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [resumeModal]);

  const [showSpan, setShowSpan] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSpan(true);
    }, 650);

    return () => {
      clearTimeout(timeout); // Clear the timeout if the component unmounts before the timeout is reached
    };
  }, []);

  return (
    <>
      {resumeModal && <ResumeModal setResumeModal={setResumeModal} />}

      <div id="content-container" className="h-[100vh] overflow-hidden theme">
        <Fade top>
          <div
            id="MyClockDisplay"
            className="clock font-mons font-bold hidden lg:block "
          >
            {time}
          </div>
        </Fade>
        <div className="theme w-full text-center text-4xl lg:text-6xl mt-[20rem] flex justify-around flex-col">
          <Fade left>
            <DecoderText
              delay={0}
              className='font-mons font-extrabold leading-3 lg:mr-[16rem]'
              text="SHREYAS PATANGE"
            />
          </Fade>

          {/* <h1 class="block-effect home__titletext mx-auto lg:pr-6 ">
            <div class="block-reveal">
              Full Stack Developer
            </div>
          </h1> */}

          <div className={`home__titletext w-full mx-auto lg:pr-10 theme `}>
            <p id="animtext">
              {" "}
              <span className="font-bold">
                Full Stack Developer
              </span>{" "}
            </p>
          </div>

          {/* <div className="theme home__titletext w-full mx-auto lg:pr-[70px]">
          <TypeAnimation
            sequence={[
              "Full Stack Developer",
              1000, 
            ]}
            wrapper="span"
            speed={50}
            style={{ display: "inline-block" }}
            repeat={Infinity}
          />
        </div> */}

        </div>

        <button className="resume" onClick={() => setResumeModal(true)}>
          Resume
        </button>
      </div>
    </>
  );
};

export default Home;
