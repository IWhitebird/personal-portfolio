import React, { useState, useEffect, useContext } from "react";
import DecoderText from "../DecoderText";
import ResumeModal from "../Resume/ResumeModal";
import Fade from "react-reveal/Fade";
import { MyContext } from "../../MyContext";
import { TypeAnimation } from "react-type-animation";
import "./Home.css";
import resume from "../../assets/resume-svg.svg"
import {FiDownload , FiEye ,FiGithub } from "react-icons/fi" 
import {SiLeetcode} from "react-icons/si"
import {BiLogoLinkedin} from "react-icons/bi"
import {RiTwitterXFill} from "react-icons/ri"


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
        <div className="theme w-full text-center text-4xl lg:text-6xl mt-[10rem] sm:mt-[15rem] lg:mt-[15rem] flex flex-col ">
          <Fade left>
            <DecoderText
              delay={0}
              className="font-mons font-extrabold leading-3 text-4xl md:text-6xl lg:text-6xl lg:mr-[16rem]"
              text="SHREYAS PATANGE"
            />
          </Fade>

          <div className={`home__titletext w-full mx-auto lg:pr-5 theme hidden lg:block`}>
            <p id="animtext">
              {" "}
              <span className="font-extrabold font-mons">Full Stack Developer</span>{" "}
            </p>
          </div>

          <div className={`home__titletext w-full mx-auto lg:pr-5 theme lg:hidden`}>
            <p id="animtext">
              {" "}
              <span className="font-extrabold font-mons text-5lg">Full Stack</span>{" "}<br/><br/>
              <span className="font-extrabold font-mons text-5lg">Developer</span>{" "}
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
              <a href={`https://drive.google.com/uc?export=download&id=${process.env.REACT_APP_PDF_LINK}`} download>
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

        <p class="resume-tag absolute h-[30px] w-[80px] font-mono text-lg ">Résumé</p>


        <div className="social absolute lg:left-[3rem] scale-75 lg:scale-100 bottom-[3rem] hidden lg:block">
          <Fade left>
          <div className="flex flex-row gap-7">
            <a href="https://github.com/IWhitebird" className="social-logos">
              <FiGithub  size={30} />
            </a>

            <a  href="https://leetcode.com/patangeshreyas/" className="social-logos">
              <SiLeetcode  size={30} />
            </a>

            <a href="https://www.linkedin.com/in/shreyas-patange-b9b71b1b8/" className="social-logos">
              <BiLogoLinkedin  size={30} />
            </a>

            <a  href="https://twitter.com/shreyas_patange/" className="social-logos">
              <RiTwitterXFill  size={30} />
            </a>
          </div>
          </Fade>
        </div>

      </div>
    </>
  );
};

export default Home;
