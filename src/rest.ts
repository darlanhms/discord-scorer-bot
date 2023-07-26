import { REST } from 'discord.js';

const rest = new REST().setToken(process.env.PRIVATE_TOKEN);

export default rest;
