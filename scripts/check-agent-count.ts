import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Running agent database diagnostic...");

  // Count total agents
  const totalAgents = await prisma.agent.count();
  console.log(`Total agents in database: ${totalAgents}`);

  // Count agents by team
  const teams = await prisma.team.findMany({
    include: {
      _count: {
        select: { agents: true },
      },
    },
  });

  console.log("\nAgents by team:");
  teams.forEach((team) => {
    console.log(`- ${team.name}: ${team._count.agents} agents`);
  });

  // Count agents by status
  const agentsByStatus = await prisma.agent.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  console.log("\nAgents by status:");
  agentsByStatus.forEach((group) => {
    console.log(`- ${group.status || "No status"}: ${group._count.id} agents`);
  });

  // Get the first 5 agents to check data quality
  const sampleAgents = await prisma.agent.findMany({
    take: 5,
    include: {
      team: true,
    },
  });

  console.log("\nSample agents:");
  sampleAgents.forEach((agent) => {
    console.log(`- ${agent.firstName} ${agent.lastName} (${agent.email})`);
    console.log(`  Team: ${agent.team.name}`);
    console.log(`  Status: ${agent.status || "None"}`);
    console.log(`  Tenure: ${agent.tenure || "None"}`);
  });

  // Check for duplicate emails (may cause import issues)
  const emailCounts = await prisma.$queryRaw`
    SELECT email, COUNT(*) as count
    FROM Agent
    GROUP BY email
    HAVING COUNT(*) > 1
  `;
  console.log("\nDuplicate emails:", emailCounts);
}

main()
  .catch((e) => {
    console.error("Error running diagnostics:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
