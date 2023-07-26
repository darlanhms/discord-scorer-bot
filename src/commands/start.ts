import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../commands';
import sessions from '../sessions';
import { userIdToMention } from '../utils/userIdToMention';
import { getSessionByChannel } from '../utils/session';

const startCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Iniciar sessão de pontuações')
    .addStringOption(opt =>
      opt.setRequired(true).setName('users').setDescription('Usuários que participarão das pontuações'),
    ),
  async execute(interaction) {
    const session = getSessionByChannel(interaction.channelId);

    if (session) {
      await interaction.reply(
        `Já existe uma sessão nesse canal com os usuários ${userIdToMention(
          session.users,
        )}, se deseja iniciar outra finalize a antiga 🤓`,
      );
      return;
    }

    const users = interaction.options.getString('users', true);

    const possibleUserIds = users.match(/(<@+\w+>)/g);

    if (!possibleUserIds?.length) {
      await interaction.reply('Poxa, você não marcou nenhum usuário 🫠');
      return;
    }

    const userIds = possibleUserIds.map(s => s.replace(/[@<>]/g, ''));

    sessions.push({
      channelId: interaction.channelId,
      users: userIds,
    });

    await interaction.reply(
      `Sessão iniciada com os usuários ${userIdToMention(
        userIds,
      )}, digite use \`/score\` para iniciar uma pontuação`,
    );
  },
};

export default startCommand;
