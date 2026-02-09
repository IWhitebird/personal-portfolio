import {
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
    Gor,
    StockAnalysis1,
    StockAnalysis2,
    StockAnalysis3,
    StockAnalysis4,
    Silicon1
  } from  "../assets/images"

  // Legacy icon-based tech list (still used by some components)
  const technologies = [
    { name: "C++", icon: cpp },
    { name: "Python", icon: python },
    { name: "Go", icon: go },
    { name: "HTML 5", icon: html },
    { name: "CSS 3", icon: css },
    { name: "JavaScript", icon: javascript },
    { name: "TypeScript", icon: typescript },
    { name: "React JS", icon: reactjs },
    { name: "Redux Toolkit", icon: redux },
    { name: "Tailwind CSS", icon: tailwind },
    { name: "MongoDB", icon: mongodb },
    { name: "docker", icon: docker },
  ];

  const experienceData = [
    {
      id: 1,
      company: "Skylark Labs",
      role: "SDE II",
      period: "July 2025 - Present",
      current: true,
      bullets: [
        "Designed and built a distributed and highly scalable system for RTSP/WebRTC video ingestion and processing pipeline using TypeScript, Go, OpenCV, FFmpeg, MediaMTX, and gRPC, supporting real-time analytics and alerting with consistently low latency across hundreds of concurrent live streams.",
        "Developed and scaled backend microservices in Go and Bun.js, using WebSockets, Redis Pub/Sub, and BullMQ to handle real-time data flows, background tasks using NATS Jetstreams, and inter-service communication reliably.",
        "Implemented Envoy and Traefik-based load balancing for gRPC and HTTP services, improving routing stability, traffic shaping, auto scaling and enabling smooth A/B deployments with Kubernetes and Docker.",
        "Built a centralized authentication, organization, licensing, and RBAC system using OAuth2, JWT, and session-based access, shared seamlessly across dozens of internal services.",
        "Managed multi-region AWS infrastructure (ECS, Lambda, RDS) with CI/CD pipelines, Terraform-based IaC, and full observability using Prometheus, Grafana, and Loki.",
        "Improved system reliability and event handling by integrating AWS SQS/SNS for distributed queues, and built the platform's real-time alerting stack (WebSockets, push, email, SMS).",
      ],
    },
    {
      id: 2,
      company: "Heliverse Technologies",
      role: "Tech Lead",
      period: "Dec 2023 - June 2025",
      current: false,
      bullets: [
        "Developed AI-powered realtime voice agent and WhatsApp agent using LangChain, Twilio, and custom TypeScript-based agentic frameworks for intelligent task automation handling multiple workflows concurrently using BullMQ.",
        "Developed serverless microservice architecture using AWS Lambda orchestrated through NX monorepo, leveraging DynamoDB and TypeScript with CloudFront distribution via Serverless Framework.",
        "Optimized frontends leveraging Next.js SSG and SSR along with actions for typesafe RPC calls.",
        "Architected and developed a scalable backend system with NestJS, Prisma, and PostgreSQL, featuring dynamic shift management, automated biometric attendance tracking, salary slip generation, and high-performance task/event scheduling with real-time notifications via Firebase and WebSockets.",
      ],
    },
  ];

  const skillsData = {
    "Languages": ["TypeScript", "JavaScript", "Golang", "Python", "C/C++", "Rust", "Zig", "Bash", "SQL"],
    "Frameworks & Tech": ["React", "Next.js", "NestJS", "FastAPI", "Gin", "Hono", "Bun.js", "GraphQL", "gRPC", "WebRTC", "WebSocket", "WebTransport", "FFmpeg", "NATS", "Kafka", "RabbitMQ", "Temporal", "LangChain"],
    "Infrastructure": ["Docker", "Kubernetes", "Traefik", "NGINX", "Terraform", "Helm", "Linux", "CI/CD"],
    "Databases": ["PostgreSQL", "MySQL", "MongoDB", "DynamoDB", "ScyllaDB", "Cassandra", "Redis", "etcd"],
    "Cloud": ["AWS", "ECS", "Lambda", "RDS", "S3", "EC2", "Cloudflare", "GCP", "Firebase", "Supabase"],
    "Familiar": ["Java", "C#", "Spring Boot", ".NET", "Lua", "WASM", "ONNX"],
  };

  const achievementsData = [
    "Reached LeetCode Knight rank with a 2000+ rating and solved 1000+ questions.",
  ];

  const educationData = {
    university: "University of Mumbai",
    degree: "B.E. in Computer Science, minor in Data Science",
    gpa: "9.30 / 10.00",
    period: "2020 - 2024",
  };

  const projectsData = [
    {
      id: 1,
      name: "Gor",
      description: "Built a Turing-complete interpreted programming language from scratch with a full tokenizer, parser, AST representation, optimizer, evaluation engine, and interactive REPL. Created an online playground allowing users to write and execute Gor code, visualize ASTs, and interact with the language through a React + Gin web interface.",
      imageUrl: [Gor],
      projectUrl: "https://gorlang.vercel.app/",
      gitHubUrl: "https://github.com/IWhitebird/Gor",
      technologies: ["Go", "Gin", "React"],
    },
    {
      id: 2,
      name: "GeoQuiz",
      description: "Developed a Street View-based location guessing game with single-player and real-time multiplayer lobbies using TypeScript, React and the Google Maps Street View API along with Supabase. Implemented low-latency multiplayer logic using Supabase's WebSocket-driven realtime database streams with synchronized room state, competitive rounds, chat, and reconnection logic.",
      imageUrl: [Geo1 , Geo2],
      projectUrl: "https://guess-loc-v2.vercel.app/",
      gitHubUrl: "https://github.com/IWhitebird/guess-loc-v2",
      technologies: ["TypeScript", "React", "Supabase", "PostgreSQL", "WebSockets"],
    },
    {
      id: 4,
      name: "Silicon Pulse Store",
      description: "Utilizing the advanced MERN stack, we successfully established an online computer e-commerce store. Our platform offers a seamless experience for purchasing and selling high-quality computer parts, while also providing a user-friendly interface for managing orders and inventory.",
      imageUrl: [Silicon1],
      projectUrl: "https://silicon-pulse.vercel.app/",
      gitHubUrl: "https://github.com/Xeonen24/Silicon-Pulse-eComApp",
      technologies: ["JavaScript" ,"MongoDB", "Express" , "React" , "Node.js"],
    },
    {
      id: 5,
      name: "Stock Analyzer",
      description: "We've crafted an advanced online platform using Python's Streamlit library, enabling precise prediction and analysis of future stock trends. Our creation seamlessly showcases trending and operational stocks, merging predictive analytics with real-time market insights.",
      imageUrl: [StockAnalysis1 , StockAnalysis2 , StockAnalysis3 , StockAnalysis4],
      projectUrl: "https://stock-analysis-iwhitebird.streamlit.app/",
      gitHubUrl: "https://github.com/IWhitebird/Stock-Analysis",
      technologies: ["HTML" , "CSS" ,"Python", "Streamlit"],
    },
  ];

  const taglinePuns = [
    "i mass, i velocity — still no momentum",
    "writes code · AI explains it · manager takes credit",
    "404: sleep schedule not found",
    "copilot writes the code, i write the apology emails",
    "git commit -m 'please work this time'",
    "10% coding · 90% explaining why it's broken",
    "i don't comment my code, good luck future me",
    "merge conflicts are just love triangles between branches",
    "my AI pair programmer hallucinates more than i do",
    "surviving on chai and mass stack traces",
  ];

  export { technologies, projectsData, experienceData, skillsData, achievementsData, educationData, taglinePuns };
