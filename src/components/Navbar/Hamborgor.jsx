import React, { useState } from "react";
import "./ham.css";

const Hamburgor = ({ onPageChange, mode, handleButtonClick }) => {
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
          <a>
            <li>Home</li>
          </a>
          <a >
            <li>Projects</li>
          </a>
          <a >
            <li>About me</li>
          </a>
          <a >
            <li>Contact</li>
          </a>
        </div>

      </div>

    </div>
  );
};

export default Hamburgor;