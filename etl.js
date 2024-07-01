// const axios = require('axios');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// const API_KEY = '36389880fabe454f6f2943c0d26b8274';
// const BASE_URL = 'https://v3.football.api-sports.io/';

// async function fetchAndStoreCountries() {
//     console.log('Fetching countries...');
//     const response = await axios.get(`${BASE_URL}countries`, {
//         headers: { 'x-apisports-key': API_KEY }
//     });
//     const countries = response.data.response;
//     for (const country of countries) {
//         try {
//             await prisma.country.create({
//                 data: {
//                     name: country.name,
//                     code: country.code,
//                     flag: country.flag
//                 }
//             });
//             console.log(`Stored country: ${country.name}`);
//         } catch (error) {
//             if (error.code === 'P2002') {
//                 console.log(`Country ${country.name} already exists.`);
//             } else {
//                 console.error(`Error storing country ${country.name}:`, error);
//             }
//         }
//     }
// }

// async function fetchAndStoreLeagues() {
//     console.log('Fetching leagues...');
//     const response = await axios.get(`${BASE_URL}leagues`, {
//         headers: { 'x-apisports-key': API_KEY }
//     });
//     const leagues = response.data.response;
//     for (const leagueData of leagues) {
//         const country = await prisma.country.findUnique({
//             where: { name: leagueData.country.name }
//         });
//         if (country) {
//             try {
//                 await prisma.league.create({
//                     data: {
//                         name: leagueData.league.name,
//                         type: leagueData.league.type,
//                         logo: leagueData.league.logo,
//                         countryId: country.id
//                     }
//                 });
//                 console.log(`Stored league: ${leagueData.league.name}`);
//             } catch (error) {
//                 console.error(`Error storing league ${leagueData.league.name}:`, error);
//             }
//         }
//     }
// }
// async function fetchAndStoreSeasons() {
//   console.log('Fetching seasons...');
//   const leagues = await PrismaClient.league.findMany();

//   for (const league of leagues) {
//     console.log(`Fetching seasons for league ${league.name}`);
//     const response = await axios.get(`${BASE_URL}leagues/seasons`, {
//       params: { league: league.id },
//       headers: { 'x-apisports-key': API_KEY },
//     });

//     const seasonsData = response.data.response;
//     if (seasonsData.length > 0) {
//       for (const seasonData of seasonsData) {
//         try {
//           console.log(`Storing season: ${seasonData} for league ${league.name}`);
//           await prismaClient.season.create({
//             data: {
//               year: seasonData,
//               start: new Date(seasonData.start),
//               end: new Date(seasonData.end),
//               current: seasonData.current,
//               leagueId: league.id,
//             },
//           });
//         } catch (error) {
//           console.error(
//             `Error storing season ${seasonData} for league ${league.name}:`,
//             error
//           );
//         }
//       }
//     } else {
//       console.log(`No seasons found for league ${league.name}`);
//     }

//     console.log(`Finished fetching and storing seasons for league ${league.name}`);
//   }

//   console.log('All seasons fetched and stored successfully.');
// }
// async function fetchAndStoreTeams() {
//   console.log('Fetching teams...');
//   try {
//       const leagues = await prisma.league.findMany();
//       for (const league of leagues) {
//           console.log(`Fetching teams for league ${league.name}`);
//           try {
//               const response = await axios.get(`${BASE_URL}teams`, {
//                   params: { league: league.id },
//                   headers: { 'x-apisports-key': API_KEY }
//               });
//               const teams = response.data.response;
//               for (const team of teams) {
//                   console.log(`Processing team: ${team.name}`);
//                   const country = await prisma.country.findUnique({
//                       where: { name: team.country.name }
//                   });
//                   if (country) {
//                       console.log(`Storing team: ${team.name}`);
//                       await prisma.team.create({
//                           data: {
//                               name: team.name,
//                               logo: team.logo,
//                               countryId: country.id
//                           }
//                       });
//                       console.log(`Stored team: ${team.name}`);
//                   } else {
//                       console.log(`Country not found for team: ${team.name}`);
//                   }
//               }
//           } catch (error) {
//               console.error(`Error fetching or storing teams for league ${league.name}:`, error);
//           }
//       }
//   } catch (error) {
//       console.error('Error fetching leagues:', error);
//   }
// }

// async function fetchAndStoreCoaches() {
//   console.log('Fetching coaches...');
//   try {
//       const teams = await prisma.team.findMany();
//       for (const team of teams) {
//           console.log(`Fetching coaches for team ${team.name}`);
//           try {
//               const response = await axios.get(`${BASE_URL}coaches`, {
//                   params: { team: team.id },
//                   headers: { 'x-apisports-key': API_KEY }
//               });
//               const coaches = response.data.response;
//               for (const coach of coaches) {
//                   console.log(`Storing coach: ${coach.name}`);
//                   await prisma.coach.create({
//                       data: {
//                           name: coach.name,
//                           nationality: coach.nationality,
//                           teamId: team.id
//                       }
//                   });
//                   console.log(`Stored coach: ${coach.name}`);
//               }
//           } catch (error) {
//               console.error(`Error fetching or storing coaches for team ${team.name}:`, error);
//           }
//       }
//   } catch (error) {
//       console.error('Error fetching teams:', error);
//   }
// }

// async function fetchAndStoreStadiums() {
//   console.log('Fetching stadiums...');
//   try {
//       const response = await axios.get(`${BASE_URL}stadiums`, {
//           headers: { 'x-apisports-key': API_KEY }
//       });
//       const stadiums = response.data.response;
//       for (const stadium of stadiums) {
//           console.log(`Storing stadium: ${stadium.name}`);
//           await prisma.stadium.create({
//               data: {
//                   name: stadium.name,
//                   city: stadium.city
//               }
//           });
//           console.log(`Stored stadium: ${stadium.name}`);
//       }
//   } catch (error) {
//       console.error('Error fetching or storing stadiums:', error);
//   }
// }

// async function fetchAndStorePlayers() {
//   console.log('Fetching players...');
//   try {
//       const teams = await prisma.team.findMany();
//       for (const team of teams) {
//           console.log(`Fetching players for team ${team.name}`);
//           try {
//               const response = await axios.get(`${BASE_URL}players`, {
//                   params: { team: team.id },
//                   headers: { 'x-apisports-key': API_KEY }
//               });
//               const players = response.data.response;
//               for (const player of players) {
//                   console.log(`Storing player: ${player.name}`);
//                   await prisma.player.create({
//                       data: {
//                           name: player.name,
//                           age: player.age,
//                           nationality: player.nationality,
//                           position: player.position,
//                           teamId: team.id
//                       }
//                   });
//                   console.log(`Stored player: ${player.name}`);
//               }
//           } catch (error) {
//               console.error(`Error fetching or storing players for team ${team.name}:`, error);
//           }
//       }
//   } catch (error) {
//       console.error('Error fetching teams:', error);
//   }
// }

// async function fetchAndStoreStatistics() {
//   console.log('Fetching statistics...');
//   try {
//       const players = await prisma.player.findMany();
//       for (const player of players) {
//           console.log(`Fetching statistics for player ${player.name}`);
//           try {
//               const response = await axios.get(`${BASE_URL}players/statistics`, {
//                   params: { player: player.id },
//                   headers: { 'x-apisports-key': API_KEY }
//               });
//               const statistics = response.data.response;
//               for (const statistic of statistics) {
//                   console.log(`Storing statistics for player: ${player.name}`);
//                   await prisma.statistic.create({
//                       data: {
//                           goals: statistic.goals,
//                           assists: statistic.assists,
//                           games: statistic.games,
//                           minutes: statistic.minutes,
//                           playerId: player.id,
//                           seasonId: statistic.seasonId // ensure this matches your schema correctly
//                       }
//                   });
//                   console.log(`Stored statistics for player: ${player.name}`);
//               }
//           } catch (error) {
//               console.error(`Error fetching or storing statistics for player ${player.name}:`, error);
//           }
//       }
//   } catch (error) {
//       console.error('Error fetching players:', error);
//   }
// }
// async function main() {
//     // await fetchAndStoreCountries();
//     // await fetchAndStoreLeagues();
//     await fetchAndStoreSeasons();
//     await fetchAndStoreTeams();
//     await fetchAndStoreCoaches();
//     await fetchAndStoreStadiums();
//     await fetchAndStorePlayers();
//     await fetchAndStoreStatistics();
// }

// main()
//     .catch(e => console.error(e))
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const prisma = new PrismaClient();
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_URL = 'https://v3.football.api-sports.io/';
const RATE_LIMIT_DELAY = 200; // 0.2 segundos de atraso para garantir que não exceda 300 requisições por minuto
const CHECKPOINT_FILE = 'etl_checkpoint.json';

// Função para buscar dados da API com paralelização limitada
async function fetchData(endpoint, params = {}) {
  console.log(`Fetching data from endpoint: ${endpoint} with params: ${JSON.stringify(params)}`);
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY)); // Adiciona um pequeno atraso entre requisições
  const response = await axios.get(`${API_URL}${endpoint}`, {
    params,
    headers: { 'x-apisports-key': API_KEY }
  });
  console.log(`Response from ${endpoint}:`, JSON.stringify(response.data, null, 2));
  return response.data.response;
}

// Função para verificar se um item já existe no banco de dados
async function exists(model, where) {
  const count = await prisma[model].count({ where });
  return count > 0;
}

// Função para carregar checkpoints
function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    const data = fs.readFileSync(CHECKPOINT_FILE);
    return JSON.parse(data);
  }
  return { countries: false, leagues: false, seasons: false, teams: false, currentLeagueIndex: 0 };
}

// Função para salvar checkpoints
function saveCheckpoint(checkpoint) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint));
}

// Função para inserir países
async function insertCountries(checkpoint) {
  if (checkpoint.countries) return;
  console.log('Inserting countries...');
  const countries = await fetchData('countries');
  await Promise.all(countries.map(async (country) => {
    const existsCountry = await exists('country', { name: country.name });
    if (!existsCountry) {
      console.log(`Inserting country: ${country.name}`);
      await prisma.country.create({
        data: {
          name: country.name,
          code: country.code,
          flag: country.flag
        }
      });
    } else {
      console.log(`Country already exists: ${country.name}`);
    }
  }));
  checkpoint.countries = true;
  saveCheckpoint(checkpoint);
}

// Função para inserir ligas
async function insertLeagues(checkpoint) {
  if (checkpoint.leagues) return;
  console.log('Inserting leagues...');
  const leagues = await fetchData('leagues');
  checkpoint.totalLeagues = leagues.length;
  checkpoint.processedLeagues = 0;
  await Promise.all(leagues.map(async (league) => {
    const existsLeague = await exists('league', { name: league.league.name });
    if (!existsLeague) {
      console.log(`Inserting league: ${league.league.name}`);
      await prisma.league.create({
        data: {
          name: league.league.name,
          type: league.league.type,
          logo: league.league.logo,
          country: {
            connect: {
              name: league.country.name
            }
          }
        }
      });
    } else {
      console.log(`League already exists: ${league.league.name}`);
    }
    checkpoint.processedLeagues += 1;
    console.log(`Progress: ${(checkpoint.processedLeagues / checkpoint.totalLeagues * 100).toFixed(2)}%`);
  }));
  checkpoint.leagues = true;
  saveCheckpoint(checkpoint);
}

// Função para inserir temporadas
async function insertSeasons(checkpoint) {
  if (checkpoint.seasons) return;
  console.log('Inserting seasons...');
  const leagues = await fetchData('leagues');
  checkpoint.totalLeagues = leagues.length;
  checkpoint.processedLeagues = 0;
  for (const league of leagues) {
    console.log(`Fetching seasons for league: ${league.league.name}`);
    const leagueDetails = await fetchData(`leagues`, { id: league.league.id });
    const seasons = leagueDetails[0]?.seasons;
    if (!seasons || seasons.length === 0) {
      console.log(`No seasons found for league: ${league.league.name}`);
      continue;
    }
    await Promise.all(seasons.map(async (season) => {
      const existsSeason = await exists('season', { year: season.year, leagueId: league.league.id });
      if (!existsSeason) {
        console.log(`Inserting season for league ${league.league.name}: ${season.year}`);
        await prisma.season.create({
          data: {
            year: season.year,
            start: new Date(season.start),
            end: new Date(season.end),
            current: season.current,
            league: {
              connect: {
                id: league.league.id
              }
            }
          }
        });
      } else {
        console.log(`Season already exists for league ${league.league.name}: ${season.year}`);
      }
    }));
    checkpoint.processedLeagues += 1;
    console.log(`Progress: ${(checkpoint.processedLeagues / checkpoint.totalLeagues * 100).toFixed(2)}%`);
  }
  checkpoint.seasons = true;
  saveCheckpoint(checkpoint);
}

// Função para inserir times
async function insertTeams(checkpoint) {
  console.log('Inserting teams...');
  const leagues = await fetchData('leagues');
  checkpoint.totalLeagues = leagues.length;
  for (let i = checkpoint.currentLeagueIndex; i < leagues.length; i++) {
    const league = leagues[i];
    console.log(`Fetching teams for league: ${league.league.name}`);
    const teams = await fetchData('teams', { league: league.league.id, season: new Date().getFullYear() });
    if (!teams || teams.length === 0) {
      console.log(`No teams found for league: ${league.league.name}`);
      continue;
    }
    checkpoint.totalTeams = teams.length;
    checkpoint.processedTeams = 0;
    await Promise.all(teams.map(async (team) => {
      const countryName = team.team.country;
      if (!countryName) {
        console.log(`Skipping team ${team.team.name} as it does not have a country.`);
        return;
      }
      let country = await prisma.country.findUnique({ where: { name: countryName } });
      if (!country) {
        console.log(`Inserting country for team: ${countryName}`);
        try {
          country = await prisma.country.create({
            data: {
              name: countryName,
              code: team.team.code,
              flag: team.team.logo
            }
          });
        } catch (error) {
          if (error.code === 'P2002') {
            console.log(`Country ${countryName} already exists. Fetching existing record.`);
            country = await prisma.country.findUnique({ where: { name: countryName } });
          } else {
            throw error;
          }
        }
      }
      try {
        const existsTeam = await exists('team', { name: team.team.name });
        if (!existsTeam) {
          console.log(`Inserting team: ${team.team.name}`);
          await prisma.team.create({
            data: {
              name: team.team.name,
              logo: team.team.logo,
              country: {
                connect: {
                  id: country.id
                }
              }
            }
          });
        } else {
          console.log(`Team already exists: ${team.team.name}`);
        }
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Team ${team.team.name} already exists. Skipping.`);
        } else {
          throw error;
        }
      }
      checkpoint.processedTeams += 1;
      console.log(`Team progress for league ${league.league.name}: ${(checkpoint.processedTeams / checkpoint.totalTeams * 100).toFixed(2)}%`);
    }));
    checkpoint.currentLeagueIndex = i + 1;
    console.log(`League progress: ${(checkpoint.currentLeagueIndex / checkpoint.totalLeagues * 100).toFixed(2)}%`);
    saveCheckpoint(checkpoint);
  }
  checkpoint.teams = true;
  saveCheckpoint(checkpoint);
}

// Função principal para rodar todas as inserções
async function main() {
  console.log('Starting ETL process...');
  const checkpoint = loadCheckpoint();
  await insertCountries(checkpoint);
  await insertLeagues(checkpoint);
  await insertSeasons(checkpoint);
  await insertTeams(checkpoint);
  console.log('ETL process completed.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
