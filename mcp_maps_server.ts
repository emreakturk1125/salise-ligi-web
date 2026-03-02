
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {Transport} from '@modelcontextprotocol/sdk/shared/transport.js';
import {z} from 'zod';

export interface SoccerParams {
  type: 'goal' | 'card' | 'time' | 'status' | 'theme';
  homeScore?: number;
  awayScore?: number;
  cardType?: 'yellow' | 'red';
  player?: string;
  minutes?: number;
  status?: string;
  team?: 'Home' | 'Away';
  theme?: 'classic' | 'modern' | 'rainy' | 'snowy';
}

export async function startMcpSoccerServer(
  transport: Transport,
  eventHandler: (params: SoccerParams) => void,
) {
  const server = new McpServer({
    name: 'Gemini Soccer Engine',
    version: '2.0.0',
  });

  server.tool(
    'update_score',
    'Update the match scoreboard scores',
    {home: z.number(), away: z.number()},
    async ({home, away}) => {
      eventHandler({type: 'goal', homeScore: home, awayScore: away});
      return { content: [{type: 'text', text: `Score updated to ${home}-${away}`}] };
    }
  );

  server.tool(
    'trigger_goal_celebration',
    'Trigger a large GOAL! animation on screen for a specific team',
    {team: z.enum(['Home', 'Away'])},
    async ({team}) => {
      eventHandler({type: 'status', status: 'GOAL', team});
      return { content: [{type: 'text', text: `GOAL celebration triggered for ${team}!`}] };
    }
  );

  server.tool(
    'issue_card',
    'Issue a yellow or red card to a player',
    {card: z.enum(['yellow', 'red']), player: z.string()},
    async ({card, player}) => {
      eventHandler({type: 'card', cardType: card, player});
      return { content: [{type: 'text', text: `${card.toUpperCase()} card issued to ${player}`}] };
    }
  );

  server.tool(
    'update_match_clock',
    'Set the current match minute',
    {minute: z.number()},
    async ({minute}) => {
      eventHandler({type: 'time', minutes: minute});
      return { content: [{type: 'text', text: `Match clock set to ${minute}'`}] };
    }
  );

  server.tool(
    'set_stadium_theme',
    'Change the visual theme of the stadium',
    {theme: z.enum(['classic', 'modern', 'rainy', 'snowy'])},
    async ({theme}) => {
      eventHandler({type: 'theme', theme});
      return { content: [{type: 'text', text: `Stadium theme changed to ${theme}`}] };
    }
  );

  await server.connect(transport);
}
