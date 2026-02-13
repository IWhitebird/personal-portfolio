import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiEye } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import Hamburgor from "./Hamborgor";
import resumePdf from "../../assets/Resume.pdf";
import "./Navbar.css";

const navItems = [
  { label: "Home", href: "#", sectionId: "content-container" },
  { label: "Experience", href: "#experience", sectionId: "experience" },
  { label: "Projects", href: "#project", sectionId: "project" },
  { label: "About", href: "#about", sectionId: "about" },
  { label: "Contact", href: "#contact", sectionId: "contact" },
];

const Navbar = ({ setResumeModal }) => {
  const [show, setShow] = useState(false);
  const [activeSection, setActiveSection] = useState("content-container");
  const [time, setTime] = useState("");

  useEffect(() => {
    const showTime = () => {
      const date = new Date();
      let h = date.getHours();
      let m = date.getMinutes();
      let s = date.getSeconds();
      let session = "AM";

      if (h === 0) h = 12;
      if (h > 12) { h = h - 12; session = "PM"; }

      h = h < 10 ? "0" + h : h;
      m = m < 10 ? "0" + m : m;
      s = s < 10 ? "0" + s : s;

      setTime(h + ":" + m + ":" + s + " " + session);
    };

    showTime();
    const intervalId = setInterval(showTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleIntersect = useCallback((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible.length > 0) {
      setActiveSection(visible[0].target.id);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0, 0.25, 0.5],
    });

    navItems.forEach(({ sectionId }) => {
      const el = document.getElementById(sectionId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <>
      <Hamburgor />

      {/* Clock — always visible */}
      <div className="fixed-clock font-mons theme hidden lg:flex">
        {time}
      </div>

      {/* Navbar glass panel + resume — only on scroll */}
      <AnimatePresence>
        {show && (
          <>
            <motion.nav
              className="top-navbar"
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="top-navbar-inner">
                <ul className="top-navbar-links">
                  {navItems.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className={`top-navbar-link font-mons ${
                          activeSection === item.sectionId ? "top-navbar-link--active" : ""
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.nav>

            <motion.div
              className="fixed-resume hidden lg:flex"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <span className="fixed-resume-label font-mons">Résumé</span>
              <a
                href={resumePdf}
                download="Resume.pdf"
                className="fixed-resume-action"
                title="Download"
              >
                <FiDownload size={14} />
              </a>
              <button
                className="fixed-resume-action"
                onClick={() => setResumeModal(true)}
                title="View"
              >
                <FiEye size={14} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
