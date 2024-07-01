require('dotenv').config();
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_URL = 'https://v3.football.api-sports.io';
const LEAGUE_ID = 1;  // Substitua com o ID da liga desejada
const SEASON_YEAR = 2023;  // Substitua com o ano da temporada desejada
const TEAM_ID = 1;  // Substitua com o ID do time desejado

async function main() {
  await fetchAndStoreCountries();
  await fetchAndStoreLeaguesAndSeasons();
  await fetchAndStoreTeams();
  await fetchAndStorePlayersAndStatistics();
}

main()
  .catch(e => {
    console.error('Error in main execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
