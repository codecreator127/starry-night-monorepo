import { Event } from '@/data/event';
import App from 'next/app';

export const FALLBACK_EVENTS: Event[] = [
  {
    id: 1,
    title: '1st Hackathon! Knekt!',
    description:
      'A 48-hour hackathon project built at the 2023 DEVs Hackathon focused on encouraging people to connect offline. The application explored ways to make organising real-world hangouts faster and more intuitive. Key features: calendar syncing for availability, Google Maps location recommendations, weather-aware planning, basic friending system. Tech stack: HTML, CSS, Firebase.',
    imageUrl: '/knekt-website.jpg',
    videoUrl: null,
    githubUrl: 'https://github.com/codecreator127/hackathon-2023',
    clusterId: 1,
  },
  {
    id: 2,
    title: 'SESAxWDCC - XV',
    description:
      'A themed hackathon project built at the SESA x WDCC Hackathon exploring what social media might look like before the modern web. XV reimagines Twitter as a medieval-era platform with period-inspired interactions. Key features: real-time chat between users, social media feed system, user friending and profiles. Tech stack: React, Firebase, JavaScript, CSS, HTML, DaisyUI.',
    imageUrl: null,
    videoUrl: '/XV-video.mp4',
    githubUrl: 'https://github.com/tonylxm/sesa-x-wdcc-hackathon',
    liveUrl: 'https://tonylxm.github.io/sesa-x-wdcc-hackathon',
    clusterId: 1,
  },
  {
    id: 3,
    title: 'DEVs - Plantr!',
    description:
      'A proof-of-concept web application created for the DEVs Hackathon with the theme Hack for Humanity. Plantr uses AI to make plant discovery engaging by allowing users to match with plants via Tinder-esque swiping. Key features: AI-powered plant recommendations, swipe-based matching interface, dynamic plant data enrichment. Tech stack: Next js, TypeScript, Firebase, TailwindCSS, OpenAI API, Pixabay API.',
    imageUrl: null,
    videoUrl: '/plantr.mp4',
    githubUrl: 'https://github.com/LocalhostLtd/DEV-Hackathon-2024',
    clusterId: 1,
  },
  {
    id: 4,
    title: 'SESA Website',
    description:
      'A commercial website redevelopment project for the University of Auckland SESA Tech Club. The goal was to modernise an outdated site, move it to a newer tech stack and improve maintainability and performance. Key features: full migration to React, new content pages, event calendar integration. Tech stack: React, Three js, Framer Motion, Google Calendar API, Tailwind.',
    imageUrl: '/sesa-website.jpg',
    videoUrl: null,
    githubUrl: 'https://github.com/sesauoa/sesa.org.nz',
    liveUrl: 'https://sesa.org.nz/',
    clusterId: 2,
  },
  {
    id: 5,
    title: 'Virtual Patient Simulator',
    description:
      'A web-based teaching tool developed as part of a WDCC project for the Faculty of Medical and Health Sciences. The platform allows students to practise simulated hospital scenarios in a controlled environment. Key features: lecturer-created patient scenarios, student simulation workflows, role-based access control. Tech stack: React, Node js, Express, MongoDB.',
    imageUrl: '/VPS.jpg',
    videoUrl: null,
    githubUrl: 'https://github.com/UoaWDCC/VPS',
    liveUrl: 'https://wdcc-vps.fly.dev/login',
    clusterId: 2,
  },

  {
    id: 6,
    title: 'Maakindii',
    description:
      'A client website developed as part of a startup marketing package for a restaurant based in Auckland CBD. The site provides essential information and a clean online presence for customers. Key features: responsive marketing website, clear content structure, aesthetic UI/UX. Tech stack: Next js.',
    imageUrl: '/maakindii.jpg',
    videoUrl: null,
    githubUrl: 'https://github.com/LocalhostLtd/DEV-Hackathon-2024',
    liveUrl: 'https://maakindii.vercel.app/',
    clusterId: 2,
  },
  {
    id: 7,
    title: 'MixnMatch',
    description:
      'Final-year Computer Science capstone project focused on simulating human behaviour in dating applications. The project explored AI-driven user behaviour through both web and CLI-based research tools. Key features: AI-driven user simulation models, bot management dashboard, CLI research tooling, webhook-driven bot chat. Tech stack: Python, Flask, Vite, React, Ollama.',
    imageUrl: '/unhinged.jpg',
    videoUrl: null,
    githubUrl: 'https://github.com/codecreator127/capstone-project-unsupervised-learners',
    clusterId: 2,
  },
  {
    id: 8,
    title: 'BMMA',
    description:
      'A full-featured badminton club management platform designed to automate match organisation and reduce manual administration. The system was built to replace outdated manual tooling used by badminton clubs. Key features: automated doubles matchmaking, club reporting and analytics, group and player management. Tech stack: Next js, Tailwind, Stripe, Firebase.',
    imageUrl: '/bmma.jpg',
    videoUrl: null,
    liveUrl: 'https://bmma-nu.vercel.app/',
    clusterId: 2,
  },
  {
    id: 9,
    title: 'EROAD Internship',
    description:
      'An internship project completed at EROAD focused on rebuilding a critical mailing service for the CVIU. The solution was designed, implemented, and deployed end-to-end to production. Key features: resilient email delivery pipeline, AWS service integration, production-ready CI/CD workflows. Tech stack: Java, Spring Boot, Maven, SES, S3, SNS, DynamoDB, Kubernetes, EKS, ECR, GitHub Actions.',
    imageUrl: '/cviu.png',
    videoUrl: null,
    clusterId: 3,
  },
  {
    id: 10,
    title: 'EROAD Project I',
    description:
      'A production feature delivered as part of my return to EROAD for their Inspect mobile application. The project involved building a brand new production CICD and trailblazing firebase usage for app deployment. Key features: new Inspect app functionality, mobile-first feature delivery, custom CI/CD pipeline creation. Tech stack: React Native, Reactotron, Storybook, Firebase, Java, Maven, Route53, GitHub Actions, Concourse.',
    imageUrl: '/inspect.png',
    videoUrl: null,
    clusterId: 3,
  },
  {
    id: 11,
    title: 'EROAD Project II',
    description:
      'A large-scale system migration project focused on modernising EROAD’s Maintenance and Inspection platform. Legacy JSP-based systems were replaced with a modern React and API-driven architecture. Key features: frontend framework migration, REST API version upgrades, new reporting functionality. Tech stack: Java, Spring Boot, Maven, AWS, Concourse.',
    imageUrl: '/inspectionmaintenance.png',
    videoUrl: null,
    clusterId: 3,
  },
  {
    id: 12,
    title: 'EROAD Project III',
    description:
      'A senior-level project within EROAD’s Driver Safety team focused on delivering high-impact backend features. The role expanded into technical design and solution discovery. Key features: dashcam and SoS button feature delivery, large-scale event processing, technical solution discovery and system design. Tech stack: Java, Spring Boot, CloudFront, S3, SQS, Kinesis, GitHub Actions, Concourse',
    imageUrl: '/drp.png',
    videoUrl: null,
    clusterId: 3,
  },
];
