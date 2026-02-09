import React from "react";
import { motion } from "framer-motion";
import { skillsData, educationData, achievementsData } from "../../Constants";
import { SiLeetcode } from "react-icons/si";
import { IoSchool } from "react-icons/io5";
import "./About.css";

const About = () => {
  return (
    <div id="about" className="about-wrapper theme transition-colors duration-300 ease-in">
      <motion.h1
        className="about-head font-mons"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        About Me
      </motion.h1>

      <motion.p
        className="about-subtitle font-mons"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.7 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Who I am &amp; what I work with
      </motion.p>

      <div className="about-content">
        {/* Top section: bio left, cards right */}
        <div className="about-top">
          <motion.div
            className="about-bio font-mons"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <p className="leading-relaxed">
              I am an SDE II at Skylark Labs, specializing in distributed systems
              and backend engineering. I thrive on building scalable
              infrastructure, real-time pipelines, and developer tooling.
            </p>
            <br />
            <p className="leading-relaxed">
              I have proficiency in TypeScript, Go, Python, and a solid grasp of
              C++, data structures, and algorithms. I have a strong interest in
              backends, distributed systems, and system design.
            </p>
          </motion.div>

          <div className="about-cards">
            <motion.div
              className="about-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <IoSchool className="about-card-icon" size={24} />
              <div>
                <h3 className="font-mons font-bold">{educationData.university}</h3>
                <p className="about-card-sub font-mons">{educationData.degree}</p>
                <p className="about-card-meta font-mons">
                  GPA: {educationData.gpa} &middot; {educationData.period}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="about-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <SiLeetcode className="about-card-icon" size={24} />
              <div>
                <h3 className="font-mons font-bold">LeetCode Knight</h3>
                <p className="about-card-sub font-mons">{achievementsData[0]}</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Divider */}
        <motion.div
          className="about-divider"
          initial={{ width: 0 }}
          whileInView={{ width: 60 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        />

        {/* Skill Cloud — full width */}
        <div className="skill-cloud">
          <motion.h2
            className="skill-cloud-heading font-mons"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Skills &amp; Technologies
          </motion.h2>

          {Object.entries(skillsData).map(([category, skills], catIndex) => (
            <motion.div
              key={category}
              className="skill-category"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: catIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="skill-category-label font-mons">{category}</h3>
              <div className="skill-tags">
                {skills.map((skill, i) => (
                  <motion.span
                    key={skill}
                    className="skill-tag font-mons"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: catIndex * 0.1 + i * 0.03 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.08 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
