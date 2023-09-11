import React, { useState } from "react";
import "./ham.css";
import {FiGithub } from "react-icons/fi" 
import {SiLeetcode} from "react-icons/si"
import {BiLogoLinkedin} from "react-icons/bi"
import {RiTwitterXFill} from "react-icons/ri"



const Hamburgor = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleLiClick = () => {
    setIsChecked(false);
  };

  return (
    <div className="theme navbars font-mons text-3xl">

      <div className="container nav-container">

        <input
          className="checkbox"
          type="checkbox"
          name=""
          id=""
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
        />

        <div className="hamburger-lines">
          <span
            className="line line1"
          ></span>
          <span
            className="line line2"
            style={{width : "60%"}}
          ></span>
          <span
            className="line line3"
          ></span>
        </div>

        <div className="menu-items">
          <a href="#">
            <li>Home</li>
          </a>
          <a href="#project">
            <li>Projects</li>
          </a>
          <a href="#about">
            <li>About me</li>
          </a>
          <a href="#contact">
            <li>Contact</li>
          </a>

          <div className="mt-auto mb-7 mx-auto flex flex-row gap-7">
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

        </div>

      </div>

    </div>
  );
};

export default Hamburgor;