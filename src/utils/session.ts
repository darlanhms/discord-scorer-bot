import sessions, { Session } from '../sessions';

export function getSessionByChannel(channelId: string): Session | undefined {
  return sessions.find(session => channelId === session.channelId);
}
