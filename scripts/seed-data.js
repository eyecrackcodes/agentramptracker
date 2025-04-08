const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    // For Supabase, we'll use the SQL editor in the dashboard
    // This function is just a placeholder in case we want to programmatically
    // create tables in the future
    console.log('Please run the create-tables.sql script in the Supabase SQL editor');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

async function seedTeamsAndAgents() {
  // ATX Teams
  const atxTeams = [
    { name: 'David Druxman', description: 'ATX Team' },
    { name: 'Patricia Lewis', description: 'ATX Team' },
    { name: 'Lanae Edwards', description: 'ATX Team' },
    { name: 'Frederick Holguin', description: 'ATX Team' },
    { name: 'Mario Herrera', description: 'ATX Team' },
    { name: 'Sandy Benson', description: 'ATX Team' }
  ];
  
  // CLT Teams
  const cltTeams = [
    { name: 'Vincent Blanchett', description: 'CLT Team' },
    { name: 'Nisrin Hajmahmoud', description: 'CLT Team' },
    { name: 'Jovan Espinoza', description: 'CLT Team' },
    { name: 'Katelyn Helms', description: 'CLT Team' },
    { name: 'Jacob Fuller', description: 'CLT Team' },
    { name: 'Jamal Gipson', description: 'CLT Team' },
    { name: 'Brent Lahti', description: 'CLT Team' },
    { name: 'Brook Coyne', description: 'CLT Team' }
  ];
  
  console.log('Seeding teams...');
  
  // Insert ATX Teams
  for (const team of atxTeams) {
    const { error } = await supabase.from('teams').insert(team);
    if (error) {
      console.error(`Error creating team ${team.name}:`, error);
    } else {
      console.log(`Created team: ${team.name}`);
    }
  }
  
  // Insert CLT Teams
  for (const team of cltTeams) {
    const { error } = await supabase.from('teams').insert(team);
    if (error) {
      console.error(`Error creating team ${team.name}:`, error);
    } else {
      console.log(`Created team: ${team.name}`);
    }
  }
  
  // Get all teams to reference for agents
  const { data: teams, error } = await supabase.from('teams').select('*');
  if (error) {
    console.error('Error fetching teams:', error);
    return;
  }
  
  // Seed some example agents
  const agents = [];
  
  // For each team, create some agents
  for (const team of teams) {
    const numAgents = Math.floor(Math.random() * 5) + 3; // 3-7 agents per team
    
    for (let i = 0; i < numAgents; i++) {
      const firstName = `Agent${i+1}`;
      const lastName = `${team.name.split(' ')[0]}Team`;
      const agent = {
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        team_id: team.id,
        start_date: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
        status: ['P', 'T', 'A'][Math.floor(Math.random() * 3)],
        tenure: Math.random() * 24, // 0-24 months
        target_leads_per_day: 8
      };
      
      const { error } = await supabase.from('agents').insert(agent);
      if (error) {
        console.error(`Error creating agent ${agent.first_name} ${agent.last_name}:`, error);
      } else {
        console.log(`Created agent: ${agent.first_name} ${agent.last_name}`);
        agents.push(agent);
      }
    }
  }
}

async function main() {
  const tablesCreated = await createTables();
  if (tablesCreated) {
    await seedTeamsAndAgents();
    console.log('Seeding completed successfully');
  }
}

main().catch(console.error); 