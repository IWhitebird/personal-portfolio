import {
    // nodejs,
    // git,
    // threejs,
    javascript,
    typescript,
    html,
    css,
    reactjs,
    redux,
    tailwind,
    mongodb,
    docker,
    cpp,
    python,
    go
  } from "../assets";

  import {
    EduApp1,
    EduApp2,
    EduApp3,
    EduApp4,
    EduApp5,
    EduApp6,
    Geo1,
    Geo2,
    StockAnalysis1,
    StockAnalysis2,
    StockAnalysis3,
    StockAnalysis4,
    Silicon1
  } from  "../assets/images"


  const technologies = [
    {
      name: "C++",
      icon: cpp,
    },
    {
      name: "Python",
      icon: python,
    },
    {
      name: "Go",
      icon: go,
    },
    {
      name: "HTML 5",
      icon: html,
    },
    {
      name: "CSS 3",
      icon: css,
    },
    {
      name: "JavaScript",
      icon: javascript,
    },
    {
      name: "TypeScript",
      icon: typescript,
    },
    {
      name: "React JS",
      icon: reactjs,
    },
    {
      name: "Redux Toolkit",
      icon: redux,
    },
    {
      name: "Tailwind CSS",
      icon: tailwind,
    },
    {
      name: "MongoDB",
      icon: mongodb,
    },
    {
      name: "docker",
      icon: docker,
    },  
  ];



  const projectsData = [
    {
      id: 1,
      name: "Stock Analyzer",
      description: "We've crafted an advanced online platform using Python's Streamlit library, enabling precise prediction and analysis of future stock trends. Our creation seamlessly showcases trending and operational stocks, merging predictive analytics with real-time market insights.",
      imageUrl: [StockAnalysis1 , StockAnalysis2 , StockAnalysis3 , StockAnalysis4],
      projectUrl: "https://stock-analysis-iwhitebird.streamlit.app/",
      gitHubUrl: "https://github.com/IWhitebird/Stock-Analysis",
      technologies: ["Html" , "Css" ,"Python", "Streamlit"],
    },
    {
      id: 2,
      name: "Silicon Pulse Store",
      description: "Utilizing the advanced MERN stack, we successfully established an online computer e-commerce store. Our platform offers a seamless experience for purchasing and selling high-quality computer parts, while also providing a user-friendly interface for managing orders and inventory.",
      imageUrl: [Silicon1],
      projectUrl: "https://silicon-pulse.vercel.app/",
      gitHubUrl: "https://github.com/Xeonen24/Silicon-Pulse-eComApp",
      technologies: ["JavaScript" ,"MangoDB", "Express" , "React" , "NodeJs" ],
    },
    {
      id: 3,
      name: "GeoLocationQuiz",
      description: "Created an interactive web game using ReactJs and Google Maps Street View API. The game involves guessing locations by looking at random street view images.",
      imageUrl: [Geo1 , Geo2],
      projectUrl: "https://geolocquiz.vercel.app",
      gitHubUrl: "https://github.com/IWhitebird/guess-loc",
      technologies: ["JavaScript", "ReactJs","Express", "PostgreSQL" , "3js"],
    },
    {
      id: 4,
      name: "StudyNotion",
      description: "Developed a website parallel to Udemy, facilitating users to assume the role of instructors and devise their own courses. This platform enables student users to enroll in courses, monitor their advancement, and provide course ratings, establishing a comprehensive learning environment.",
      imageUrl: [EduApp1 , EduApp2 , EduApp3 , EduApp4 , EduApp5 , EduApp6],
      projectUrl: "https://education-website-app.vercel.app/",
      gitHubUrl: "https://github.com/IWhitebird/education-website-app",
      technologies: ["TypeScript","MangoDB", "Express" , "React" , "NodeJs" , "Redux"],
    },
  ];

  export  {technologies , projectsData};