const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ATX_TEAMS = [
  {
    name: "David Druxman",
    description: "ATX Team",
    agents: [
      "Alisha O'Bryant",
      "Iesha Alexander",
      "Jremekyo Anderson",
      "Kierra Smith",
      "Justin Hinze",
      "Tim Dominguez",
      "Miguel Palacios",
      "Amy Phillips",
    ],
  },
  {
    name: "Patricia Lewis",
    description: "ATX Team",
    agents: [
      "Jonathan Mejia",
      "Jovon Holts",
      "Leif Carlson",
      "Brandon Escort",
      "Celeste Garcia",
      "Cynthia Mbaka",
      "Katherine Freeman",
      "Ty Morley",
    ],
  },
  {
    name: "Lanae Edwards",
    description: "ATX Team",
    agents: [
      "Duncan Ordenana",
      "Jack Benken",
      "Magifira Jemal",
      "Rachel Choate",
      "Jeff Korioth",
      'Jacqueline "Rose" Scales',
      "Pedro Rodrigues",
      "Autra Okeke",
    ],
  },
  {
    name: "Frederick Holguin",
    description: "ATX Team",
    agents: [
      "Austin Houser",
      "Doug Curtright",
      "Eric Marrs",
      "John Sivy",
      "Micah Black",
      "Ron Rydzfski",
      "Andy Nickelson",
      "Nikia Lewis",
      "Rory Behnke",
    ],
  },
  {
    name: "Mario Herrera",
    description: "ATX Team",
    agents: [
      "Jaime Valdez",
      "Mark Garcia",
      "Michelle Brown",
      "Roza Veravillalba",
      "Crystal Kurtanic",
      "Romey Kelso",
    ],
  },
  {
    name: "Sandy Benson",
    description: "ATX Team",
    agents: [
      "Brandon Simons",
      "Al Escaname",
      "Patrick McMurey",
      "Leslie Chandler",
    ],
  },
];

const CLT_TEAMS = [
  {
    name: "Vincent Blanchett",
    description: "CLT Team",
    agents: [
      "Lynethe Guevara",
      "Adelina Guardado",
      "Doug Yang",
      "Gabrielle Smith",
      "Angel Harris",
      "Mitchell Pittman",
      "Gakirian Grayer",
    ],
  },
  {
    name: "Nisrin Hajmahmoud",
    description: "CLT Team",
    agents: [
      "Serena Cowan",
      "Chris Chen",
      "Dustin Gunter",
      "Jimmie Royster IV",
      "Camryn Anderson",
      "Niko Smallwood",
      "Gerard Apadula",
    ],
  },
  {
    name: "Jovan Espinoza",
    description: "CLT Team",
    agents: [
      "Peter Nguyen",
      'John "Hunter" Case',
      "Kenya Caldwell",
      "Montrell Morgan",
      "Robert Carter",
      "Kenny McLaughlin",
      "Quincy Jones",
    ],
  },
  {
    name: "Katelyn Helms",
    description: "CLT Team",
    agents: [
      "Beau Carson",
      "Asaad Weaver",
      "Arlethe Guevara",
      "Kyle Williford",
      "Alexia Salinas",
      "Denasia Paul",
      "Don McCoy",
    ],
  },
  {
    name: "Jacob Fuller",
    description: "CLT Team",
    agents: [
      "Miguel Roman",
      "Joe Coleman",
      "Dennis Smith",
      "Quinn McLeod",
      "Jeff Rosenberg",
      "Wenny Gooding",
      "Chris Williams",
    ],
  },
  {
    name: "Jamal Gipson",
    description: "CLT Team",
    agents: [
      "Da'Von Loney",
      "Loren Johnson",
      "Alvin Fulmore",
      "Kevin Gray",
      "Dawn Strong",
      "Alexis Alexander",
    ],
  },
  {
    name: "Brent Lahti",
    description: "CLT Team",
    agents: [
      "Priscille Wembo",
      "Diallo Hill",
      "Tahveon Washington",
      "Paul Grady",
      "Rasheem Manson",
      "Jerren Cropps",
      "Tyrone Gooding",
      "Devon Daniels",
      "Kevin Gilliard",
      "Tamara Hemmings",
      "Lasondra Davis",
    ],
  },
  {
    name: "Brook Coyne",
    description: "CLT Team",
    agents: [
      "Victoria Caldwell",
      "Christopher Thompson",
      "Brittany Castellano",
    ],
  },
];

// Generate a random date between 3 and 12 months ago
function getRandomStartDate() {
  const now = new Date();
  const monthsAgo = Math.floor(Math.random() * 9) + 3; // 3-12 months ago
  const result = new Date(
    now.getFullYear(),
    now.getMonth() - monthsAgo,
    now.getDate()
  );
  return result;
}

// Generate random metrics for a given agent
async function generateRandomMetrics(agentId: string) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Create 3 months of metrics data (current month and 2 previous months)
  for (let i = 0; i < 3; i++) {
    const month =
      currentMonth - i <= 0 ? 12 + (currentMonth - i) : currentMonth - i;

    // For each month, create 1-4 weeks of data
    const weeksInMonth = Math.floor(Math.random() * 4) + 1;

    for (let week = 1; week <= weeksInMonth; week++) {
      // Generate random metrics values
      const closeRate = Math.random() * 0.3; // 0-30%
      const placeRate = Math.random() * 0.7; // 0-70%
      const averagePremium = Math.floor(Math.random() * 1000) + 500; // $500-1500
      const capScore = Math.random() * 10; // 0-10
      const leadsPerDay = Math.random() * 15 + 5; // 5-20

      await prisma.metric.create({
        data: {
          agentId,
          month,
          week,
          closeRate,
          placeRate,
          averagePremium,
          capScore,
          leadsPerDay,
        },
      });
    }
  }
}

async function main() {
  console.log("Starting seed script...");

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await prisma.metric.deleteMany({});
    await prisma.agent.deleteMany({});
    await prisma.team.deleteMany({});

    console.log("Creating ATX teams...");
    // Create ATX teams
    for (const teamData of ATX_TEAMS) {
      const team = await prisma.team.create({
        data: {
          name: teamData.name,
          description: teamData.description,
        },
      });

      console.log(`Created team: ${team.name}`);

      // Create agents for this team
      for (const agentName of teamData.agents) {
        // Split the name into first and last names
        const nameParts = agentName.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        const agent = await prisma.agent.create({
          data: {
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")}@example.com`,
            teamId: team.id,
            startDate: getRandomStartDate(),
            targetLeadsPerDay: Math.floor(Math.random() * 5) + 5, // 5-10 target leads
          },
        });

        console.log(`Created agent: ${agent.firstName} ${agent.lastName}`);

        // Generate metrics for this agent
        await generateRandomMetrics(agent.id);
      }
    }

    console.log("Creating CLT teams...");
    // Create CLT teams
    for (const teamData of CLT_TEAMS) {
      const team = await prisma.team.create({
        data: {
          name: teamData.name,
          description: teamData.description,
        },
      });

      console.log(`Created team: ${team.name}`);

      // Create agents for this team
      for (const agentName of teamData.agents) {
        // Split the name into first and last names
        const nameParts = agentName.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        const agent = await prisma.agent.create({
          data: {
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")}@example.com`,
            teamId: team.id,
            startDate: getRandomStartDate(),
            targetLeadsPerDay: Math.floor(Math.random() * 5) + 5, // 5-10 target leads
          },
        });

        console.log(`Created agent: ${agent.firstName} ${agent.lastName}`);

        // Generate metrics for this agent
        await generateRandomMetrics(agent.id);
      }
    }

    console.log("Seed script completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
