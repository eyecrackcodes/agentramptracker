// @ts-nocheck
// This is a data import script and not part of the actual application
// We're ignoring TypeScript checks for this file

// Import the prisma client from our lib directory to ensure consistency
import { prisma } from "../src/lib/prisma";

// CAP score data for 03/10/2025
const AGENT_DATA = [
  {
    tenure: 8.4,
    status: "P",
    site: "AUS",
    manager: "David Druxman",
    rank: 1,
    name: "Iesha Alexander",
    capScore: 237,
    closeRate: 26.6,
    avgPremium: 1385,
    placeRate: 64.4,
    leadsPerDay: 7.9,
  },
  {
    tenure: 8.4,
    status: "P",
    site: "AUS",
    manager: "David Druxman",
    rank: 2,
    name: "Jremekyo Anderson",
    capScore: 236,
    closeRate: 26.3,
    avgPremium: 1180,
    placeRate: 75.9,
    leadsPerDay: 5.7,
  },
  {
    tenure: 9.5,
    status: "P",
    site: "CHA",
    manager: "Nisrin Hajmahmoud",
    rank: 3,
    name: "Jimmie Royster",
    capScore: 219,
    closeRate: 32.4,
    avgPremium: 952,
    placeRate: 70.9,
    leadsPerDay: 7.4,
  },
  {
    tenure: 9.5,
    status: "P",
    site: "CHA",
    manager: "Katelyn Helms",
    rank: 4,
    name: "Asaad Weaver",
    capScore: 216,
    closeRate: 18.3,
    avgPremium: 1576,
    placeRate: 75.0,
    leadsPerDay: 7.1,
  },
  {
    tenure: 12.6,
    status: "P",
    site: "CHA",
    manager: "Jovan Espinoza",
    rank: 5,
    name: "Robert Carter",
    capScore: 216,
    closeRate: 21.0,
    avgPremium: 1425,
    placeRate: 72.2,
    leadsPerDay: 6.2,
  },
  {
    tenure: 7.2,
    status: "P",
    site: "CHA",
    manager: "Jacob Fuller",
    rank: 6,
    name: "Miguel Roman",
    capScore: 216,
    closeRate: 30.0,
    avgPremium: 1144,
    placeRate: 62.8,
    leadsPerDay: 8.0,
  },
  {
    tenure: 3.7,
    status: "P",
    site: "CHA",
    manager: "Jamal Gipson",
    rank: 7,
    name: "Loren Johnson",
    capScore: 205,
    closeRate: 20.3,
    avgPremium: 1450,
    placeRate: 69.5,
    leadsPerDay: 7.9,
  },
  {
    tenure: 12.6,
    status: "P",
    site: "CHA",
    manager: "Nisrin Hajmahmoud",
    rank: 8,
    name: "Serena Cowan",
    capScore: 203,
    closeRate: 29.7,
    avgPremium: 1269,
    placeRate: 53.8,
    leadsPerDay: 6.4,
  },
  {
    tenure: 9.5,
    status: "P",
    site: "AUS",
    manager: "Mario Herrera",
    rank: 9,
    name: "Roza Veravillalba",
    capScore: 194,
    closeRate: 17.4,
    avgPremium: 2004,
    placeRate: 55.6,
    leadsPerDay: 6.9,
  },
  {
    tenure: 9.5,
    status: "P",
    site: "AUS",
    manager: "Mario Herrera",
    rank: 10,
    name: "Diana Roe",
    capScore: 186,
    closeRate: 16.9,
    avgPremium: 1410,
    placeRate: 78.0,
    leadsPerDay: 7.1,
  },
  {
    tenure: 4.9,
    status: "P",
    site: "AUS",
    manager: "Patricia Lewis",
    rank: 11,
    name: "Jonathon Mejia",
    capScore: 185,
    closeRate: 22.9,
    avgPremium: 1503,
    placeRate: 53.8,
    leadsPerDay: 8.3,
  },
  {
    tenure: 5.3,
    status: "P",
    site: "CHA",
    manager: "Jovan Espinoza",
    rank: 12,
    name: "Kenny Mclaughlin",
    capScore: 185,
    closeRate: 25.9,
    avgPremium: 1224,
    placeRate: 58.3,
    leadsPerDay: 5.4,
  },
  {
    tenure: 5.8,
    status: "P",
    site: "CHA",
    manager: "Katelyn Helms",
    rank: 13,
    name: "Keviantae Paul",
    capScore: 179,
    closeRate: 23.7,
    avgPremium: 1132,
    placeRate: 66.7,
    leadsPerDay: 5.9,
  },
  {
    tenure: 10.7,
    status: "P",
    site: "CHA",
    manager: "Jovan Espinoza",
    rank: 14,
    name: "Peter Nguyen",
    capScore: 176,
    closeRate: 23.0,
    avgPremium: 1359,
    placeRate: 56.4,
    leadsPerDay: 7.4,
  },
  {
    tenure: 16.5,
    status: "P",
    site: "CHA",
    manager: "Jovan Espinoza",
    rank: 15,
    name: "Hunter Case",
    capScore: 163,
    closeRate: 14.5,
    avgPremium: 1598,
    placeRate: 70.2,
    leadsPerDay: 6.2,
  },
  {
    tenure: 7.2,
    status: "P",
    site: "CHA",
    manager: "Vincent Blanchett",
    rank: 16,
    name: "DeAngela Harris",
    capScore: 153,
    closeRate: 19.8,
    avgPremium: 1127,
    placeRate: 68.4,
    leadsPerDay: 8.1,
  },
  {
    tenure: 9.5,
    status: "P",
    site: "AUS",
    manager: "David Druxman",
    rank: 17,
    name: "Justin Hinze",
    capScore: 152,
    closeRate: 18.1,
    avgPremium: 1101,
    placeRate: 76.3,
    leadsPerDay: 7.2,
  },
  {
    tenure: 8.4,
    status: "P",
    site: "AUS",
    manager: "Frederick Holguin",
    rank: 18,
    name: "Eric Marrs",
    capScore: 147,
    closeRate: 17.6,
    avgPremium: 1278,
    placeRate: 65.3,
    leadsPerDay: 9.1,
  },
  {
    tenure: 9.5,
    status: "P",
    site: "AUS",
    manager: "Patricia Lewis",
    rank: 19,
    name: "Jovon Holts",
    capScore: 147,
    closeRate: 19.5,
    avgPremium: 1075,
    placeRate: 69.9,
    leadsPerDay: 7.7,
  },
  {
    tenure: 8.4,
    status: "P",
    site: "AUS",
    manager: "Lanae Edwards",
    rank: 20,
    name: "Duncan Ordenana",
    capScore: 146,
    closeRate: 12.5,
    avgPremium: 1588,
    placeRate: 73.4,
    leadsPerDay: 6.4,
  },
  {
    tenure: 8.4,
    status: "P",
    site: "CHA",
    manager: "Vincent Blanchett",
    rank: 21,
    name: "Douglas Yang",
    capScore: 145,
    closeRate: 19.7,
    avgPremium: 1273,
    placeRate: 57.7,
    leadsPerDay: 7.6,
  },
  {
    tenure: 4.4,
    status: "P",
    site: "AUS",
    manager: "Mario Herrera",
    rank: 22,
    name: "Michelle Brown",
    capScore: 139,
    closeRate: 16.2,
    avgPremium: 1119,
    placeRate: 76.6,
    leadsPerDay: 6.8,
  },
  {
    tenure: 4.4,
    status: "P",
    site: "CHA",
    manager: "Patricia Lewis",
    rank: 23,
    name: "Leif Carlson",
    capScore: 137,
    closeRate: 20.0,
    avgPremium: 1225,
    placeRate: 56.1,
    leadsPerDay: 7.0,
  },
  {
    tenure: 9.5,
    status: "P",
    site: "CHA",
    manager: "David Druxman",
    rank: 24,
    name: "Kierra Smith",
    capScore: 135,
    closeRate: 19.6,
    avgPremium: 1124,
    placeRate: 61.2,
    leadsPerDay: 9.7,
  },
  {
    tenure: 4.9,
    status: "P",
    site: "CHA",
    manager: "Jamal Gipson",
    rank: 25,
    name: "Alvin Fulmore",
    capScore: 134,
    closeRate: 17.6,
    avgPremium: 1284,
    placeRate: 59.4,
    leadsPerDay: 7.4,
  },
  // Adding more agents from the dataset...
  {
    tenure: 4.9,
    status: "P",
    site: "CHA",
    manager: "Jacob Fuller",
    rank: 26,
    name: "Joe Coleman",
    capScore: 134,
    closeRate: 15.5,
    avgPremium: 1553,
    placeRate: 55.6,
    leadsPerDay: 7.1,
  },
  {
    tenure: 9.5,
    status: "P",
    site: "CHA",
    manager: "Katelyn Helms",
    rank: 27,
    name: "Kyle Williford",
    capScore: 131,
    closeRate: 21.9,
    avgPremium: 829,
    placeRate: 72.1,
    leadsPerDay: 6.4,
  },
  {
    tenure: 2.5,
    status: "P",
    site: "CHA",
    manager: "Jovan Espinoza",
    rank: 28,
    name: "Montrell Morgan",
    capScore: 130,
    closeRate: 18.7,
    avgPremium: 872,
    placeRate: 80.0,
    leadsPerDay: 7.5,
  },
  {
    tenure: 3.7,
    status: "P",
    site: "AUS",
    manager: "David Druxman",
    rank: 29,
    name: "Tim Dominguez",
    capScore: 126,
    closeRate: 16.9,
    avgPremium: 1240,
    placeRate: 60.0,
    leadsPerDay: 8.9,
  },
  {
    tenure: 9.5,
    status: "P",
    site: "AUS",
    manager: "Lanae Edwards",
    rank: 30,
    name: "Magifira Jemal",
    capScore: 122,
    closeRate: 22.1,
    avgPremium: 1106,
    placeRate: 50.0,
    leadsPerDay: 7.7,
  },

  // Trainees
  {
    tenure: 2.1,
    status: "T",
    site: "CHA",
    manager: "Jamal Gipson",
    rank: "T1",
    name: "Alexis Alexander",
    capScore: 113,
    closeRate: 7.6,
    avgPremium: 1489,
    placeRate: 100.0,
    leadsPerDay: 6.6,
  },
  {
    tenure: 2.5,
    status: "T",
    site: "AUS",
    manager: "Frederick Holguin",
    rank: "T2",
    name: "Nikia Lewis",
    capScore: 107,
    closeRate: 14.7,
    avgPremium: 1090,
    placeRate: 66.7,
    leadsPerDay: 10.2,
  },
  {
    tenure: 3.7,
    status: "T",
    site: "AUS",
    manager: "Mario Herrera",
    rank: "T3",
    name: "Dawn Dawson",
    capScore: 83,
    closeRate: 11.1,
    avgPremium: 1096,
    placeRate: 67.9,
    leadsPerDay: 6.3,
  },
  {
    tenure: 2.5,
    status: "T",
    site: "CHA",
    manager: "Jacob Fuller",
    rank: "T4",
    name: "Jeffrey Rosenberg",
    capScore: 50,
    closeRate: 11.1,
    avgPremium: 823,
    placeRate: 55.0,
    leadsPerDay: 7.2,
  },
  {
    tenure: 2.5,
    status: "T",
    site: "CHA",
    manager: "Jacob Fuller",
    rank: "T5",
    name: "Wenny Gooding",
    capScore: 47,
    closeRate: 7.5,
    avgPremium: 934,
    placeRate: 66.7,
    leadsPerDay: 5.3,
  },
  {
    tenure: 2.5,
    status: "T",
    site: "CHA",
    manager: "Jamal Gipson",
    rank: "T6",
    name: "Dawn Strong",
    capScore: 26,
    closeRate: 6.0,
    avgPremium: 870,
    placeRate: 50.0,
    leadsPerDay: 8.3,
  },

  // New trainees with zero cap score
  {
    tenure: 1.6,
    status: "T",
    site: "AUS",
    manager: "Patricia Lewis",
    rank: null,
    name: "Celeste Garcia",
    capScore: 0,
    closeRate: 15.6,
    avgPremium: 882,
    placeRate: 0,
    leadsPerDay: 7.7,
  },
  {
    tenure: 1.6,
    status: "T",
    site: "AUS",
    manager: "Mario Herrera",
    rank: null,
    name: "Crystal Kurtanic",
    capScore: 0,
    closeRate: 13.4,
    avgPremium: 1268,
    placeRate: 0,
    leadsPerDay: 8.2,
  },
  {
    tenure: 1.6,
    status: "T",
    site: "AUS",
    manager: "Patricia Lewis",
    rank: null,
    name: "Cynthia Mbaka",
    capScore: 0,
    closeRate: 14.7,
    avgPremium: 1072,
    placeRate: 0,
    leadsPerDay: 6.8,
  },
  {
    tenure: 1.6,
    status: "T",
    site: "AUS",
    manager: "Patricia Lewis",
    rank: null,
    name: "Katherine Freeman",
    capScore: 0,
    closeRate: 7.4,
    avgPremium: 819,
    placeRate: 0,
    leadsPerDay: 6.8,
  },
];

// Find or create a team
async function findOrCreateTeam(managerName, site) {
  // Look up team by manager name
  let team = await prisma.team.findFirst({
    where: {
      name: managerName,
    },
  });

  // Create the team if it doesn't exist
  if (!team) {
    team = await prisma.team.create({
      data: {
        name: managerName,
        description: `${site} Team`,
      },
    });
    console.log(`Created team for ${managerName} in ${site}`);
  }

  return team;
}

// Find or create an agent
async function findOrCreateAgent(agentData, teamId) {
  // Parse the agent's name
  const nameParts = agentData.name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  // Look up agent by name within the team
  let agent = await prisma.agent.findFirst({
    where: {
      firstName: firstName,
      lastName: lastName,
      teamId: teamId,
    },
  });

  // Create the agent if they don't exist
  if (!agent) {
    // Calculate a start date based on tenure
    const now = new Date();
    const monthsAgo = Math.floor(agentData.tenure * 4); // Convert tenure to roughly months
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthsAgo,
      now.getDate()
    );

    // Create unique email with timestamp to avoid conflicts
    const timestamp = Date.now();
    const email = `${firstName.toLowerCase()}.${lastName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")}.${timestamp}@example.com`;

    agent = await prisma.agent.create({
      data: {
        firstName,
        lastName,
        email,
        teamId,
        startDate,
        status: agentData.status,
        tenure: agentData.tenure,
        targetLeadsPerDay: Math.round(agentData.leadsPerDay),
      },
    });
    console.log(`Created agent: ${agent.firstName} ${agent.lastName}`);
  } else {
    // Update existing agent with latest data
    agent = await prisma.agent.update({
      where: { id: agent.id },
      data: {
        status: agentData.status,
        tenure: agentData.tenure,
        targetLeadsPerDay: Math.round(agentData.leadsPerDay),
      },
    });
    console.log(`Updated agent: ${agent.firstName} ${agent.lastName}`);
  }

  return agent;
}

// Add metrics for an agent
async function addAgentMetrics(agentId, agentData) {
  // Get the current month and week
  const now = new Date();
  const currentMonth = 3; // March (03/10/2025)
  const currentWeek = 2; // Second week (since the data is from 03/10/2025)

  try {
    // Check if metrics already exist for this period
    const existingMetric = await prisma.metric.findFirst({
      where: {
        agentId,
        month: currentMonth,
        week: currentWeek,
      },
    });

    if (existingMetric) {
      // Update existing metric
      await prisma.metric.update({
        where: { id: existingMetric.id },
        data: {
          closeRate: agentData.closeRate / 100, // Convert from percentage to decimal
          averagePremium: agentData.avgPremium,
          placeRate: agentData.placeRate / 100, // Convert from percentage to decimal
          capScore: agentData.capScore,
          leadsPerDay: agentData.leadsPerDay,
        },
      });
      console.log(`Updated metrics for ${agentData.name}`);
    } else {
      // Create new metric
      await prisma.metric.create({
        data: {
          agentId,
          month: currentMonth,
          week: currentWeek,
          closeRate: agentData.closeRate / 100, // Convert from percentage to decimal
          averagePremium: agentData.avgPremium,
          placeRate: agentData.placeRate / 100, // Convert from percentage to decimal
          capScore: agentData.capScore,
          leadsPerDay: agentData.leadsPerDay,
        },
      });
      console.log(`Added metrics for ${agentData.name}`);
    }
  } catch (error) {
    console.error(`Error adding metrics for ${agentData.name}:`, error);
  }
}

async function main() {
  console.log("Starting import of real agent data...");

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await prisma.metric.deleteMany({});
    await prisma.agent.deleteMany({});
    await prisma.team.deleteMany({});

    // Process each agent in the dataset
    for (const agentData of AGENT_DATA) {
      // Find or create the team
      const team = await findOrCreateTeam(agentData.manager, agentData.site);

      // Find or create the agent
      const agent = await findOrCreateAgent(agentData, team.id);

      // Add the agent's metrics
      await addAgentMetrics(agent.id, agentData);
    }

    console.log("Data import completed successfully!");
  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
