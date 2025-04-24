import type { Mentor, Testimonial, Review } from "./types"

// Sample mentors data
export const mentors: Mentor[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Junior, Computer Science",
    university: "Harvard University",
    bio: "Current Harvard CS student with experience in hackathons and research. I've helped dozens of students craft compelling applications that highlight their technical achievements and passion for innovation.",
    avatar: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
    reviewCount: 24,
    specialties: [
      "Computer Science Applications",
      "STEM Essays",
      "Research Experience",
      "Technical Projects",
      "Hackathon Experience",
    ],
    languages: ["English", "Spanish"],
    activities: [
      {
        title: "President",
        organization: "Harvard Computer Society",
        years: "2022-Present",
        description: "Leading weekly workshops and organizing hackathons for 200+ members.",
      },
      {
        title: "Research Assistant",
        organization: "Harvard AI Lab",
        years: "2021-Present",
        description: "Working on machine learning applications in healthcare.",
      },
      {
        title: "Volunteer",
        organization: "Code for Good",
        years: "2020-Present",
        description: "Teaching coding to underprivileged high school students.",
      },
    ],
    awards: [
      {
        title: "Dean's List",
        issuer: "Harvard University",
        year: "2021-2022",
        description: "Awarded for academic excellence.",
      },
      {
        title: "First Place",
        issuer: "HackHarvard",
        year: "2022",
        description: "Won first place for developing an AI-powered educational app.",
      },
      {
        title: "Grace Hopper Scholarship",
        issuer: "Anita Borg Institute",
        year: "2021",
        description: "Selected as one of 50 students nationwide to attend the Grace Hopper Conference.",
      },
    ],
    essays: [
      {
        title: "Why Harvard",
        prompt: "Why do you want to attend Harvard University?",
        text: "Growing up in a small town with limited resources, I always dreamed of attending a university where innovation and intellectual curiosity were celebrated. Harvard's computer science program stood out to me not just for its academic rigor, but for the collaborative environment it fosters. When I visited campus and sat in on a CS50 lecture, I was struck by how Professor Malan made complex concepts accessible while challenging students to think critically. The energy in the room was palpable—students were engaged, asking thoughtful questions, and helping each other grasp difficult concepts.\n\nBeyond the classroom, Harvard's commitment to using technology for social good aligns perfectly with my own values. The university's various initiatives, from the Digital Literacy Project to Tech for Social Good, provide platforms for students to apply their technical skills to address real-world problems. This intersection of technology and social impact is exactly where I hope to make my mark.\n\nHarvard's diverse community also appeals to me. Coming from a background where I was often the only girl interested in computer science, I value environments where different perspectives are not just welcomed but seen as essential to innovation. The university's global student body would expose me to new ideas and approaches, helping me grow not just as a programmer but as a person.\n\nUltimately, I see Harvard as a place where I can both challenge myself academically and find a community that shares my passion for using technology to make a positive difference in the world.",
        university: "Harvard University",
      },
    ],
    education: [
      {
        degree: "B.S. in Computer Science",
        university: "Harvard University",
        years: "2021-Present",
        description: "Concentration in Artificial Intelligence. GPA: 3.9/4.0",
      },
    ],
    certifications: [
      { name: "Harvard Peer Advisor Certification", year: "2021" },
      { name: "Google Cloud Certified - Associate Cloud Engineer", year: "2022" },
    ],
    successStories: [
      {
        student: "James L.",
        university: "Harvard University",
        year: "2023",
        description:
          "Helped James develop a compelling personal narrative that showcased his research in machine learning.",
      },
      {
        student: "Sophia T.",
        university: "MIT",
        year: "2023",
        description:
          "Guided Sophia through the application process, highlighting her robotics achievements and leadership skills.",
      },
    ],
    services: [
      {
        name: "Application Strategy Session",
        description: "Personalized strategy for your college applications",
        price: 75,
        stripeProductId: "",
        stripePriceId: "",
        calendlyUrl: "sarahjohnson/application-strategy",
      },
      {
        name: "Essay Review",
        description: "In-depth feedback and editing for college essays",
        price: 60,
        stripeProductId: "",
        stripePriceId: "",
        calendlyUrl: "sarahjohnson/essay-review",
      },
    ],
    availability: [
      { day: "Monday", slots: ["4:00 PM", "5:00 PM", "6:00 PM"] },
      { day: "Wednesday", slots: ["3:00 PM", "4:00 PM", "7:00 PM"] },
      { day: "Saturday", slots: ["10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM"] },
    ],
    stripeConnectAccountId: "",
  },
  {
    id: "2",
    name: "Michael Chen",
    title: "Senior, Engineering",
    university: "Stanford University",
    bio: "Stanford engineering student passionate about helping others achieve their academic dreams. I've been through the application process recently and know what admissions officers are looking for.",
    avatar: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
    reviewCount: 18,
    specialties: [
      "Engineering Applications",
      "Technical Essays",
      "Extracurricular Activities",
      "Research Experience",
      "Stanford-specific Advice",
    ],
    languages: ["English", "Mandarin"],
    activities: [
      {
        title: "Captain",
        organization: "Stanford Robotics Team",
        years: "2022-Present",
        description: "Leading a team of 15 students in international robotics competitions.",
      },
      {
        title: "Undergraduate Researcher",
        organization: "Stanford Robotics Lab",
        years: "2021-Present",
        description: "Working on autonomous systems and machine learning applications.",
      },
      {
        title: "Mentor",
        organization: "Stanford Engineering Outreach",
        years: "2020-Present",
        description: "Mentoring high school students interested in engineering careers.",
      },
    ],
    awards: [
      {
        title: "President's Award for Academic Excellence",
        issuer: "Stanford University",
        year: "2022",
        description: "Awarded to the top 5% of engineering students.",
      },
      {
        title: "Innovation Grant",
        issuer: "Stanford Engineering Department",
        year: "2021",
        description: "Received $10,000 for developing a low-cost prosthetic hand.",
      },
      {
        title: "Best Paper Award",
        issuer: "Undergraduate Research Symposium",
        year: "2022",
        description: "Recognized for research on machine learning applications in robotics.",
      },
    ],
    essays: [
      {
        title: "Why Stanford",
        prompt: "What is the most significant challenge that society faces today?",
        text: "As I walk through my neighborhood in Oakland, I pass three grocery stores, two farmers markets, and countless restaurants. Yet just two miles away, residents live in a food desert, with no fresh produce options within walking distance. This stark contrast exemplifies what I believe is one of society's most significant challenges: the inequitable distribution of resources and opportunities based on geographic location and socioeconomic status.\n\nThis spatial inequality manifests across multiple dimensions—access to quality education, healthcare, transportation, green spaces, and economic opportunities all vary dramatically based on zip code. These disparities create a cycle that's difficult to break: neighborhoods without resources struggle to attract investment, which further concentrates poverty and limits upward mobility.\n\nMy interest in this issue began personally, when my family moved from a resource-rich suburb to a more diverse urban neighborhood. I noticed how my new friends had to navigate challenges that had never crossed my mind—like traveling an hour by bus to reach an affordable grocery store or studying in noisy shared housing because their neighborhood lacked a library.\n\nThrough my work with the Community Mapping Project, I've helped document these disparities by creating interactive maps that visualize resource access across our city. This data has been used by local nonprofits to advocate for more equitable distribution of public services and by residents to organize resource-sharing networks.\n\nAddressing spatial inequality requires multifaceted solutions: policy changes to ensure equitable investment across neighborhoods, community-based approaches that build on existing strengths rather than imposing external \"fixes,\" and technology that can bridge physical gaps in resource access.\n\nAt Stanford, I hope to continue this work through the Urban Studies program, combining technical skills in geospatial analysis with a deeper understanding of urban policy and community development. By bringing together diverse perspectives—from residents to policymakers to technologists—I believe we can create cities where opportunity isn't determined by address.",
        university: "Stanford University",
      },
      {
        title: "Extracurricular Activity",
        prompt: "Describe an extracurricular activity that has been particularly meaningful to you.",
        text: "The first robot I built was a disaster. Its wheels spun in opposite directions, its sensors detected obstacles only after crashing into them, and its arm could barely lift a paperclip. But standing in my garage surrounded by scattered parts and failed prototypes, I felt a sense of purpose I'd never experienced before.\n\nI'd always been the quiet kid who preferred taking apart electronics to playing sports or attending parties. When I joined my high school's newly formed robotics club as a freshman, I expected to find a few like-minded peers. Instead, I found my community—fifteen students from different grades and social circles, united by curiosity and a willingness to fail repeatedly in pursuit of creating something meaningful.\n\nOur first year competing in the FIRST Robotics Competition was humbling. With limited resources and experience, we placed near the bottom. Rather than becoming discouraged, we transformed our approach. We established specialized teams for programming, mechanical design, and electrical systems, while implementing a mentorship system where seniors trained underclassmen. I found my niche in sensor integration and computer vision, spending countless hours teaching myself advanced programming concepts that weren't covered in our classes.\n\nBy junior year, I was elected technical lead. The responsibility tested me in unexpected ways. When our main control board failed two days before competition, I had to make quick decisions under pressure, redesigning our electrical system overnight while keeping the team motivated. The experience taught me that leadership isn't just about technical knowledge—it's about communication, adaptability, and maintaining calm when everything seems to be falling apart.\n\nOur senior year robot, affectionately named \"Phoenix\" (rising from the ashes of our previous failures), represented everything we'd learned. Its modular design allowed quick repairs, its code was elegantly structured, and its autonomous functions operated with precision. When we placed third in the regional competition and qualified for nationals, the trophy felt secondary to what we'd built together: a collaborative community where everyone's contributions were valued.\n\nBeyond the technical skills, robotics taught me to embrace the iterative process of creation—to see failures as data points rather than defeats. This mindset has influenced how I approach every challenge, from academic projects to personal relationships. Most importantly, it showed me that finding your people and your passion can transform a quiet kid with a screwdriver into someone who leads, innovates, and builds things that move.",
        university: "Stanford University",
      },
    ],
    education: [
      {
        degree: "B.S. in Mechanical Engineering",
        university: "Stanford University",
        years: "2020-Present",
        description: "Minor in Computer Science. GPA: 3.85/4.0",
      },
    ],
    certifications: [
      { name: "Stanford Peer Mentor Certification", year: "2021" },
      { name: "Leadership Development Program", year: "2022" },
    ],
    successStories: [
      {
        student: "Ryan K.",
        university: "Stanford University",
        year: "2023",
        description: "Helped Ryan showcase his engineering projects and research experience.",
      },
      {
        student: "Aisha P.",
        university: "UC Berkeley",
        year: "2023",
        description: "Guided Aisha in highlighting her robotics competitions and leadership in tech clubs.",
      },
    ],
    services: [
      {
        name: "Engineering Application Package",
        description: "Comprehensive guidance for engineering program applications",
        price: 120,
      },
      {
        name: "Technical Project Portfolio",
        description: "Help showcasing your technical projects effectively",
        price: 80,
      },
      {
        name: "Stanford Application Review",
        description: "Specialized review for Stanford applications",
        price: 90,
      },
    ],
    availability: [
      { day: "Tuesday", slots: ["5:00 PM", "6:00 PM", "7:00 PM"] },
      { day: "Thursday", slots: ["4:00 PM", "5:00 PM", "8:00 PM"] },
      { day: "Sunday", slots: ["1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"] },
    ],
  },
  {
    id: "3",
    name: "Amanda Rodriguez",
    title: "Junior, Arts & Humanities",
    university: "Yale University",
    bio: "Yale student studying English Literature and Art History. I specialize in helping creative students craft compelling narratives and portfolios for their college applications.",
    avatar: "/placeholder.svg?height=200&width=200",
    rating: 4.7,
    reviewCount: 15,
    specialties: [
      "Arts Portfolio Review",
      "Creative Writing Essays",
      "Humanities Applications",
      "Liberal Arts Colleges",
      "Yale-specific Advice",
    ],
    languages: ["English", "Spanish"],
    experience: [
      {
        title: "Writing Tutor",
        company: "Yale Writing Center",
        years: "2022-Present",
        description: "Helping students improve their academic and creative writing.",
      },
      {
        title: "Arts Editor",
        company: "Yale Daily News",
        years: "2021-Present",
        description: "Editing and publishing student creative works and arts coverage.",
      },
    ],
    education: [
      {
        degree: "B.A. in English Literature",
        university: "Yale University",
        years: "2021-Present",
        description: "Minor in Art History. GPA: 3.9/4.0",
      },
    ],
    certifications: [
      { name: "Yale Peer Writing Tutor Certification", year: "2022" },
      { name: "Creative Writing Workshop Leader", year: "2022" },
    ],
    successStories: [
      {
        student: "Emma L.",
        university: "Yale University",
        year: "2023",
        description: "Helped Emma craft a compelling personal narrative that showcased her creative writing talents.",
      },
      {
        student: "Marcus J.",
        university: "Brown University",
        year: "2023",
        description:
          "Guided Marcus through the liberal arts application process, focusing on his interdisciplinary interests.",
      },
    ],
    services: [
      {
        name: "Creative Writing Review",
        description: "Feedback on creative writing samples for applications",
        price: 65,
      },
      {
        name: "Arts Portfolio Review",
        description: "Review and feedback on artistic portfolios",
        price: 75,
      },
      {
        name: "Humanities Application Strategy",
        description: "Strategic guidance for humanities program applications",
        price: 70,
      },
    ],
    availability: [
      { day: "Monday", slots: ["3:00 PM", "4:00 PM", "5:00 PM"] },
      { day: "Thursday", slots: ["2:00 PM", "3:00 PM", "6:00 PM"] },
      { day: "Saturday", slots: ["11:00 AM", "12:00 PM", "2:00 PM"] },
    ],
  },
  {
    id: "4",
    name: "Robert Williams",
    title: "Senior, Pre-Med",
    university: "Johns Hopkins University",
    bio: "Pre-med student at Johns Hopkins with research experience and a passion for helping others achieve their medical school dreams. I can help you navigate the competitive pre-med track.",
    avatar: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
    reviewCount: 22,
    specialties: [
      "Pre-Med Applications",
      "Research Experience",
      "Medical School Preparation",
      "Science Essays",
      "Healthcare Extracurriculars",
    ],
    languages: ["English"],
    essays: [
      {
        title: "Why Medicine",
        prompt: "Why do you want to pursue a career in medicine?",
        text: "My journey toward medicine began not in a hospital or clinic, but in my grandmother's garden. As a child, I watched her carefully tend to plants with medicinal properties—echinacea for colds, aloe for burns, chamomile for sleep. She had grown up in rural Mexico with limited access to healthcare, and these traditional remedies were often her community's first line of defense against illness. Her knowledge fascinated me, but it was the limitations of these remedies that ultimately drew me toward modern medicine.\n\nWhen my grandmother was diagnosed with Type 2 diabetes, her herbal knowledge couldn't regulate her blood sugar or prevent her condition from worsening. I accompanied her to doctor's appointments, translating complex medical terminology and watching the careful balance of science and compassion that her physician employed. This experience revealed to me that medicine is not just about understanding biological mechanisms—it's about bridging cultural divides and making scientific advances accessible to diverse populations.\n\nMy academic journey has been shaped by this realization. As a molecular biology major, I've been captivated by the elegant complexity of human physiology. My research on glucose metabolism in Dr. Chen's lab has given me insight into the very condition that affects my grandmother. But I've also sought experiences beyond the laboratory. Volunteering at the community health clinic in my predominantly Hispanic neighborhood, I've seen how language barriers and cultural misunderstandings can compromise care. When I explained to a patient that her medication needed to be taken with food—information she hadn't understood from her previous provider—I witnessed firsthand how communication can be as crucial as the treatment itself.\n\nThrough my work with the Health Equity Initiative on campus, I've helped develop culturally sensitive health education materials and organized free screening events in underserved communities. These experiences have shown me that addressing health disparities requires both scientific knowledge and cultural competence.\n\nI see medicine as the perfect intersection of my scientific curiosity and my desire to serve diverse communities. I want to practice medicine that honors traditional wisdom while offering the benefits of scientific advancement—medicine that treats patients not just as biological puzzles to solve, but as individuals embedded in cultural contexts. Just as my grandmother carefully tended her garden, I hope to tend to my future patients with knowledge, precision, and profound respect for their unique backgrounds.",
        university: "Johns Hopkins University",
      },
      {
        title: "Research Experience",
        prompt: "Describe a significant research experience and what you learned from it.",
        text: 'The pipette trembled slightly in my hand as I carefully transferred the precious sample—the product of three months of work—into the analyzer. My research on biomarkers for early detection of pancreatic cancer had reached a critical juncture, and this test would determine if my approach had merit. As I initiated the analysis sequence, Dr. Ramirez placed a reassuring hand on my shoulder. "Science is about the process," she said, "not just the results."\n\nThose words would prove prophetic when, hours later, the data revealed that my hypothesized biomarker showed no significant correlation with early-stage disease. My heart sank. Months of meticulous work had led to a negative result.\n\nMy journey to this moment had begun in my sophomore year when I joined Dr. Ramirez\'s oncology research lab. Having lost my uncle to pancreatic cancer—a disease often diagnosed too late for effective intervention—I was drawn to work on early detection methods. After mastering basic techniques, I was encouraged to develop my own research question within the lab\'s broader mission.\n\nThrough literature review, I identified a promising protein that previous studies suggested might be elevated in early-stage pancreatic cancer. I designed a protocol to test this protein in banked blood samples from patients at different disease stages. The work was painstaking—optimizing antibody concentrations, troubleshooting failed Western blots, and carefully documenting each step. I spent countless hours in the lab, fueled by the possibility that my work might eventually help patients like my uncle receive earlier diagnoses.\n\nWhen my results showed no correlation, my initial reaction was disappointment. But Dr. Ramirez helped me see the experience differently. "A negative result is still knowledge gained," she explained. Together, we analyzed what might account for the discrepancy between my findings and previous studies. We identified several methodological differences and limitations in the earlier work that might explain the contradiction.\n\nI redesigned my experiment with additional controls and a modified protocol. Though this second approach also yielded negative results for my original biomarker, it unexpectedly revealed a different protein with potential correlation to early disease. This finding, while preliminary, has become the focus of ongoing work in the lab.\n\nThis experience transformed my understanding of scientific research. I learned that science rarely follows a linear path from hypothesis to confirmation. The process involves setbacks, unexpected turns, and constant reevaluation. I developed resilience in the face of disappointing results and learned to find value in disproving a hypothesis—skills that will serve me well in medicine, where treatments don\'t always work as expected and diagnostic puzzles often require multiple approaches.\n\nMost importantly, I gained appreciation for the collaborative nature of scientific discovery. My individual project was just one piece of the lab\'s collective effort to improve cancer detection. Science is not about individual brilliance but about contributing to a body of knowledge that grows through both successes and failures. As I pursue a career in medicine, I carry this understanding with me—that progress comes through persistence, collaboration, and learning from every result, whether it confirms our expectations or challenges them to evolve.',
        university: "Johns Hopkins University",
      },
    ],
    experience: [
      {
        title: "Research Assistant",
        company: "Johns Hopkins Medical School",
        years: "2022-Present",
        description: "Conducting research on immunology and vaccine development.",
      },
      {
        title: "Pre-Med Advisor",
        company: "Johns Hopkins Pre-Professional Advising Office",
        years: "2021-Present",
        description: "Advising fellow students on pre-med requirements and applications.",
      },
    ],
    education: [
      {
        degree: "B.S. in Biology",
        university: "Johns Hopkins University",
        years: "2020-Present",
        description: "Minor in Public Health. GPA: 3.95/4.0",
      },
    ],
    certifications: [
      { name: "Emergency Medical Technician (EMT)", year: "2021" },
      { name: "Johns Hopkins Peer Health Educator", year: "2022" },
    ],
    successStories: [
      {
        student: "Priya S.",
        university: "Johns Hopkins University",
        year: "2023",
        description: "Helped Priya highlight her research experience and clinical volunteering.",
      },
      {
        student: "David T.",
        university: "Duke University",
        year: "2023",
        description: "Guided David through the pre-med application process, emphasizing his unique path to medicine.",
      },
    ],
    services: [
      {
        name: "Pre-Med Application Strategy",
        description: "Strategic guidance for pre-med students",
        price: 85,
      },
      {
        name: "Research Experience Guidance",
        description: "Help finding and showcasing research opportunities",
        price: 70,
      },
      {
        name: "Medical School Preparation",
        description: "Long-term planning for medical school applications",
        price: 90,
      },
    ],
    availability: [
      { day: "Tuesday", slots: ["4:00 PM", "5:00 PM", "7:00 PM"] },
      { day: "Friday", slots: ["3:00 PM", "4:00 PM", "5:00 PM"] },
      { day: "Sunday", slots: ["2:00 PM", "3:00 PM", "4:00 PM"] },
    ],
  },
  {
    id: "5",
    name: "Olivia Thompson",
    title: "Junior, International Relations",
    university: "Princeton University",
    bio: "International student at Princeton who has navigated the complex US college application process. I specialize in helping international students showcase their unique perspectives.",
    avatar: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
    reviewCount: 16,
    specialties: [
      "International Student Applications",
      "English as Second Language Essays",
      "Cultural Perspectives",
      "Standardized Testing Strategies",
      "Visa Guidance",
    ],
    languages: ["English", "French", "Arabic"],
    experience: [
      {
        title: "International Student Mentor",
        company: "Princeton International Center",
        years: "2022-Present",
        description: "Mentoring new international students on academic and cultural adjustment.",
      },
      {
        title: "Writing Fellow",
        company: "Princeton Writing Center",
        years: "2021-Present",
        description: "Helping students improve their academic writing, with focus on ESL students.",
      },
    ],
    education: [
      {
        degree: "B.A. in International Relations",
        university: "Princeton University",
        years: "2021-Present",
        description: "Certificate in Translation and Intercultural Communication. GPA: 3.85/4.0",
      },
    ],
    certifications: [
      { name: "TESOL Certification", year: "2022" },
      { name: "Cultural Competency Training", year: "2021" },
    ],
    successStories: [
      {
        student: "Hiroshi K.",
        university: "Princeton University",
        year: "2023",
        description: "Helped Hiroshi navigate the US application process from Japan.",
      },
      {
        student: "Ananya P.",
        university: "Columbia University",
        year: "2023",
        description: "Guided Ananya through the application process, highlighting her international perspective.",
      },
    ],
    services: [
      {
        name: "International Student Package",
        description: "Specialized guidance for international applicants",
        price: 95,
      },
      {
        name: "ESL Essay Review",
        description: "Essay review with focus on language and cultural expression",
        price: 70,
      },
      {
        name: "Cultural Perspective Strategy",
        description: "Help showcasing your unique cultural background",
        price: 65,
      },
    ],
    availability: [
      { day: "Monday", slots: ["2:00 PM", "3:00 PM", "6:00 PM"] },
      { day: "Wednesday", slots: ["4:00 PM", "5:00 PM", "7:00 PM"] },
      { day: "Friday", slots: ["1:00 PM", "2:00 PM", "5:00 PM"] },
    ],
  },
  {
    id: "6",
    name: "James Wilson",
    title: "Senior, Economics & Athletics",
    university: "Duke University",
    bio: "Student-athlete at Duke with experience in the athletic recruitment process. I can help you navigate both academic and athletic requirements for college applications.",
    avatar: "/placeholder.svg?height=200&width=200",
    rating: 4.7,
    reviewCount: 14,
    specialties: [
      "Athletic Recruitment",
      "Student-Athlete Applications",
      "NCAA Eligibility",
      "Sports Scholarships",
      "Highlight Reels",
    ],
    languages: ["English"],
    experience: [
      {
        title: "Varsity Soccer Player",
        company: "Duke University Athletics",
        years: "2020-Present",
        description: "Division I student-athlete with experience in recruitment and NCAA regulations.",
      },
      {
        title: "Student-Athlete Mentor",
        company: "Duke Athletics Department",
        years: "2021-Present",
        description: "Mentoring prospective and new student-athletes on balancing academics and athletics.",
      },
    ],
    education: [
      {
        degree: "B.A. in Economics",
        university: "Duke University",
        years: "2020-Present",
        description: "Minor in Sports Management. GPA: 3.7/4.0",
      },
    ],
    certifications: [
      { name: "NCAA Compliance Training", year: "2021" },
      { name: "Leadership Academy Certification", year: "2022" },
    ],
    successStories: [
      {
        student: "Tyler M.",
        university: "Duke University",
        year: "2023",
        description: "Helped Tyler navigate the athletic recruitment process for swimming.",
      },
      {
        student: "Kayla R.",
        university: "University of North Carolina",
        year: "2023",
        description: "Guided Kayla through the soccer recruitment process, resulting in a scholarship.",
      },
    ],
    services: [
      {
        name: "Athletic Recruitment Strategy",
        description: "Guidance on the athletic recruitment process",
        price: 85,
      },
      {
        name: "Highlight Reel Review",
        description: "Feedback on athletic highlight reels",
        price: 60,
      },
      {
        name: "NCAA Eligibility Guidance",
        description: "Help navigating NCAA eligibility requirements",
        price: 75,
      },
    ],
    availability: [
      { day: "Tuesday", slots: ["6:00 PM", "7:00 PM", "8:00 PM"] },
      { day: "Thursday", slots: ["5:00 PM", "6:00 PM", "7:00 PM"] },
      { day: "Sunday", slots: ["3:00 PM", "4:00 PM", "5:00 PM"] },
    ],
  },
]

// Featured mentors (subset of all mentors)
export const featuredMentors = mentors.slice(0, 1)

// Sample testimonials
export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=100&width=100",
    text: "Working with Sarah completely transformed my application. Her insights as a current Harvard student helped me craft a compelling narrative that got me accepted!",
    rating: 5,
    university: "Harvard University",
    graduationYear: 2023,
  },
]

// Sample reviews
export const reviews: Review[] = [
  {
    id: "1",
    mentorId: "1",
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=50&width=50",
    rating: 5,
    date: "May 10, 2023",
    service: "Application Strategy Session",
    text: "Sarah's guidance was invaluable throughout my application process. Her feedback on my essays helped me craft a compelling narrative that showcased my unique strengths. She was always available to answer questions and provided strategic advice that I believe made the difference in my acceptance to Harvard.",
  },
]
