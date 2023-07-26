/* eslint-disable no-undef-init */
import {
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  ComponentType,
  InteractionResponse,
  SlashCommandBuilder,
} from 'discord.js';
import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { Command } from '../commands';
import { getSessionByChannel } from '../utils/session';
import { userIdToMention } from '../utils/userIdToMention';
import { CurrentScoring } from '../sessions';

const makeUserScoreTable = (userIds: string[]): string => {
  return userIds.map(id => `- ${userIdToMention(id)}`).join('\n');
};

const handleFinishedScoring = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  answer: InteractionResponse<boolean>,
  score?: CurrentScoring,
) => {
  const scores = score?.scores;
  if (!scores) {
    return;
  }

  const finalScoreText = scores.map(scr => `- ${userIdToMention(scr.userId)}: \`${scr.value}\``).join('\n');

  let lower: number | undefined = undefined;
  let higher: number | undefined = undefined;

  const average =
    scores.reduce((previous, current) => {
      if (!lower) {
        lower = current.value;
      }

      if (!higher) {
        higher = current.value;
      }

      if (current.value < lower) {
        lower = current.value;
      }
      if (current.value > higher) {
        higher = current.value;
      }

      return previous + current.value;
    }, 0) / scores.length;

  const averageText = `Média: \`${Math.floor(average)}\` | Menor: \`${lower}\` | Maior: \`${higher}\``;

  await interaction.channel?.send({
    content: `As pontuações finais foram:\n${finalScoreText}\n\n${averageText}`,
  });

  await answer.delete();
};

const fibonacci = ['1', '2', '3', '5', '8', '13', '21', '34', '55', '89'];

const scoreCommand: Command = {
  data: new SlashCommandBuilder().setName('score').setDescription('Iniciar pontuação'),
  async execute(interaction) {
    if (!interaction.channel) {
      return;
    }

    const session = getSessionByChannel(interaction.channelId);

    if (!session) {
      await interaction.reply('Ainda não há uma sessão ativa nesse canal, inicie uma digitando `/start` 😉');
      return;
    }

    const rows: ActionRowBuilder<ButtonBuilder>[] = [
      new ActionRowBuilder<ButtonBuilder>(),
      new ActionRowBuilder<ButtonBuilder>(),
    ];

    session.current = undefined;

    fibonacci.forEach((opt, index) => {
      const rowToPush = index <= 4 ? rows[0] : rows[1];

      rowToPush.addComponents(new ButtonBuilder().setCustomId(opt).setLabel(opt).setStyle(ButtonStyle.Primary));
    });

    const selectAnswer = await interaction.reply({
      content: `Esperando os usuários informarem a pontuação\n${makeUserScoreTable(session.users)}`,
      components: rows,
    });

    const message = await selectAnswer.fetch();

    await message.react('✅');

    message
      .awaitReactions({
        filter: async (react, user) => {
          const alreadyScored = session.current?.scores.find(({ userId }) => user.id === userId);
          const isUserValid = session.users.includes(user.id);
          const realCount = react.count - 1;

          if (isUserValid && realCount >= session.users.length) {
            handleFinishedScoring(interaction, selectAnswer, session.current);
            return false;
          }

          return !!alreadyScored && isUserValid && react.emoji.name === '✅';
        },
        time: 5 * 60 * 1000,
      })
      .catch(console.error);

    while (true) {
      try {
        const confirmation = await selectAnswer.awaitMessageComponent({
          filter: int => {
            return session.users.includes(int.user.id);
          },
          time: 5 * 60 * 1000,
          componentType: ComponentType.Button,
        });

        if (!session.current) {
          session.current = { scores: [] };
        }

        const alreadyScored = session.current?.scores.find(({ userId }) => confirmation.user.id === userId);

        if (alreadyScored) {
          await alreadyScored.confirmationMessage.delete();
        }

        if (alreadyScored) {
          alreadyScored.value = Number(confirmation.customId);
          const interaction = await confirmation.reply({
            content: `Você selecionou ${confirmation.customId}, confirme reagindo com ✅`,
            ephemeral: true,
          });

          alreadyScored.confirmationMessage = interaction;
        } else {
          const interaction = await confirmation.reply({
            content: `Você selecionou ${confirmation.customId}, confirme reagindo com ✅`,
            ephemeral: true,
          });

          session.current.scores.push({
            userId: confirmation.user.id,
            value: Number(confirmation.customId),
            confirmationMessage: interaction,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
};

export default scoreCommand;
