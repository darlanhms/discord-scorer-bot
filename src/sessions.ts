import { InteractionResponse } from 'discord.js';

export interface CurrentScoring {
  scores: {
    userId: string;
    confirmationMessage: InteractionResponse<boolean>;
    value: number;
  }[];
}

export interface Session {
  channelId: string;
  users: string[];
  current?: CurrentScoring;
}

const sessions: Session[] = [];

export default sessions;
