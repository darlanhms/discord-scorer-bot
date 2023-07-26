import { CacheType, ChatInputCommandInteraction, Collection, Routes, SlashCommandBuilder } from 'discord.js';

import pingCommand from './commands/ping';
import startCommand from './commands/start';
import rest from './rest';
import scoreCommand from './commands/score';
import endCommand from './commands/end';

export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;
}

export const commands = new Collection<string, Command>();

commands.set(pingCommand.data.name, pingCommand);
commands.set(startCommand.data.name, startCommand);
commands.set(scoreCommand.data.name, scoreCommand);
commands.set(endCommand.data.name, endCommand);

export async function register() {
  try {
    const parsedCommands: any[] = [];

    commands.forEach(command => parsedCommands.push(command.data.toJSON()));

    console.info(`Started refreshing ${parsedCommands.length} application (/) commands.`);

    const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: parsedCommands,
    });

    if (Array.isArray(data)) {
      console.info(`Successfully reloaded ${data.length} application (/) commands.`);
    }
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
}
