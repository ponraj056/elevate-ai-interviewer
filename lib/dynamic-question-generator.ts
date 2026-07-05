export interface Question {
  question: string
  section: 'technical_fundamentals' | 'skills_deep_dive' | 'project_deep_dive' | 'behavioral_hr'
  idealAnswer: string
}

export interface ParsedResumeData {
  skills: string[]
  projects: Array<{ name: string; techStack: string[]; description: string }>
  experience: string[]
  education: string[]
  questionBank: {
    technical_fundamentals: Question[]
    skills_deep_dive: Question[]
    project_deep_dive: Question[]
    behavioral_hr: Question[]
  }
}

// ------------------------------------------------------------------
// Helper to shuffle arrays (Fisher-Yates)
// ------------------------------------------------------------------
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ------------------------------------------------------------------
// Skill definition with keywords and specific questions
// ------------------------------------------------------------------
interface SkillInfo {
  name: string
  keywords: RegExp
  questions: Question[]
}

const SKILLS_DATABASE: SkillInfo[] = [
  {
    name: 'React',
    keywords: /\b(react|react\.js|reactjs)\b/i,
    questions: [
      {
        question: 'Explain the Virtual DOM and how React uses it for rendering.',
        section: 'skills_deep_dive',
        idealAnswer: 'React maintains a virtual representation of the DOM in memory. When state changes, React compares the new Virtual DOM with a snapshot of the previous one (diffing) and updates only the changed nodes in the real DOM (reconciliation).'
      },
      {
        question: 'What is the difference between React Server Components (RSC) and Client Components?',
        section: 'skills_deep_dive',
        idealAnswer: 'Server Components render on the server, send pre-rendered HTML, and do not include their dependencies in the client bundle. Client Components are hydrated on the client, allowing interactive features like hooks, event listeners, and browser APIs.'
      },
      {
        question: 'How does the React Context API work, and when should you avoid using it?',
        section: 'skills_deep_dive',
        idealAnswer: 'Context API provides a way to pass data through the component tree without prop-drilling. It should be avoided for high-frequency state updates because any change in context triggers a re-render of all consuming components, which can cause performance bottlenecks.'
      },
      {
        question: 'What is the purpose of useEffect clean-up functions in React?',
        section: 'skills_deep_dive',
        idealAnswer: 'The clean-up function inside useEffect is executed before the component unmounts or before running the effect again. It is crucial for preventing memory leaks, clearing subscriptions, event listeners, and timers.'
      }
    ]
  },
  {
    name: 'Next.js',
    keywords: /\bnext\.?js\b/i,
    questions: [
      {
        question: 'Explain the difference between SSR, SSG, and ISR in Next.js.',
        section: 'skills_deep_dive',
        idealAnswer: 'SSR (Server-Side Rendering) pre-renders pages on every request. SSG (Static Site Generation) pre-renders pages at build time. ISR (Incremental Static Regeneration) allows updating static pages in the background without rebuilds, using a revalidate timer.'
      },
      {
        question: 'What is the App Router in Next.js and how does layout nesting work?',
        section: 'skills_deep_dive',
        idealAnswer: 'The App Router uses directory-based routing starting at the app folder. Layouts are defined using layout.js files, which accept a children prop. Nested subfolders automatically nest their page.js within the parent layout without re-rendering it.'
      }
    ]
  },
  {
    name: 'JavaScript',
    keywords: /\b(javascript|js|es6)\b/i,
    questions: [
      {
        question: 'What is closure in JavaScript and what is a practical use case for it?',
        section: 'skills_deep_dive',
        idealAnswer: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). Practical use cases include data privacy (emulating private methods), partial function application, and maintaining state in event handlers.'
      },
      {
        question: 'Explain the event loop in JavaScript, including the microtask queue and macrotask queue.',
        section: 'skills_deep_dive',
        idealAnswer: 'The event loop manages the execution of asynchronous code. Synchronous code runs first on the call stack. When it is empty, the event loop processes all tasks in the microtask queue (Promises, queueMicrotask) before moving to the macrotask queue (setTimeout, setInterval).'
      },
      {
        question: 'What is the difference between == and === operators in JavaScript?',
        section: 'skills_deep_dive',
        idealAnswer: '== performs type coercion before comparing two values, converting them to a common type. === is the strict equality operator and compares both the value and the type without coercion, returning false if types differ.'
      }
    ]
  },
  {
    name: 'TypeScript',
    keywords: /\b(typescript|ts)\b/i,
    questions: [
      {
        question: 'Explain the difference between an interface and a type in TypeScript.',
        section: 'skills_deep_dive',
        idealAnswer: 'interface is primarily for defining object shapes and supports declaration merging (extending by re-declaring). type is more flexible, can define aliases for primitives, unions, tuples, and intersections, but cannot be merged.'
      },
      {
        question: 'What are generics in TypeScript and how do they improve type safety?',
        section: 'skills_deep_dive',
        idealAnswer: 'Generics allow creating reusable components or functions that work with a variety of types rather than a single one. They preserve type safety by capturing the concrete type passed by the caller and enforcing it during compilation.'
      }
    ]
  },
  {
    name: 'Python',
    keywords: /\bpython\b/i,
    questions: [
      {
        question: 'How does Python manage memory, and what is the role of the garbage collector?',
        section: 'skills_deep_dive',
        idealAnswer: 'Python manages memory automatically using a private heap space and references. Its garbage collector uses reference counting as a primary mechanism, supplemented by a cyclic garbage collector to detect and clean reference cycles.'
      },
      {
        question: 'Explain the difference between list and tuple in Python.',
        section: 'skills_deep_dive',
        idealAnswer: 'Lists are mutable, meaning their elements can be modified after creation, and are defined using square brackets. Tuples are immutable, defined using parentheses, consume less memory, and are hashable (can be used as dictionary keys).'
      },
      {
        question: 'What are decorators in Python and how do you write one?',
        section: 'skills_deep_dive',
        idealAnswer: 'Decorators are functions that modify the behavior of another function or class. They take a function as an argument, define a wrapper function that adds some functionality, and return the wrapper.'
      }
    ]
  },
  {
    name: 'Node.js',
    keywords: /\bnode\.?js\b/i,
    questions: [
      {
        question: 'What is the Event Loop in Node.js and how does it enable non-blocking I/O?',
        section: 'skills_deep_dive',
        idealAnswer: 'The Node.js event loop runs in a single thread and offloads I/O operations (like network or disk access) to the system kernel or a worker pool (libuv). When the operation completes, the callback is queued and executed on the main thread.'
      },
      {
        question: 'Explain the difference between setImmediate() and process.nextTick() in Node.js.',
        section: 'skills_deep_dive',
        idealAnswer: 'process.nextTick() fires immediately after the current phase of the event loop completes, before the event loop continues. setImmediate() schedules callbacks to run in the check phase of the next event loop tick.'
      }
    ]
  },
  {
    name: 'Java',
    keywords: /\bjava\b/i,
    questions: [
      {
        question: 'What is the difference between JVM, JRE, and JDK in Java?',
        section: 'skills_deep_dive',
        idealAnswer: 'JVM (Java Virtual Machine) executes the bytecode. JRE (Java Runtime Environment) contains JVM and libraries to run Java apps. JDK (Java Development Kit) is a full toolset containing JRE and development tools like compilers and debuggers.'
      },
      {
        question: 'Explain the Java Garbage Collection mechanism and how it identifies garbage.',
        section: 'skills_deep_dive',
        idealAnswer: 'Java GC automatically manages memory by reclaiming heap storage used by unreachable objects. It identifies garbage using reachability analysis starting from GC Roots (e.g. active threads, static variables). Unreachable objects are marked and swept.'
      }
    ]
  },
  {
    name: 'C++',
    keywords: /\bc\+\+\b/i,
    questions: [
      {
        question: 'Explain the difference between stack and heap memory allocation in C++.',
        section: 'skills_deep_dive',
        idealAnswer: 'Stack allocation is managed automatically by the compiler, where memory is allocated for local variables and deallocated when exiting scope (fast, limited size). Heap allocation is managed manually by the programmer using new and delete (slower, large size, requires manual deallocation to avoid memory leaks).'
      },
      {
        question: 'What are smart pointers in C++11 and how do they prevent memory leaks?',
        section: 'skills_deep_dive',
        idealAnswer: 'Smart pointers are wrapper classes around raw pointers that automatically manage the lifetime of the pointed-to object. std::unique_ptr owns a resource exclusively, while std::shared_ptr uses reference counting to deallocate the resource when the last pointer is destroyed.'
      }
    ]
  },
  {
    name: 'Go',
    keywords: /\b(go|golang)\b/i,
    questions: [
      {
        question: 'What are goroutines and how do they differ from OS threads?',
        section: 'skills_deep_dive',
        idealAnswer: 'Goroutines are lightweight, concurrently executing functions managed by the Go runtime rather than the OS. They use a small initial stack size (around 2KB) that grows dynamically, and the runtime multiplexes thousands of goroutines onto a small number of OS threads.'
      },
      {
        question: 'Explain the concept of channels in Go and how they are used for synchronization.',
        section: 'skills_deep_dive',
        idealAnswer: 'Channels are typed conduits through which concurrent goroutines communicate and synchronize. Sending or receiving on an unbuffered channel blocks execution until the sender and receiver are both ready, ensuring thread-safe data exchange.'
      }
    ]
  },
  {
    name: 'SQL',
    keywords: /\b(sql|mysql|postgresql|sqlite|oracle|dbms)\b/i,
    questions: [
      {
        question: 'What is database normalization and why is it important?',
        section: 'skills_deep_dive',
        idealAnswer: 'Database normalization is the process of organizing tables and columns to minimize data redundancy and dependency. It involves dividing large tables into smaller ones and defining relationships, preventing insertion, update, and deletion anomalies.'
      },
      {
        question: 'Explain the difference between a clustered and non-clustered index.',
        section: 'skills_deep_dive',
        idealAnswer: 'A clustered index determines the physical order of data rows in a table (only one per table). A non-clustered index stores index key values alongside pointers to actual row locations, maintaining index order separately from physical row order.'
      }
    ]
  },
  {
    name: 'MongoDB',
    keywords: /\b(mongodb|mongo|nosql)\b/i,
    questions: [
      {
        question: 'What are the key differences between SQL and NoSQL databases, and when would you choose NoSQL?',
        section: 'skills_deep_dive',
        idealAnswer: 'SQL databases are relational, table-based, scale vertically, and enforce schemas. NoSQL databases are non-relational, document/key-value/graph-based, scale horizontally, and support dynamic schemas. Choose NoSQL for unstructured data, high write throughput, or horizontal scalability.'
      },
      {
        question: 'How does indexing work in MongoDB and how does it improve query performance?',
        section: 'skills_deep_dive',
        idealAnswer: 'MongoDB uses B-tree indexes to store a small fraction of the collection\'s data in an easy-to-traverse form. Indexes limit the number of documents MongoDB must inspect to satisfy a query, preventing expensive collection scans.'
      }
    ]
  },
  {
    name: 'Docker',
    keywords: /\b(docker|kubernetes|k8s|devops|aws|gcp|terraform)\b/i,
    questions: [
      {
        question: 'What is the difference between a Docker container and a Virtual Machine?',
        section: 'skills_deep_dive',
        idealAnswer: 'Virtual Machines virtualize the hardware layer and run a full guest operating system, which is resource-heavy. Docker containers share the host OS kernel and isolate the application processes, making them lightweight, fast to start, and highly portable.'
      },
      {
        question: 'What is a multi-stage Docker build and why should you use it?',
        section: 'skills_deep_dive',
        idealAnswer: 'Multi-stage builds allow using multiple FROM statements in a single Dockerfile. You can compile/build the application in early stages using build tools, and copy only the compiled binaries into a final minimal runtime stage, drastically reducing image size.'
      }
    ]
  },
  {
    name: 'Machine Learning',
    keywords: /\b(machine learning|deep learning|ml|ai|tensorflow|pytorch|scikit|nlp)\b/i,
    questions: [
      {
        question: 'Explain the difference between supervised and unsupervised learning.',
        section: 'skills_deep_dive',
        idealAnswer: 'Supervised learning trains a model on labeled training data, where the target output is known (e.g. classification, regression). Unsupervised learning trains on unlabeled data to find hidden patterns or structures (e.g. clustering, dimensionality reduction).'
      },
      {
        question: 'What is overfitting in machine learning and how do you prevent it?',
        section: 'skills_deep_dive',
        idealAnswer: 'Overfitting occurs when a model learns the training data too well, including its noise and outliers, leading to poor generalization on unseen data. It is prevented using regularization (L1/L2), cross-validation, pruning, dropout, or adding more training data.'
      }
    ]
  }
]

// ------------------------------------------------------------------
// General skill questions for fallback/filling
// ------------------------------------------------------------------
const GENERAL_SKILLS_QUESTIONS: Question[] = [
  {
    question: 'What is Git and how does a rebase differ from a merge?',
    section: 'skills_deep_dive',
    idealAnswer: 'Git is a distributed version control system. A merge combines changes from two branches into a new commit, preserving history. A rebase moves the entire branch commits on top of the tip of another branch, linearizing history.'
  },
  {
    question: 'Explain CORS (Cross-Origin Resource Sharing) and how to resolve it in web applications.',
    section: 'skills_deep_dive',
    idealAnswer: 'Cross-Origin Resource Sharing is a browser security feature that restricts cross-origin HTTP requests. It is resolved by configuring Access-Control-Allow-Origin headers on the server or using a reverse proxy.'
  },
  {
    question: 'Describe how REST APIs manage statelessness.',
    section: 'skills_deep_dive',
    idealAnswer: 'Statelessness means each request from a client to a server must contain all the information necessary to understand and process the request, without relying on stored context on the server.'
  },
  {
    question: 'How do you optimize API response times?',
    section: 'skills_deep_dive',
    idealAnswer: 'API responses are optimized by caching (Redis/browser), database indexing, query optimization, payload compression (gzip), and using CDNs for static assets.'
  },
  {
    question: 'Explain the difference between localStorage and sessionStorage.',
    section: 'skills_deep_dive',
    idealAnswer: 'localStorage persists data even after the browser is closed, with no expiration time. sessionStorage persists data only for the duration of the page session (closed when the tab is closed).'
  },
  {
    question: 'What is MVC architecture?',
    section: 'skills_deep_dive',
    idealAnswer: 'Model-View-Controller is a software design pattern that separates application logic into three interconnected components: Model (data), View (UI), and Controller (logic processing).'
  },
  {
    question: 'Explain the difference between synchronous and asynchronous operations.',
    section: 'skills_deep_dive',
    idealAnswer: 'Synchronous operations block execution until the task completes. Asynchronous operations allow the execution flow to continue, processing the task completion callback in the background.'
  }
]

// ------------------------------------------------------------------
// CS Fundamentals questions pool
// ------------------------------------------------------------------
const FUNDAMENTALS_POOL: Question[] = [
  {
    question: 'Explain the difference between process and thread in Operating Systems.',
    section: 'technical_fundamentals',
    idealAnswer: 'A process is an independent executing program with its own address space, while a thread is a lightweight unit of execution within a process that shares resources like memory and file handles with other threads in the same process.'
  },
  {
    question: 'What is the difference between SQL and NoSQL databases?',
    section: 'technical_fundamentals',
    idealAnswer: 'SQL databases are relational, table-based, have predefined schemas, and scale vertically. NoSQL databases are non-relational, document/key-value based, have dynamic schemas, and scale horizontally.'
  },
  {
    question: 'Describe how Object-Oriented Programming (OOP) handles Polymorphism.',
    section: 'technical_fundamentals',
    idealAnswer: 'Polymorphism allows objects of different classes to be treated as objects of a common superclass. It can be compile-time (method overloading) or runtime (method overriding, where a subclass provides a specific implementation of a method defined in its superclass).'
  },
  {
    question: 'What is the purpose of a database index and how does it work?',
    section: 'technical_fundamentals',
    idealAnswer: 'An index is a data structure (typically a B-Tree or Hash Table) that speeds up data retrieval operations on a database table at the cost of additional writes and storage space.'
  },
  {
    question: 'Explain the concept of Virtual Memory in operating systems.',
    section: 'technical_fundamentals',
    idealAnswer: 'Virtual memory is a memory management technique that provides an idealized abstraction of storage resources, mapping virtual addresses used by a program into physical addresses in computer memory or disk storage.'
  },
  {
    question: 'What is a binary search tree (BST) and its average search time complexity?',
    section: 'technical_fundamentals',
    idealAnswer: 'A Binary Search Tree is a node-based binary tree data structure where each node has a key, and keys in the left subtree are smaller than the node\'s key, while keys in the right subtree are larger. Average search time is O(log N).'
  },
  {
    question: 'Explain the difference between TCP and UDP protocols.',
    section: 'technical_fundamentals',
    idealAnswer: 'TCP is connection-oriented, ensures reliable and ordered delivery of data packets, and includes flow control. UDP is connectionless, faster, but does not guarantee delivery or packet ordering.'
  },
  {
    question: 'What is ACID in DBMS?',
    section: 'technical_fundamentals',
    idealAnswer: 'ACID stands for Atomicity (all or nothing), Consistency (preserves database rules), Isolation (independent concurrent execution), and Durability (permanent persistence of committed data).'
  },
  {
    question: 'What is a deadlock and how can it be prevented?',
    section: 'technical_fundamentals',
    idealAnswer: 'A deadlock is a situation where two or more processes are unable to proceed because each is waiting for the other to release a resource. Prevention strategies include eliminating mutual exclusion, hold and wait, no preemption, or circular wait conditions.'
  },
  {
    question: 'Explain the difference between Method Overloading and Method Overriding.',
    section: 'technical_fundamentals',
    idealAnswer: 'Overloading occurs when two or more methods in the same class have the same name but different parameters. Overriding occurs when a subclass defines a method with the same name and signature as one in its superclass.'
  },
  {
    question: 'What is the difference between Stack and Queue data structures?',
    section: 'technical_fundamentals',
    idealAnswer: 'A Stack is a Last-In-First-Out (LIFO) data structure where elements are added and removed from the same end. A Queue is a First-In-First-Out (FIFO) data structure where elements are added at the rear and removed from the front.'
  },
  {
    question: 'Explain the concept of inheritance in OOP.',
    section: 'technical_fundamentals',
    idealAnswer: 'Inheritance allows a new class (subclass) to inherit attributes and methods of an existing class (superclass), promoting code reuse and establishing a parent-child relationship.'
  },
  {
    question: 'What is paging in operating systems?',
    section: 'technical_fundamentals',
    idealAnswer: 'Paging is a memory management scheme by which an operating system stores and retrieves data from secondary storage for use in main memory in same-size blocks called pages.'
  },
  {
    question: 'Explain the difference between HTTP and HTTPS.',
    section: 'technical_fundamentals',
    idealAnswer: 'HTTP transmits data in clear text, making it vulnerable to interception. HTTPS encrypts the connection using SSL/TLS, ensuring secure data transmission, integrity, and server authentication.'
  }
]

// ------------------------------------------------------------------
// Behavioral/HR questions pool
// ------------------------------------------------------------------
const BEHAVIORAL_POOL: Question[] = [
  {
    question: 'Tell me about a time you had a conflict with a team member and how you resolved it.',
    section: 'behavioral_hr',
    idealAnswer: 'The candidate should describe a specific disagreement, focus on professional and logical communication, active listening, and arriving at a collaborative solution that benefited the project.'
  },
  {
    question: 'Why are you interested in this engineering role and our company?',
    section: 'behavioral_hr',
    idealAnswer: 'The candidate should demonstrate knowledge of the company\'s engineering stack or mission, align it with their career goals, and highlight how their skills can add immediate value.'
  },
  {
    question: 'Describe a situation where you had to learn a new technology quickly. How did you approach it?',
    section: 'behavioral_hr',
    idealAnswer: 'The candidate should describe their learning process (reading documentation, building small projects, referencing codebases) and outputting an outcome to show practical application.'
  },
  {
    question: 'How do you prioritize tasks when working under tight deadlines?',
    section: 'behavioral_hr',
    idealAnswer: 'The candidate should discuss task categorization (using Eisenhower matrix or Agile backlogs), estimating efforts, communication with stakeholders, and focusing on MVP first.'
  },
  {
    question: 'Tell me about a time you failed in a project. What did you learn?',
    section: 'behavioral_hr',
    idealAnswer: 'The candidate should take accountability, explain the root cause of the failure, how they addressed the immediate consequences, and what processes they changed to avoid the same failure in the future.'
  },
  {
    question: 'Describe a time you went above and beyond for a project requirement.',
    section: 'behavioral_hr',
    idealAnswer: 'The candidate should detail a specific project need where they exceeded basic requirements, explaining their proactive actions, the positive outcome, and personal growth.'
  },
  {
    question: 'How do you handle constructive feedback on your code reviews?',
    section: 'behavioral_hr',
    idealAnswer: 'The candidate should emphasize objectivity, viewing feedback as an opportunity to learn, separating professional feedback from personal bias, and collaborating with reviewers to write cleaner code.'
  }
]

// ------------------------------------------------------------------
// Major parsing function
// ------------------------------------------------------------------
export function generateDynamicData(resumeText: string): ParsedResumeData {
  // 1. Detect skills
  const detectedSkills: string[] = []
  for (const skill of SKILLS_DATABASE) {
    if (skill.keywords.test(resumeText)) {
      detectedSkills.push(skill.name)
    }
  }

  // Fallback default skills if none are matched
  if (detectedSkills.length === 0) {
    detectedSkills.push('JavaScript', 'Git', 'SQL')
  }

  // 2. Parse projects from text or fallback to generating projects
  const projects: ParsedResumeData['projects'] = []
  
  // Try to find sections starting with projects and capture block names
  const projectMatches = Array.from(resumeText.matchAll(/(?:project|portfolio|academic project|key project)[\s:#\-\—\–\|]*([a-zA-Z0-9\s\.\-]{3,40})/gi))
  
  if (projectMatches && projectMatches.length > 0) {
    const uniqueProjectNames = Array.from(new Set(projectMatches.map(m => m[1].trim())))
      .filter(name => {
        // filter out keywords or junk
        const lower = name.toLowerCase()
        return !['name', 'title', 'skills', 'experience', 'education', 'description', 'stack'].includes(lower) && name.split(/\s+/).length <= 4
      })
      .slice(0, 3)

    for (const name of uniqueProjectNames) {
      // Find stack from detected skills for this project
      const projStack = detectedSkills.slice(0, 2)
      projects.push({
        name,
        techStack: projStack.length > 0 ? projStack : ['JavaScript', 'HTML/CSS'],
        description: `Candidate's custom project ${name} mentioned in the resume.`
      })
    }
  }

  // If no projects parsed, synthesize projects using detected skills
  if (projects.length === 0) {
    if (detectedSkills.includes('React') || detectedSkills.includes('Next.js')) {
      projects.push({
        name: 'Full-Stack Web Portal',
        techStack: [detectedSkills[0], detectedSkills.includes('Node.js') ? 'Node.js' : 'TypeScript', 'TailwindCSS'],
        description: 'A responsive web application featuring real-time data binding, state management, and optimized rendering workflows.'
      })
    }
    if (detectedSkills.includes('Python') || detectedSkills.includes('Machine Learning')) {
      projects.push({
        name: 'Intelligent Analytics Engine',
        techStack: ['Python', detectedSkills.includes('Machine Learning') ? 'Scikit-Learn' : 'Flask', 'SQL'],
        description: 'A data analysis suite designed to parse complex datasets, perform predictive modeling, and expose metrics via custom API endpoints.'
      })
    }
    if (projects.length === 0) {
      projects.push({
        name: 'Database Inventory System',
        techStack: [detectedSkills[0], 'Git', 'SQL'],
        description: 'A secure backend repository providing structured schemas, indexing optimization, and basic CRUD execution models.'
      })
    }
  }

  // 3. Try to parse education and experience, fallback to realistic mocks
  const experience: string[] = []
  const education: string[] = []

  // Simple regex parsers
  const collegeMatch = resumeText.match(/(?:college|university|institute of technology|b\.tech|m\.tech|b\.e\.|m\.ca|b\.sc|bachelor|master)[\s\S]{1,80}/i)
  if (collegeMatch) {
    education.push(collegeMatch[0].split('\n')[0].trim().replace(/[\r\n\t]+/g, ' '))
  } else {
    education.push('Bachelor of Technology in Computer Science')
  }

  const expMatch = resumeText.match(/(?:intern|developer|engineer|analyst|software development intern)[\s\S]{1,60}/i)
  if (expMatch) {
    experience.push(expMatch[0].split('\n')[0].trim().replace(/[\r\n\t]+/g, ' '))
  } else {
    experience.push('Software Engineering Intern')
  }

  // 4. Generate Question Bank
  // a. Technical Fundamentals: Shuffled pool of 10 questions
  const technical_fundamentals = shuffle(FUNDAMENTALS_POOL).slice(0, 10)

  // b. Skills Deep Dive: Pick 10 questions.
  let skillsQuestionsPool: Question[] = []
  for (const skillName of detectedSkills) {
    const dbSkill = SKILLS_DATABASE.find(s => s.name === skillName)
    if (dbSkill) {
      skillsQuestionsPool = [...skillsQuestionsPool, ...dbSkill.questions]
    }
  }

  skillsQuestionsPool = shuffle(skillsQuestionsPool)

  if (skillsQuestionsPool.length < 10) {
    const fillCount = 10 - skillsQuestionsPool.length
    const generalPool = shuffle(GENERAL_SKILLS_QUESTIONS)
    skillsQuestionsPool = [...skillsQuestionsPool, ...generalPool.slice(0, fillCount)]
  } else {
    skillsQuestionsPool = skillsQuestionsPool.slice(0, 10)
  }

  const skills_deep_dive = skillsQuestionsPool

  // c. Project Deep Dive: At least 1 question per project.
  const project_deep_dive: Question[] = projects.map(proj => {
    return {
      question: `In your project "${proj.name}" utilizing ${proj.techStack.join(', ')}, what was the most difficult architectural choice or scaling bottleneck you faced, and how did you resolve it?`,
      section: 'project_deep_dive',
      idealAnswer: `The candidate should detail a specific design decision or challenge inside "${proj.name}" (e.g. data consistency, optimization, or integration flow), explaining their reasoning and engineering resolution.`
    }
  })

  // d. Behavioral HR: Shuffled pool of 5 questions
  const behavioral_hr = shuffle(BEHAVIORAL_POOL).slice(0, 5)

  return {
    skills: detectedSkills,
    projects,
    experience,
    education,
    questionBank: {
      technical_fundamentals,
      skills_deep_dive,
      project_deep_dive,
      behavioral_hr
    }
  }
}
