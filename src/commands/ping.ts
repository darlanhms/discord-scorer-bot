import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../commands';

const pingCommand: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Am I alive? 😔'),
  async execute(interaction) {
    await interaction.reply('Pong!');
  },
};

export default pingCommand;
