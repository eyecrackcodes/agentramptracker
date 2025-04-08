import { createClient } from '@supabase/supabase-js';

// Maintain the same interface so existing code can work with minimal changes
class SupabaseAdapter {
  public supabase: any;
  
  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase URL or key');
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
      try {
        // Build the select string based on what's being included
        let selectString = 'id, first_name, last_name, email, team_id, start_date, status, tenure, target_leads_per_day, created_at, updated_at';
        
        if (options?.include?.team) {
          selectString += ', team:teams(id, name, description, created_at, updated_at)';
        }
        
        if (options?.include?.metrics) {
          selectString += ', metrics(*)';
        }

        const { data, error } = await this.supabase
          .from('agents')
          .select(selectString)
          .eq('id', options?.where?.id)
          .single();
        
        if (error) {
          console.error("Error in findUnique agent:", error);
          throw error;
        }
        
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
      } catch (error) {
        console.error("Error in findUnique agent:", error);
        throw error;
      }
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

  // Coaching Session methods
  coachingSession = {
    findMany: async (options?: any) => {
      try {
        let query = this.supabase
          .from('coaching_sessions')
          .select(`
            *,
            agent:agent_id (
              id,
              firstName:first_name,
              lastName:last_name,
              email,
              teamId:team_id,
              startDate:start_date,
              status,
              tenure,
              targetLeadsPerDay:target_leads_per_day,
              createdAt:created_at,
              updatedAt:updated_at
            )
          `);

        // Apply filters from options
        if (options?.where) {
          if (options.where.agent_id) {
            query = query.eq('agent_id', options.where.agent_id);
          } else if (options.where.agentId) {
            query = query.eq('agent_id', options.where.agentId);
          }
          if (options.where.manager_id) {
            query = query.eq('manager_id', options.where.manager_id);
          } else if (options.where.managerId) {
            query = query.eq('manager_id', options.where.managerId);
          }
          if (options.where.date?.gte) {
            query = query.gte('date', options.where.date.gte);
          }
          if (options.where.date?.lte) {
            query = query.lte('date', options.where.date.lte);
          }
        }

        // Apply ordering
        if (options?.orderBy) {
          const [field, direction] = Object.entries(options.orderBy)[0];
          query = query.order(field, { ascending: direction === 'asc' });
        } else {
          // Default order by date, most recent first
          query = query.order('date', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform the raw data to match our expected format
        // Include both action_items and also map next_steps to nextSteps for backward compatibility
        return data.map((session: any) => ({
          id: session.id,
          agent_id: session.agent_id,
          manager_id: session.manager_id,
          session_type: session.session_type,
          type: session.type,
          date: session.date,
          notes: session.notes,
          action_items: session.action_items, // Include action_items
          next_steps: session.next_steps,
          created_at: session.created_at,
          updated_at: session.updated_at,
          // Also include the camelCase versions for backward compatibility
          agentId: session.agent_id,
          managerId: session.manager_id,
          sessionType: session.session_type,
          nextSteps: session.next_steps,
          followUpDate: session.follow_up_date,
          createdAt: session.created_at,
          updatedAt: session.updated_at,
          agent: session.agent ? {
            id: session.agent.id,
            firstName: session.agent.firstName,
            lastName: session.agent.lastName,
            email: session.agent.email,
            teamId: session.agent.teamId,
            startDate: session.agent.startDate,
            status: session.agent.status,
            tenure: session.agent.tenure,
            targetLeadsPerDay: session.agent.targetLeadsPerDay,
            createdAt: session.agent.createdAt,
            updatedAt: session.agent.updatedAt
          } : null
        }));
      } catch (error) {
        console.error("Error in findMany coaching sessions:", error);
        throw error;
      }
    },

    create: async (options?: any) => {
      try {
        // Handle both agentId and agent_id formats
        const agent_id = options.data.agent_id || options.data.agentId;
        const manager_id = options.data.manager_id || options.data.managerId;
        
        if (!agent_id) {
          throw new Error('agent_id is required');
        }

        if (!manager_id) {
          throw new Error('manager_id is required');
        }

        const sessionType = options.data.session_type || options.data.type || 'one_on_one';

        // Log the data being sent
        console.log('Creating coaching session with data:', JSON.stringify({
          agent_id,
          manager_id,
          session_type: sessionType,
          type: sessionType,
          date: options.data.date,
          notes: options.data.notes,
          action_items: options.data.action_items,
          next_steps: options.data.next_steps || options.data.action_items
        }, null, 2));

        // Explicitly include both field name variants in the insert
        const now = new Date().toISOString();
        const insertData = {
          agent_id,
          manager_id,
          session_type: sessionType, // Required field
          type: sessionType, // Optional duplicate field
          date: options.data.date,
          notes: options.data.notes,
          action_items: options.data.action_items,
          next_steps: options.data.next_steps || options.data.action_items,
          created_at: now,
          updated_at: now // Explicitly set as exact Date object, not string
        };

        console.log('Final insert data:', JSON.stringify(insertData, null, 2));

        const { data, error } = await this.supabase
          .from('coaching_sessions')
          .insert(insertData)
          .select(`
            id,
            agent_id,
            manager_id,
            session_type,
            type,
            date,
            notes,
            action_items,
            next_steps,
            created_at,
            updated_at,
            agent:agent_id (
              id,
              first_name,
              last_name,
              email,
              team_id,
              start_date,
              status,
              tenure,
              target_leads_per_day,
              created_at,
              updated_at
            )
          `)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (!data) {
          throw new Error('No data returned from insert');
        }

        // Transform the response to match our expected format
        return {
          id: data.id,
          agent_id: data.agent_id,
          manager_id: data.manager_id,
          type: data.type,
          session_type: data.session_type,
          date: data.date,
          notes: data.notes,
          action_items: data.action_items, 
          next_steps: data.next_steps,
          created_at: data.created_at,
          updated_at: data.updated_at,
          agent: data.agent ? {
            id: data.agent.id,
            firstName: data.agent.first_name,
            lastName: data.agent.last_name,
            email: data.agent.email,
            teamId: data.agent.team_id,
            startDate: data.agent.start_date,
            status: data.agent.status,
            tenure: data.agent.tenure,
            targetLeadsPerDay: data.agent.target_leads_per_day,
            createdAt: data.agent.created_at,
            updatedAt: data.agent.updated_at
          } : null
        };
      } catch (error) {
        console.error('Error in create coaching session:', error);
        throw error;
      }
    },

    update: async (options?: any) => {
      try {
        const { data, error } = await this.supabase
          .from('coaching_sessions')
          .update({
            session_type: options.data.sessionType,
            date: options.data.date,
            notes: options.data.notes,
            next_steps: options.data.nextSteps,
            follow_up_date: options.data.followUpDate
          })
          .eq('id', options.where.id)
          .select(`
            *,
            agent:agent_id (
              id,
              firstName:first_name,
              lastName:last_name,
              email,
              teamId:team_id,
              startDate:start_date,
              status,
              tenure,
              targetLeadsPerDay:target_leads_per_day,
              createdAt:created_at,
              updatedAt:updated_at
            )
          `)
          .single();

        if (error) throw error;

        return {
          id: data.id,
          agentId: data.agent_id,
          managerId: data.manager_id,
          sessionType: data.session_type,
          date: data.date,
          notes: data.notes,
          nextSteps: data.next_steps,
          followUpDate: data.follow_up_date,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          agent: data.agent ? {
            id: data.agent.id,
            firstName: data.agent.firstName,
            lastName: data.agent.lastName,
            email: data.agent.email,
            teamId: data.agent.teamId,
            startDate: data.agent.startDate,
            status: data.agent.status,
            tenure: data.agent.tenure,
            targetLeadsPerDay: data.agent.targetLeadsPerDay,
            createdAt: data.agent.createdAt,
            updatedAt: data.agent.updatedAt
          } : null
        };
      } catch (error) {
        console.error("Error in update coaching session:", error);
        throw error;
      }
    },

    delete: async (options?: any) => {
      try {
        const { error } = await this.supabase
          .from('coaching_sessions')
          .delete()
          .eq('id', options.where.id);

        if (error) throw error;

        return { id: options.where.id };
      } catch (error) {
        console.error("Error in delete coaching session:", error);
        throw error;
      }
    }
  };

  developmentGoal = {
    findMany: async (params: any) => {
      const { where } = params;
      const query = this.supabase
        .from('development_goals')
        .select('*');

      if (where?.agent_id) {
        query.eq('agent_id', where.agent_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },

    create: async (params: any) => {
      const { data: goalData } = params;
      const { data, error } = await this.supabase
        .from('development_goals')
        .insert([{
          agent_id: goalData.agent_id,
          goal_type: goalData.goal_type,
          description: goalData.description,
          target_date: goalData.target_date,
          status: goalData.status,
          progress: goalData.progress,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (params: any) => {
      const { where, data: updateData } = params;
      const { data, error } = await this.supabase
        .from('development_goals')
        .update({
          status: updateData.status,
          progress: updateData.progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', where.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (params: any) => {
      const { where } = params;
      const { data, error } = await this.supabase
        .from('development_goals')
        .delete()
        .eq('id', where.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };

  callScore = {
    findMany: async (params: any) => {
      try {
        const { where } = params;
        console.log('SupabaseAdapter callScore.findMany called with:', where);
        
        // Use a more defensive approach with error handling
        const { data, error } = await this.supabase
          .from('call_scores')
          .select('id, agent_id, manager_id, date, call_type, closing_score, notes')
          .match(where || {});

        if (error) {
          console.error('Error in callScore.findMany:', error);
          throw error;
        }
        
        if (!data) {
          console.log('No call scores found');
          return [];
        }
        
        // Transform scores to match the frontend's expected format
        return data.map((score: any) => ({
          ...score,
          // Map closing_score to script_adherence for the frontend
          script_adherence: Math.round(score.closing_score || 0)
        }));
      } catch (error) {
        console.error('Caught error in callScore.findMany:', error);
        // Return empty array instead of throwing to be more resilient
        return [];
      }
    },

    create: async (params: any) => {
      try {
        const { data: createData } = params;
        console.log('SupabaseAdapter callScore.create received data:', createData);
        
        // Ensure we're using a valid numeric value for script_adherence
        let scriptAdherenceValue = 0;
        if (createData.script_adherence !== undefined && createData.script_adherence !== null) {
          // Ensure it's a number
          if (typeof createData.script_adherence === 'string') {
            scriptAdherenceValue = parseInt(createData.script_adherence, 10);
          } else if (typeof createData.script_adherence === 'number') {
            scriptAdherenceValue = createData.script_adherence;
          }
        }
        
        console.log(`Script adherence value being used: ${scriptAdherenceValue} (${typeof scriptAdherenceValue})`);
        
        // Double check that we're using a number
        if (typeof scriptAdherenceValue !== 'number' || isNaN(scriptAdherenceValue)) {
          console.error('Invalid script adherence value, forcing to 0');
          scriptAdherenceValue = 0;
        } else {
          console.log(`Confirmed valid numeric value: ${scriptAdherenceValue}`);
        }
        
        const insertData: any = {
          agent_id: createData.agent_id,
          date: createData.date,
          call_type: createData.call_type || 'final_expense',
          notes: createData.notes || null,
          // Add manager_id which is required by the database
          manager_id: createData.manager_id || 'db22d3d4-f970-45e3-ae5d-9ce20f236255', // Default manager ID if not provided
          // Map script_adherence to closing_score and set other scores to 0
          closing_score: scriptAdherenceValue,
          opening_score: 0,
          discovery_score: 0,
          solution_score: 0,
          // Add timestamps
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Using database-compatible data for insert:', {
          ...insertData,
          closing_score_type: typeof insertData.closing_score
        });
        
        const { data, error } = await this.supabase
          .from('call_scores')
          .insert(insertData)
          .select('id, agent_id, date, call_type, closing_score, notes')
          .single();

        if (error) {
          console.error('Error in callScore.create:', error);
          throw error;
        }
        
        if (!data) {
          throw new Error('No data returned from call score insert');
        }
        
        // Transform the response to match the frontend expectations
        return {
          ...data,
          script_adherence: Math.round(data.closing_score || 0)
        };
      } catch (error) {
        console.error('Error in callScore.create:', error);
        throw error;
      }
    },

    update: async (params: any) => {
      try {
        const { where, data: updateData } = params;
        
        // Create an update structure using the correct field names
        const now = new Date().toISOString();
        const dbUpdateData: any = {
          date: updateData.date,
          call_type: updateData.call_type,
          notes: updateData.notes,
          updated_at: now // Always update the timestamp
        };
        
        // Include manager_id if provided
        if (updateData.manager_id) {
          dbUpdateData.manager_id = updateData.manager_id;
        }
        
        // Map script_adherence to closing_score
        if (updateData.script_adherence !== undefined) {
          dbUpdateData.closing_score = Math.floor(updateData.script_adherence);
        }
        
        const { data, error } = await this.supabase
          .from('call_scores')
          .update(dbUpdateData)
          .match(where)
          .select('id, agent_id, manager_id, date, call_type, closing_score, notes')
          .single();

        if (error) {
          console.error('Error in callScore.update:', error);
          throw error;
        }
        
        // Map closing_score back to script_adherence for the UI
        return {
          ...data,
          script_adherence: Math.round(data.closing_score || 0)
        };
      } catch (error) {
        console.error('Error in callScore.update:', error);
        throw error;
      }
    },

    delete: async (params: any) => {
      const { where } = params;
      const { data, error } = await this.supabase
        .from('call_scores')
        .delete()
        .match(where)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };
}

// Ensure we only create one instance of the adapter
const globalForPrisma = globalThis as unknown as {
  prisma: SupabaseAdapter | undefined;
};

// Create a singleton instance
export const prisma = globalForPrisma.prisma ?? new SupabaseAdapter();

// In development, save the instance to avoid creating multiple instances
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function getAgents() {
  const agents = await prisma.agent.findMany({
    include: {
      team: true,
    },
    orderBy: {
      firstName: 'asc',
    },
  });

  return agents;
}

export async function getAgentById(agentId: string) {
  const prisma = new SupabaseAdapter();
  try {
    const { data: agent, error } = await prisma.supabase
      .from('agents')
      .select('*, teams(*)')
      .eq('id', agentId)
      .single();

    if (error) throw error;
    if (!agent) return null;

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
      team: agent.teams ? {
        id: agent.teams.id,
        name: agent.teams.name,
        description: agent.teams.description,
        createdAt: agent.teams.created_at,
        updatedAt: agent.teams.updated_at
      } : null
    };
  } catch (error) {
    console.error('Error fetching agent:', error);
    throw error;
  }
}
