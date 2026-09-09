import { Activity, ScheduleItem, Coordinator } from '../types';

export const COLLEGE_DETAILS = {
  name: 'Government Engineering College, Barmer',
  shortName: 'GEC Barmer',
  hindiName: 'राजकीय इंजीनियरिंग कॉलेज बाड़मेर',
  website: 'https://gecbarmer.ac.in/',
  address: 'NH-68, Jaisalmer Road, Barmer, Rajasthan - 344001',
  email: 'principal@gecbarmer.ac.in',
  phone: '+91-9119268187',
  phones: ['+91-9119268187', '+91-8118898267'],
  eventDate: 'September 15, 2026',
  eventDay: 'Tuesday',
  eventTime: '09:00 AM – 05:30 PM IST',
  theme: 'Shaping Sustainable Futures Through Indigenous Engineering & Green Innovation',
};

export const EVENT_STATS = [
  { label: 'Activity Tracks', value: '4 Activity Tracks', description: 'Conclave, Plantation, Project Exhibition & Blood Donation' },
  { label: 'Expected Participants', value: '1,000+', description: 'Engineers, Faculty & Innovators' },
  { label: 'Innovations Exhibited', value: '50+', description: 'Hardware, IoT & Software Projects' },
  { label: 'Blood Donation Target', value: '150+ Units', description: 'In association with District Red Cross' },
];

export const ACTIVITIES: Activity[] = [
  {
    id: 'conclave',
    title: 'Conclave',
    badge: 'Technical & Visionary',
    shortDescription: 'National engineering symposium featuring visionary keynotes, emerging tech roundtables, and dialogue with industry stalwarts.',
    fullDescription: 'The Engineers\' Conclave 2026 brings distinguished keynote speakers, academic scholars, and veteran industry leaders together. Explore next-generation frontiers in AI, sustainable renewable power, desert infrastructure development, and indigenous industrial innovation.',
    icon: 'MessageSquareShare',
    venue: 'Swami Vivekananda Central Auditorium',
    timing: '10:45 AM – 01:15 PM',
    coordinator: 'Dr. R. K. Sharma (HoD, Electrical)',
    rules: [
      'Open to registered engineering students and faculty of all years and branches.',
      'Active Q&A and interactive panel participation encouraged.',
      'E-Certificates of Participation awarded to all registered attendees.',
    ],
    highlights: [
      'Keynote addresses by prominent Indian innovators',
      'Panel discussions on sustainable infrastructure & energy in Western Rajasthan',
      'Interactive youth ideation session with industry delegates',
    ],
  },
  {
    id: 'plantation',
    title: 'Plantation',
    badge: 'Eco-Campus Drive',
    shortDescription: 'Green campus drive dedicated to ecological sustainability, planting drought-resilient native saplings across college grounds.',
    fullDescription: 'Honoring the green vision of sustainable engineering, GEC Barmer leads an extensive plantation campaign across the university grounds. Student engineers and faculty join hands to plant indigenous species like Khejri, Rohida, and Neem to enrich desert ecology.',
    icon: 'Sprout',
    venue: 'Central Campus Grounds & Botanical Corridor',
    timing: '09:45 AM – 10:45 AM',
    coordinator: 'Prof. S. N. Meena (Dept. of Civil Engineering)',
    rules: [
      'Gardening tools, saplings, and protective gear provided at the venue.',
      'Participants will tag their designated sapling with an adoption ID plaque.',
      'Green Ambassador badges and certificates awarded upon completion.',
    ],
    highlights: [
      'Goal to plant 250+ indigenous desert-resilient saplings',
      'Campus Tree Adoption pledge by engineering students',
      'Session on eco-restoration and water-conservation techniques',
    ],
  },
  {
    id: 'project-show',
    title: 'Project Exhibition',
    badge: 'Innovation Expo',
    shortDescription: 'Grand tech expo showcasing working prototypes, hardware devices, IoT frameworks, and software solutions developed by student engineers.',
    fullDescription: 'The premier innovation platform of Engineers\' Day 2026. Student engineering teams present live hardware prototypes, robotics, artificial intelligence models, civil structural solutions, and renewable energy inventions before an esteemed jury of industry experts.',
    icon: 'Cpu',
    venue: 'Academic Block-A Expo Gallery & Laboratories',
    timing: '02:00 PM – 04:30 PM',
    coordinator: 'Dr. Ankit Verma (Dept. of Computer Science & IT)',
    rules: [
      'Each project team may consist of 1 to 4 student members.',
      'Live demonstration of the working model or software is mandatory.',
      'Trophies, merit certificates, and cash prizes for top 3 innovative projects.',
    ],
    highlights: [
      '50+ live engineering models spanning all departments',
      'Assessment by external industrial judges and veteran researchers',
      'Seed incubation guidance for top standout prototypes',
    ],
  },
  {
    id: 'blood-donation',
    title: 'Blood Donation',
    badge: 'Social Lifeline',
    shortDescription: 'Voluntary blood donation camp in noble association with the District Blood Bank & Red Cross Society to save valuable lives.',
    fullDescription: 'Embodying social responsibility and civic duty, GEC Barmer conducts a mega blood donation camp on the occasion of Engineers\' Day. Certified medical specialists and paramedical teams oversee hygienic, safe voluntary donations benefiting district healthcare facilities.',
    icon: 'HeartPulse',
    venue: 'College Health Centre & Student Activity Room',
    timing: '10:00 AM – 03:00 PM',
    coordinator: 'Prof. Meenakshi Choudhary (NSS & Red Cross Coordinator)',
    rules: [
      'Donors must be at least 18 years of age and weigh 45 kg or above.',
      'Free clinical health and hemoglobin screening conducted on site.',
      'Government Blood Donor Card, healthy refreshments, and donor certificate provided.',
    ],
    highlights: [
      'Targeting 150+ units for emergency district blood requirements',
      'Full sanitized medical setup overseen by certified doctors',
      'Priority donor privileges card issued by Rajasthan State Blood Transfusion Council',
    ],
  },
];

export const SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch-1',
    time: '09:00 AM – 09:45 AM',
    title: 'Inaugural Ceremony & Tribute to Sir M. Visvesvaraya',
    venue: 'Swami Vivekananda Central Auditorium',
    speakerOrLead: 'Chief Guest & Principal, GEC Barmer',
    badge: 'Inauguration',
    description: 'Lamp lighting ceremony, garlanding tribute to Sir M. Visvesvaraya on Engineers\' Day, floral welcome, and opening presidential address.',
    status: 'completed',
  },
  {
    id: 'sch-2',
    time: '09:45 AM – 10:45 AM',
    title: 'Plantation Drive (Eco-Campus Initiative)',
    activityId: 'plantation',
    venue: 'Central Campus Grounds & Botanical Corridor',
    speakerOrLead: 'Prof. S. N. Meena & Green Volunteers',
    badge: 'Plantation',
    description: 'Ceremonial planting of 250+ native saplings (Khejri, Rohida, Neem) by faculty, dignitaries, and student volunteers.',
    status: 'ongoing',
  },
  {
    id: 'sch-3',
    time: '10:00 AM – 03:00 PM',
    title: 'Mega Blood Donation Camp (Full-Day Drive)',
    activityId: 'blood-donation',
    venue: 'College Health Centre & Dispensary Hall',
    speakerOrLead: 'District Red Cross Society & NSS Team',
    badge: 'Blood Donation',
    description: 'Safe, voluntary blood donation camp running in parallel throughout the day with certified doctors and medical team.',
    status: 'ongoing',
  },
  {
    id: 'sch-4',
    time: '10:45 AM – 01:15 PM',
    title: 'National Engineers\' Conclave & Tech Symposium',
    activityId: 'conclave',
    venue: 'Swami Vivekananda Central Auditorium',
    speakerOrLead: 'Eminent Technocrats & Industry Dignitaries',
    badge: 'Conclave',
    description: 'Keynote lectures on indigenous technologies, renewable energy transition in Western Rajasthan, and panel debates with scholars.',
    status: 'upcoming',
  },
  {
    id: 'sch-5',
    time: '01:15 PM – 02:00 PM',
    title: 'Networking Luncheon & Fellowship',
    venue: 'Central Dining Pavilion',
    speakerOrLead: 'Hospitality Committee',
    badge: 'Break',
    description: 'Buffet lunch, networking between students, alumni, faculty members, and visiting guests.',
    status: 'upcoming',
  },
  {
    id: 'sch-6',
    time: '02:00 PM – 04:30 PM',
    title: 'Grand Project Exhibition & Innovation Expo',
    activityId: 'project-show',
    venue: 'Academic Block-A Exhibition Galleries & Labs',
    speakerOrLead: 'Dr. Ankit Verma & Jury Committee',
    badge: 'Project Exhibition',
    description: 'Public exhibition and technical evaluation of student engineering models, IoT systems, civil structures, and software solutions.',
    status: 'upcoming',
  },
  {
    id: 'sch-7',
    time: '04:30 PM – 05:30 PM',
    title: 'Valedictory Ceremony, Prize Distribution & Wrap-up',
    venue: 'Swami Vivekananda Central Auditorium',
    speakerOrLead: 'Patron, Principal & Organizing Committee',
    badge: 'Valedictory',
    description: 'Announcement of Project Exhibition winners, felicitation of donors, distribution of trophies & certificates, and national anthem.',
    status: 'upcoming',
  },
];

export const COORDINATORS: Coordinator[] = [
  {
    id: 'c-1',
    name: 'Aryan Choudhary',
    role: 'Student Coordinator',
    department: 'Government Engineering College, Barmer',
    phone: '+91 80001 47318',
    isChief: true,
  },
  {
    id: 'c-2',
    name: 'Nidhi Soni',
    role: 'Student Coordinator',
    department: 'Government Engineering College, Barmer',
    phone: '+91 75685 00684',
    isChief: true,
  },
];

export const BRANCH_LIST = [
  'Computer Science & Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Petroleum Engineering',
  'Chemical Engineering',
  'Electronics & Communication Engineering',
];
export const BRANCH_OPTIONS = BRANCH_LIST;

export const SEMESTER_LIST = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];
export const SEMESTER_OPTIONS = SEMESTER_LIST;

export const GENDER_LIST = [
  'Male',
  'Female',
  'Other',
  'Prefer not to disclose',
];
