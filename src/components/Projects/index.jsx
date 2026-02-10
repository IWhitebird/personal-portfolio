import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import './Project.css';
import { projectsData } from '../../Constants';
import { FaGithub } from 'react-icons/fa';
import { HiExternalLink } from 'react-icons/hi';

const ImageCarousel = ({ images, name }) => {
  const [current, setCurrent] = useState(0);
  const hasMultiple = images.length > 1;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [hasMultiple, next]);

  return (
    <div className="carousel">
      <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {images.map((src, i) => (
          <img
            key={i}
            className="carousel-slide rounded-lg"
            src={src}
            alt={`${name} screenshot ${i + 1}`}
          />
        ))}
      </div>
      {hasMultiple && (
        <div className="carousel-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === current ? "carousel-dot--active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Project = () => {
  return (
    <div id='project' className="wrapper">
      <motion.h1
        className="proj-head font-mons"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Projects
      </motion.h1>

      <div className="Projects font-mons">
        {projectsData.map((project, index) => (
          <motion.div
            className="project-main flex flex-col lg:flex-row"
            key={index}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="img-section rounded-md">
              <ImageCarousel images={project.imageUrl} name={project.name} />
            </div>

            <div className="project-section">
              <h1 className=" lg:text-5xl text-xl font-black lg:font-bold text-center mb-3 lg:mb-10 lg:mt-4">
                {project.name}
              </h1>

              <p className="text-sm lg:text-lg font-bold">{project.description}</p>

              <div className="project-links mt-4 flex justify-center lg:justify-start">
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline mr-4"
                >
                  <HiExternalLink size={30} className=" transition-all duration-200 ease-in-out hover:scale-125"/>
                </a>
                <a
                  href={project.gitHubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" hover:underline"
                >
                  <FaGithub  size={30} className=" transition-all duration-200 ease-in-out hover:scale-125"/>
                </a>
              </div>

              <div className="technologies mt-4">
                <p className="techno-color text-sm lg:text-lg font-extrabold ">
                  Technologies: {project.technologies.join(', ')}
                </p>
              </div>

            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Project;
