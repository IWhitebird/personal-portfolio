import React from "react";
import { motion } from "framer-motion";
import { experienceData } from "../../Constants";
import "./Experience.css";

const Experience = () => {
  return (
    <div id="experience" className="experience-wrapper theme transition-colors duration-300 ease-in">
      <motion.h1
        className="experience-head font-mons"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Experience
      </motion.h1>

      <div className="timeline">
        <motion.div
          className="timeline-line"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true }}
          style={{ transformOrigin: "top" }}
        />
        {experienceData.map((exp, index) => (
          <motion.div
            className="timeline-item"
            key={exp.id}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div className="timeline-dot-wrapper">
              <div className={`timeline-dot ${exp.current ? "timeline-dot--current" : ""}`} />
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <div className="timeline-title-row">
                  <h2 className="font-mons font-bold">{exp.company}</h2>
                  {exp.current && <span className="current-badge font-mons">Current</span>}
                </div>
                <p className="timeline-role font-mons">{exp.role}</p>
                <p className="timeline-period font-mons">{exp.period}</p>
              </div>

              <ul className="timeline-bullets font-mons">
                {exp.bullets.map((bullet, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.2 + i * 0.08 }}
                    viewport={{ once: true }}
                  >
                    {bullet}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Experience;
