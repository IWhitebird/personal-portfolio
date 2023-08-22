import React, { useState } from 'react';
import {projectsData} from '../../Constants';
import './Project.css';
import logo from '../../assets/tech/git.png';


const Project = () => {

  const [hoveredProjectId, setHoveredProjectId] = useState(null);
  
  return (
    <div className="wrapper">
      <div className='Projects'>
        <h1 className='text-5xl font-mons font-bold mb-10 mt-3'>Projects</h1>
        <div className='project-main'>

          <div className='img-section'>
            {
             hoveredProjectId && <img src={hoveredProjectId.imageUrl} />
            }
          </div>


        <div className='project-section'>
          {
            projectsData.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onMouseEnter={() => setHoveredProjectId(project)}
                onMouseLeave={() => setHoveredProjectId(null)}
              >
                <p>{project.name}</p>
              </div>
            ))
          }
        </div>


        </div>

      </div>
    </div>
  );
};

export default Project;