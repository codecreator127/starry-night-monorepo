import { Event } from '@/data/event';
import App from 'next/app';

export const FALLBACK_EVENTS: Event[] = [
  {
    id: 1,
    title: '1st Hackathon! Knekt!',
    description:
      "This was my first ever hackathon project, created during the 2023 DEVs Hackathon where the theme was Touch Grass. Over the course of 48 hours we created a simple webapp that was designed to allow users to connect by making arranging hang outs easier, with calendar syncing, Google Map recommendations, weather information integrations and a simple friending system. It used a bunch of Google APIs to fetch maps and weather data. Due to our teams inexperience, we didn't manage to complete and integrate all our features, however still a good effort considering it was our first time. Tech stack: HTML, CSS, Firebase.",
    imageUrl: '/knekt-website.jpg',
    videoUrl: null,
    githubUrl: 'https://github.com/codecreator127/hackathon-2023',
  },
  {
    id: 2,
    title: 'SESA x WDCC Hackathon 2023 - XV',
    description:
      'Very quickly after my first hackathon I participated in a second hackathon; this one hosted by SESA and WDCC at UoA. The theme for this event was Rewriting History - Bringing the web to before the web. We created XV - a medieval Twitter, bringing social media to the medieval times. As our second project we had upskilled and learnt from our mistakes from our previous mistakes. We utilized the React framework to speed up our development and Firebase to implement basic user chatting, friending and social media feed functionality. Tech stack: React, Firebase, JavaScript, CSS, HTML, DaisyUI',
    imageUrl: null,
    videoUrl: '/XV-video.mp4',
    githubUrl: 'https://github.com/tonylxm/sesa-x-wdcc-hackathon',
    liveUrl: 'https://tonylxm.github.io/sesa-x-wdcc-hackathon',
  },
  {
    id: 3,
    title: 'DEVs Hackathon 2024 - Plantr',
    description:
      'My third and final hackathon I participated at UoA; hosted by DEVs. The theme for this event was Hack for Humanity and in this hackathon we created a Proof of Concept of Plantr - an Tinder style AI powered plant matcher. This webapp makes finding plants for your needs easy and fun, utilizing AI to recommend plants for your needs. We came first in this Hackathon!. Tech stack: Next.js, TypeScript, Firebase, TailwindCSS, OpenAI API, Pixabay API.',
    imageUrl: null,
    videoUrl: '/plantr.mp4',
    githubUrl: 'https://github.com/LocalhostLtd/DEV-Hackathon-2024',
  },
  {
    id: 4,
    title: 'SESA Website',
    description:
      "After gaining confidence with Web Dev me and my team went out to try create websites commercially. Our first client for our portfolio was UoA's SESA Tech club. Our tasks involved migrating their old HTML, Javascript and CSS website to a more modern framework, adding some new pages, and optimizing certain aspects. We worked together with the SESA executive team to migrate their website over to the React framework. Tech stack: React, 3JS, Framer Motion, Google Calendar API, Tailwind.",
    imageUrl: '/sesa-website.jpg',
    videoUrl: null,
    githubUrl: 'https://github.com/sesauoa/sesa.org.nz',
    liveUrl: 'https://sesa.org.nz/',
  },
  {
    id: 5,
    title: 'VPS - Virtual Patient Simulator',
    description:
      'VPS - Virtual Patient Simulator. A WDCC project, this web app is designed to be used by the UoA Faculty of Medical and Health Sciences to allow their students to practice simulated hospital scenarios. This teaching tool would allow the lecturers create mock scearios for students to practice on. Tech stack: React, Node.js, Express, MongoDB.',
    imageUrl: '/VPS.jpg',
    videoUrl: null,
    githubUrl: 'https://github.com/UoaWDCC/VPS',
    liveUrl: 'https://wdcc-vps.fly.dev/login',
  },

  {
    id: 6,
    title: 'Maakindii',
    description:
      'Another startup venture. We included a website into a social media marketing pack. This was the simple website created for our client Maakindii, a resturant based in Auckland CBD. This was just a simple website deployed to give customers basic information on Maakindii. Tech stack: Next.js.',
    imageUrl: '/maakindii.jpg',
    videoUrl: null,
    githubUrl: 'https://github.com/LocalhostLtd/DEV-Hackathon-2024',
    liveUrl: 'https://maakindii.vercel.app/',
  },
  {
    id: 7,
    title: 'MixnMatch',
    description:
      'Final year Computer Science. Capstone: "someone\'s greatest achievement or the greatest part of something." - Cambridge Dictionary. This course and project was the pinnacle of my Computer Science journey through UoA. The premise of our project was to build AI models that could simulate human behaviour on a dating app. We were provided a dating application and modified it to work with a terminal CLI research tool. This project involved many layers, including adding API endpoints, working with webhooks, async, in house created AI model formula and more. At the end of this all we created the Bot Management System Unhinged, which could run on a webpage for ease of use, along with the CLI which had the same functionality but on CLI. Tech stack: Flask, Vite + React, Python, Ollama .',
    imageUrl: '/unhinged.jpg',
    videoUrl: null,
    githubUrl: 'https://github.com/codecreator127/capstone-project-unsupervised-learners',
  },
  {
    id: 8,
    title: 'BMMA',
    description:
      'Badminton Match Making Application - A platform to allow badminton club admins to easily organise their club nights and organise match making. Created upon seeing the need for some sort of match making application since current doubles match making in badminton clubs are mostly done manually or via Badboard or similar which have outdated UI. This webapp includes all features required to run a badminton club including and not limited to automated match making, reporting capabilities and group management. Tech stack: Next.js, Stripe, Firebase.',
    imageUrl: '/bmma.jpg',
    videoUrl: null,
    liveUrl: 'https://bmma-nu.vercel.app/',
  },
  {
    id: 9,
    title: 'EROAD Internship',
    description:
      'My first and only internsip! Went to Eroad, a company that seemingly utilizes every possible tech under the sun. Hardware, firmware, software, every ware possible. My intern project consisted of recreating a mailing service that broke due to Microsoft updating their 365 policies. So I created a brand new mailing service end to end, and it worked! Tech stack: Java, Springboot, Maven, SES, S3, SNS, DynamoDB, K8s, EKS, ECR. CICD: Github Actions.',
    imageUrl: '/cviu.png',
    videoUrl: null,
  },
  {
    id: 10,
    title: 'EROAD Project I',
    description:
      "Eroad liked me so much they offered me return offer! I returned to Eroad to continue my coding journey, and here I began to evolve from a developer to a Software Engineer. My first project was to complete a pressing new feature they had been wanting for their Inspect App. This involved working with two frontend devs and my senior backend dev along with various new technologies I hadn't tried before and spinning up a completely brand new CICD pipeline for this project. This was eventually successfully released to production! Tech stack: React Native, Reactotron, Firebase, Java, Maven. CICD: Github Actions.",
    imageUrl: '/inspect.png',
    videoUrl: null,
  },
  {
    id: 11,
    title: 'EROAD Project II',
    description:
      "Got moved to another team after completing my first project. This new team was made to maintain and push new features for Eroad's Maintenance and Inspection features. We migrated it from an old JSP, HTML, CSS framework to the modern React frontend stack. The migration also involved a new reporting feature and various API endpoints being updated to V2 which I did as a backend dev, so I got plenty of practice with REST APIs and Java Springboot here. Tech stack: Java, Springboot, Maven, AWS. CICD: Concourse.",
    imageUrl: '/inspectionmaintenance.png',
    videoUrl: null,
  },
  {
    id: 12,
    title: 'EROAD Project III',
    description:
      'Moved into a new Driver Safety team building more cool new stuff! This project is where I truly began to flourish into a full fledged Software Engineer. I first implemented various backend features for our Dashcam and then after we released this feature in an astounding month I was handed my first Technical Solution Discovery task. For the Discovery I cooked up a beautiful design to link two features we have existing. Throughout this whole process I had to consider many things, dig deep into existing code, data models, optimizations, functional and non functional requirement considerations. Tech stack: Java, Springboot, Maven, Cloudfront, S3, SQS, Kinesis, DynamoDB. CICD: Github Actions, Concourse.',
    imageUrl: '/drp.png',
    videoUrl: null,
  },
];
