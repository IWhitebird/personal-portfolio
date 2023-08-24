import React, { useState, useEffect, useContext } from "react";
import DecoderText from "../DecoderText";
import ResumeModal from "../Resume/ResumeModal";
import Fade from "react-reveal/Fade";
import { MyContext } from "../../MyContext";
import { TypeAnimation } from "react-type-animation";
import "./Home.css";
import resume from "../../assets/resume-svg.svg"
import {FiDownload , FiEye} from "react-icons/fi" 

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
              className="font-mons font-extrabold leading-3 lg:mr-[16rem]"
              text="SHREYAS PATANGE"
            />
          </Fade>

          <div className={`home__titletext w-full mx-auto lg:pr-10 theme `}>
            <p id="animtext">
              {" "}
              <span className="font-bold">Full Stack Developer</span>{" "}
            </p>
          </div>
        </div>

        <div class="navv">
          <input type="checkbox" />
          <span></span>
          <span></span>
          <img src={resume} className="resume_svg"></img>
          <div class="menu">
            <li>
              <a href="../Resume/Resume.pdf" download>
                <FiDownload className=""/>
              </a>
            </li>
            <li>
            <a href="#">
              <FiEye onClick={() => setResumeModal(true)} />
              </a>
            </li>
          </div>
        </div>
        <p class="resume-tag absolute h-[30px] w-[80px] font-mono text-lg ">Resume</p>
      </div>
    </>
  );
};

export default Home;
