import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../commands';
import { getSessionByChannel } from '../utils/session';
import sessions from '../sessions';

const endCommand: Command = {
  data: new SlashCommandBuilder().setName('end').setDescription('Finalizar seção'),
  async execute(interaction) {
    const session = getSessionByChannel(interaction.channelId);

    if (!session) {
      await interaction.reply('Não da pra terminar oque nem começou ainda 🫠');
      return;
    }

    const sessionIndex = sessions.findIndex(session => interaction.channelId === session.channelId);

    sessions.splice(sessionIndex, 1);

    await interaction.reply('Sessão finalizada, você pode iniciar outra com pessoas diferentes agora 👏🏻');
  },
};

export default endCommand;
