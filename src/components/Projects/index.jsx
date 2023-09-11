import React, { useState } from 'react';
import './Project.css';
import logo from '../../assets/tech/git.png';
import { projectsData } from '../../Constants';
import { Fade } from 'react-reveal';
import { FaGithub } from 'react-icons/fa';
import { HiExternalLink } from 'react-icons/hi';

const Project = () => {

 return (
    <div id='project' className="wrapper">
      <h1 className="proj-head font-mons">Projects</h1>

      <div className="Projects font-mons">
        {projectsData.map((project, index) => (
          <Fade bottom duration={2000} key={index} distance="20px">
            <div className="project-main flex flex-col lg:flex-row" key={index}>

              <div className="img-section rounded-md">
                <img className="object-scale-down rounded-lg" src={project.imageUrl[0]} alt="logo" />
              </div>

              <div className="project-section">
                <h1 className=" lg:text-5xl text-xl font-black lg:font-bold text-center mb-10 mt-4">
                  {project.name}
                </h1>

                <p className="text-lg font-bold">{project.description}</p>

                <div className="project-links mt-4 flex">
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline mr-4"
                  >
                    <HiExternalLink size={30}/> 
                  </a>
                  <a
                    href={project.gitHubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=" hover:underline"
                  >
                    <FaGithub  size={30}/>
                  </a>
                </div>

                <div className="technologies mt-4">
                  <p className="techno-color text-lg font-extrabold ">
                    Technologies: {project.technologies.join(', ')}
                  </p>
                </div>

              </div>
            </div>
          </Fade>
        ))}
      </div>
    </div>
  );
};

export default Project;
