import React from "react";
import { technologies } from "../../Constants";
import Zoom from "react-reveal/Zoom";
import Fade from "react-reveal/Fade";
import "./About.css";

const index = () => {
  return (
    <div id="about" className="wrapper h-screen flex items-center theme transition-colors duration-300 ease-in overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:w-[80%] mx-auto gap-[20px] justify-between h-[100%] items-center">
          <div className="w-[80%] lg:w-[50%] flex flex-col items-center mb-5">
            <Zoom left cascade>
                <h1 className="font-mons text-4xl lg:text-6xl font-bold mb-5 mt-3">
                    Hi there!
                </h1>
            </Zoom>
            <Fade left delay={200}>
                <div className="font-mons text-base lg:text-2xl text-left indent-10 w-[100%] lg:w-[80%]">
                    <p className="leading-relaxed">
                    I am a final-year Computer Science student at the University of Mumbai, with a strong passion for impactful software development. 
                    Collaborating with like-minded peers to tackle real-world challenges is what I thrive on. 
                    </p>
                
                    <p className="leading-relaxed">
                    I possess proficiency in 
                    React, Node, Express, MongoDB, Python, and also a solid grasp of C++, data structures, and algorithms for problem solving. 
                    Currently, i am actively looking for an Full stack or backend developer internship opportunity for the Winter of 2023.
                    </p>

                </div>
            </Fade>
          </div>

        <div className="grid grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 items-center mx-auto ">
            {technologies.map((tech, index) => (
          <Zoom right cascade delay={200} duration={1000}>
            <div
              key={index}
              className="transition-all w-20 h-20 lg:w-[120px] lg:h-[120px] duration-300 ease-in-out hover:scale-125"
            >
              <img src={tech.icon} className="h-full object-fill mx-auto tech-icon" alt={tech.name} />
            </div>
          </Zoom>
            ))}
        </div>
      </div>
    </div>
  );
};

export default index;
