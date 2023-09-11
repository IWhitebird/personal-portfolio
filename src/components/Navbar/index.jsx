import React, { useEffect } from "react";
import { RiHomeSmileFill } from "react-icons/ri";
import { HiDocumentText } from "react-icons/hi";
import { FaAddressCard } from "react-icons/fa";
import { AiFillMail } from "react-icons/ai";
import Hamburgor from "./Hamborgor";



import './Navbar.css';

const Navbar = () => {
  useEffect(() => {
    const buttons = document.querySelectorAll(".navbar li");

    function chng() {
      buttons.forEach(item => {
        item.classList.remove("active");
      });
      this.classList.add("active");
    }

    buttons.forEach(element => {
      element.addEventListener("click", chng);
    });

    return () => {
      buttons.forEach(element => {
        element.removeEventListener("click", chng);
      });
    };
  }, []);

  return (
    <div>
      <Hamburgor />
      <section className="main_section">
        <div className="navbar">
          <div className="nav">
            <ul>
              
              <li>
                <a href="#">
                  <div className="icon">
                    <RiHomeSmileFill />
                  </div>
                  <div className="text">Home</div>
                </a>
              </li>

              <li>
                <a href="#project">
                  <div className="icon">
                    <HiDocumentText />
                  </div>
                  <div className="text">Projects</div>
                </a>
              </li>

              <li>
                <a href="#about">
                  <div className="icon">
                  <FaAddressCard />
                  </div>
                  <div className="text">About</div>
                </a>
              </li>

              <li>
                <a href="#contact">
                  <div className="icon">
                  <AiFillMail />
                  </div>
                  <div className="text">Contact</div>
                </a>
              </li>

              <div className="indicator-parent">
                <div className="indicator"></div>
              </div>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Navbar;