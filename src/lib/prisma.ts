import { createClient } from '@supabase/supabase-js';

// Maintain the same interface so existing code can work with minimal changes
class SupabaseAdapter {
  public supabase: any;
  
  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase URL or key');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  // Team methods
  team = {
    findMany: async (options?: any) => {
      try {
        console.log("Finding teams with options:", JSON.stringify(options, null, 2));
        
        // First get all teams
        const { data: teams, error } = await this.supabase
          .from('teams')
          .select('*');
        
        if (error) {
          console.error("Error fetching teams:", error);
          throw error;
        }
        
        // If we need to include agents, fetch them separately
        if (options?.include?.agents) {
          // For each team, get its agents
          const teamsWithAgents = await Promise.all(
            teams.map(async (team: any) => {
              const { data: agents, error: agentError } = await this.supabase
                .from('agents')
                .select('id, first_name, last_name, email, start_date')
                .eq('team_id', team.id);
              
              if (agentError) {
                console.error(`Error fetching agents for team ${team.id}:`, agentError);
                throw agentError;
              }
              
              // Transform the team and include its agents
              return {
                id: team.id,
                name: team.name,
                description: team.description,
                createdAt: team.created_at,
                updatedAt: team.updated_at,
                agents: agents.map((agent: any) => ({
                  id: agent.id,
                  firstName: agent.first_name,
                  lastName: agent.last_name,
                  email: agent.email,
                  startDate: agent.start_date
                }))
              };
            })
          );
          
          return teamsWithAgents;
        } else {
          // Just return the teams without agents
          return teams.map((team: any) => ({
            id: team.id,
            name: team.name,
            description: team.description,
            createdAt: team.created_at,
            updatedAt: team.updated_at,
            agents: []
          }));
        }
      } catch (error) {
        console.error("Error in findMany teams:", error);
        throw error;
      }
    },
    
    findUnique: async (options?: any) => {
      const { data, error } = await this.supabase
        .from('teams')
        .select(options?.include?.agents ? 'id, name, description, created_at, updated_at, agents(*)' : '*')
        .eq('id', options?.where?.id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Transform to match Prisma format
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        agents: options?.include?.agents ? data.agents.map((agent: any) => ({
          id: agent.id,
          firstName: agent.first_name,
          lastName: agent.last_name,
          email: agent.email,
          teamId: agent.team_id,
          startDate: agent.start_date,
          status: agent.status,
          tenure: agent.tenure,
          targetLeadsPerDay: agent.target_leads_per_day,
          createdAt: agent.created_at,
          updatedAt: agent.updated_at
        })) : []
      };
    },
    
    create: async (options?: any) => {
      const { data, error } = await this.supabase
        .from('teams')
        .insert(options.data)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    
    update: async (options?: any) => {
      try {
        const { data, error } = await this.supabase
          .from('teams')
          .update({
            name: options.data.name,
            description: options.data.description
          })
          .eq('id', options.where.id)
          .select()
          .single();
        
        if (error) throw error;
        
        // If we need to include agents, fetch them separately
        if (options?.include?.agents) {
          const { data: agents, error: agentError } = await this.supabase
            .from('agents')
            .select('id, first_name, last_name, email, start_date')
            .eq('team_id', data.id);
          
          if (agentError) {
            console.error(`Error fetching agents for team ${data.id}:`, agentError);
            throw agentError;
          }
          
          return {
            id: data.id,
            name: data.name,
            description: data.description,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            agents: agents.map((agent: any) => ({
              id: agent.id,
              firstName: agent.first_name,
              lastName: agent.last_name,
              email: agent.email,
              startDate: agent.start_date
            }))
          };
        } else {
          return {
            id: data.id,
            name: data.name,
            description: data.description,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            agents: []
          };
        }
      } catch (error) {
        console.error("Error in update team:", error);
        throw error;
      }
    },
    
    delete: async (options?: any) => {
      try {
        const { error } = await this.supabase
          .from('teams')
          .delete()
          .eq('id', options.where.id);
        
        if (error) throw error;
        
        return { id: options.where.id };
      } catch (error) {
        console.error("Error in delete team:", error);
        throw error;
      }
    }
  };
  
  // Agent methods
  agent = {
    findUnique: async (options?: any) => {
      const { data, error } = await this.supabase
        .from('agents')
        .select(options?.include?.team ? 'id, first_name, last_name, email, team_id, start_date, status, tenure, target_leads_per_day, created_at, updated_at, team(*), metrics(*)' : 'id, first_name, last_name, email, team_id, start_date, status, tenure, target_leads_per_day, created_at, updated_at')
        .eq('id', options?.where?.id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Transform to match Prisma format
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        teamId: data.team_id,
        startDate: data.start_date,
        status: data.status,
        tenure: data.tenure,
        targetLeadsPerDay: data.target_leads_per_day,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        team: options?.include?.team ? {
          id: data.team.id,
          name: data.team.name,
          description: data.team.description,
          createdAt: data.team.created_at,
          updatedAt: data.team.updated_at
        } : undefined,
        metrics: options?.include?.metrics ? data.metrics.map((metric: any) => ({
          id: metric.id,
          agentId: metric.agent_id,
          year: metric.year,
          month: metric.month,
          week: metric.week,
          closeRate: metric.close_rate,
          averagePremium: metric.average_premium,
          placeRate: metric.place_rate,
          capScore: metric.cap_score,
          leadsPerDay: metric.leads_per_day,
          createdAt: metric.created_at,
          updatedAt: metric.updated_at
        })) : []
      };
    },
    
    findMany: async (options?: any) => {
      try {
        console.log("Finding agents with options:", JSON.stringify(options, null, 2));
        
        // First get all agents with filters
        let query = this.supabase.from('agents').select('*');
        
        if (options?.where) {
          // Add where clauses
          if (options.where.teamId) {
            query = query.eq('team_id', options.where.teamId);
          }
          
          if (options.where.status === 'A') {
            query = query.eq('status', 'A');
          } else if (options.where.status === 'P') {
            query = query.eq('status', 'P');
          } else if (options.where.status === 'T') {
            query = query.eq('status', 'T');
          } else if (options.where.status?.not === 'A') {
            query = query.not('status', 'eq', 'A');
          }
        }
        
        const { data: agents, error } = await query;
        
        if (error) {
          console.error("Error fetching agents:", error);
          throw error;
        }
        
        // If we need to include team info, fetch teams separately
        if (options?.include?.team) {
          const agentsWithTeams = await Promise.all(
            agents.map(async (agent: any) => {
              const { data: team, error: teamError } = await this.supabase
                .from('teams')
                .select('*')
                .eq('id', agent.team_id)
                .single();
              
              if (teamError) {
                console.error(`Error fetching team for agent ${agent.id}:`, teamError);
                return {
                  id: agent.id,
                  firstName: agent.first_name,
                  lastName: agent.last_name,
                  email: agent.email,
                  teamId: agent.team_id,
                  startDate: agent.start_date,
                  status: agent.status,
                  tenure: agent.tenure,
                  targetLeadsPerDay: agent.target_leads_per_day,
                  createdAt: agent.created_at,
                  updatedAt: agent.updated_at,
                  team: null
                };
              }
              
              return {
                id: agent.id,
                firstName: agent.first_name,
                lastName: agent.last_name,
                email: agent.email,
                teamId: agent.team_id,
                startDate: agent.start_date,
                status: agent.status,
                tenure: agent.tenure,
                targetLeadsPerDay: agent.target_leads_per_day,
                createdAt: agent.created_at,
                updatedAt: agent.updated_at,
                team: team ? {
                  id: team.id,
                  name: team.name,
                  description: team.description,
                  createdAt: team.created_at,
                  updatedAt: team.updated_at
                } : null
              };
            })
          );
          
          return agentsWithTeams;
        } else {
          // Just return agents without team info
          return agents.map((agent: any) => ({
            id: agent.id,
            firstName: agent.first_name,
            lastName: agent.last_name,
            email: agent.email,
            teamId: agent.team_id,
            startDate: agent.start_date,
            status: agent.status,
            tenure: agent.tenure,
            targetLeadsPerDay: agent.target_leads_per_day,
            createdAt: agent.created_at,
            updatedAt: agent.updated_at
          }));
        }
      } catch (error) {
        console.error("Error in findMany agents:", error);
        throw error;
      }
    },
    
    create: async (options?: any) => {
      const { data, error } = await this.supabase
        .from('agents')
        .insert({
          first_name: options.data.firstName,
          last_name: options.data.lastName,
          email: options.data.email,
          team_id: options.data.teamId,
          start_date: options.data.startDate,
          status: options.data.status,
          tenure: options.data.tenure,
          target_leads_per_day: options.data.targetLeadsPerDay
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        teamId: data.team_id,
        startDate: data.start_date,
        status: data.status,
        tenure: data.tenure,
        targetLeadsPerDay: data.target_leads_per_day,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    
    update: async (options?: any) => {
      try {
        const { data, error } = await this.supabase
          .from('agents')
          .update({
            first_name: options.data.firstName,
            last_name: options.data.lastName,
            email: options.data.email,
            team_id: options.data.teamId,
            start_date: options.data.startDate,
            status: options.data.status,
            tenure: options.data.tenure,
            target_leads_per_day: options.data.targetLeadsPerDay
          })
          .eq('id', options.where.id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          teamId: data.team_id,
          startDate: data.start_date,
          status: data.status,
          tenure: data.tenure,
          targetLeadsPerDay: data.target_leads_per_day,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      } catch (error) {
        console.error("Error updating agent:", error);
        throw error;
      }
    },
    
    delete: async (options?: any) => {
      try {
        const { error } = await this.supabase
          .from('agents')
          .delete()
          .eq('id', options.where.id);
        
        if (error) throw error;
        
        return { success: true };
      } catch (error) {
        console.error("Error deleting agent:", error);
        throw error;
      }
    }
  };
  
  // Metric methods
  metric = {
    findMany: async (options?: any) => {
      let query = this.supabase.from('metrics').select('*');
      
      if (options?.where) {
        if (options.where.agentId) {
          query = query.eq('agent_id', options.where.agentId);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform to match Prisma format
      return data.map((metric: any) => ({
        id: metric.id,
        agentId: metric.agent_id,
        month: metric.month,
        week: metric.week,
        closeRate: metric.close_rate,
        averagePremium: metric.average_premium,
        placeRate: metric.place_rate,
        capScore: metric.cap_score,
        leadsPerDay: metric.leads_per_day,
        createdAt: metric.created_at,
        updatedAt: metric.updated_at
      }));
    },
    
    create: async (options?: any) => {
      const { data, error } = await this.supabase
        .from('metrics')
        .insert({
          agent_id: options.data.agentId,
          month: options.data.month,
          week: options.data.week,
          close_rate: options.data.closeRate,
          average_premium: options.data.averagePremium,
          place_rate: options.data.placeRate,
          cap_score: options.data.capScore,
          leads_per_day: options.data.leadsPerDay
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        agentId: data.agent_id,
        month: data.month,
        week: data.week,
        closeRate: data.close_rate,
        averagePremium: data.average_premium,
        placeRate: data.place_rate,
        capScore: data.cap_score,
        leadsPerDay: data.leads_per_day,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    
    update: async (options?: any) => {
      const { data, error } = await this.supabase
        .from('metrics')
        .update({
          month: options.data.month,
          week: options.data.week,
          close_rate: options.data.closeRate,
          average_premium: options.data.averagePremium,
          place_rate: options.data.placeRate,
          cap_score: options.data.capScore,
          leads_per_day: options.data.leadsPerDay
        })
        .eq('id', options.where.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        agentId: data.agent_id,
        month: data.month,
        week: data.week,
        closeRate: data.close_rate,
        averagePremium: data.average_premium,
        placeRate: data.place_rate,
        capScore: data.cap_score,
        leadsPerDay: data.leads_per_day,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    
    findFirst: async (options?: any) => {
      const { data, error } = await this.supabase
        .from('metrics')
        .select('*')
        .eq('agent_id', options.where.agentId)
        .eq('month', options.where.month)
        .eq('week', options.where.week)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        throw error;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        agentId: data.agent_id,
        month: data.month,
        week: data.week,
        closeRate: data.close_rate,
        averagePremium: data.average_premium,
        placeRate: data.place_rate,
        capScore: data.cap_score,
        leadsPerDay: data.leads_per_day,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    
    deleteMany: async (options?: any) => {
      try {
        // Build the query based on the where clause
        let query = this.supabase.from('metrics').delete();
        
        if (options?.where) {
          if (options.where.agentId) {
            query = query.eq('agent_id', options.where.agentId);
          }
          
          // Add other filters as needed
        }
        
        const { error } = await query;
        
        if (error) throw error;
        
        return { count: 0 }; // Cannot get actual count from Supabase delete
      } catch (error) {
        console.error("Error in deleteMany metrics:", error);
        throw error;
      }
    }
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: SupabaseAdapter | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new SupabaseAdapter();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
