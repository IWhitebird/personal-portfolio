import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import DecoderText from "../DecoderText";
import { MyContext } from "../../MyContext";
import "./Home.css";
import resume from "../../assets/resume-svg.svg";
import { FiDownload, FiEye, FiGithub } from "react-icons/fi";
import { SiLeetcode } from "react-icons/si";
import { BiLogoLinkedin } from "react-icons/bi";
import { RiTwitterXFill } from "react-icons/ri";
import { taglinePuns } from "../../Constants";

const Home = ({ setResumeModal }) => {
  const { mode, setMode } = useContext(MyContext);

  const [showSpan, setShowSpan] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSpan(true);
    }, 650);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div id="content-container" className="h-[100vh] overflow-hidden theme">
      <div className="theme w-full text-center mt-[10rem] sm:mt-[15rem] lg:mt-[15rem] flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <DecoderText
            delay={0}
            className="font-mons font-extrabold leading-3 text-4xl md:text-6xl lg:text-6xl"
            text="SHREYAS PATANGE"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="home__titletext w-full mx-auto">
            <TypeAnimation
              sequence={["Software Engineer"]}
              wrapper="span"
              speed={40}
              cursor={true}
              repeat={0}
              className="font-extrabold font-mons"
            />
          </div>

          <div className="home-tagline font-mons text-sm lg:text-base mt-3 tracking-wide">
            <TypeAnimation
              sequence={taglinePuns.flatMap((pun) => [pun, 2500])}
              wrapper="span"
              speed={40}
              deletionSpeed={60}
              repeat={Infinity}
            />
          </div>
        </motion.div>

      </div>

      <div className="resume-group">
        <div className="navv">
          <input type="checkbox" />
          <span></span>
          <span></span>
          <img src={resume} className="resume_svg" alt="resume" />
          <div className="menu">
            <li>
              <a href="/Shreyas_Resume.pdf" download="Shreyas_Resume.pdf">
                <FiDownload />
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); setResumeModal(true); }}>
                <FiEye />
              </a>
            </li>
          </div>
        </div>
        <p className="resume-tag font-mono">Résumé</p>
      </div>

      <motion.div
        className="social absolute lg:left-[3rem] scale-75 lg:scale-100 bottom-[3rem] hidden lg:block"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="flex flex-row gap-7">
          <a href="https://github.com/IWhitebird" className="social-logos">
            <FiGithub size={30} />
          </a>

          <a href="https://leetcode.com/IWhitebird/" className="social-logos">
            <SiLeetcode size={30} />
          </a>

          <a href="https://www.linkedin.com/in/shreyas-patange" className="social-logos">
            <BiLogoLinkedin size={30} />
          </a>

          <a href="https://twitter.com/iguy" className="social-logos">
            <RiTwitterXFill size={30} />
          </a>
        </div>
      </motion.div>

    </div>
  );
};

export default Home;
