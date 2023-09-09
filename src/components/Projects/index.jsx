import React, { useState } from 'react';
import './Project.css';
import logo from '../../assets/tech/git.png';
import { projectsData } from '../../Constants';
import { Fade } from 'react-reveal';
import { FaGithub } from 'react-icons/fa';
import { HiExternalLink } from 'react-icons/hi';

const Project = () => {
  const [hoveredProjectId, setHoveredProjectId] = useState(null);

  return (
    <div className="wrapper">
      <h1 className="text-7xl font-mons font-bold mb-10 mt-2">Projects</h1>

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

                <p className="text-lg text-[#000000de] font-bold">{project.description}</p>

                <div className="project-links mt-4 flex">
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mr-4"
                  >
                    <HiExternalLink size={30}/> 
                  </a>
                  <a
                    href={project.gitHubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:underline"
                  >
                    <FaGithub  size={30}/>
                  </a>
                </div>

                <div className="technologies mt-4">
                  <p className="text-lg font-extrabold text-gray-600">
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
