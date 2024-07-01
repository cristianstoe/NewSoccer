const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const prisma = new PrismaClient();
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_URL = 'https://v3.football.api-sports.io/';
const RATE_LIMIT_DELAY = 200; // 0.2 segundos de atraso para garantir que não exceda 300 requisições por minuto
const CHECKPOINT_FILE = 'etl_checkpoint.json';
const PROGRESS_LOG_FILE = 'etl_progress.log';

let startTime = Date.now();

// Função para buscar dados da API com paralelização limitada
async function fetchData(endpoint, params = {}) {
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY)); // Adiciona um pequeno atraso entre requisições
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      params,
      headers: { 'x-apisports-key': API_KEY }
    });
    logProgress(`Fetched data from endpoint ${endpoint} with params ${JSON.stringify(params)}. Response length: ${response.data.response.length}`);
    return response.data.response;
  } catch (error) {
    logProgress(`Error fetching data from endpoint ${endpoint} with params ${JSON.stringify(params)}: ${error.message}`);
    return [];
  }
}

// Função para verificar se um item já existe no banco de dados
async function exists(model, where) {
  if (!where || Object.values(where).some(value => value == null)) {
    return false;
  }
  const count = await prisma[model].count({ where });
  return count > 0;
}

// Função para carregar checkpoints
function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    const data = fs.readFileSync(CHECKPOINT_FILE);
    return JSON.parse(data);
  }
  return { countries: false, leagues: false, seasons: false, stadiums: false, teams: false, players: false, coaches: false, statistics: false, currentLeagueIndex: 0, totalLeagues: 0, processedLeagues: 0, totalTeams: 0, processedTeams: 0, currentTeamIndex: 0, currentPlayerIndex: 0, currentSeasonIndex: 0, totalStatistics: 0, processedStatistics: 0 };
}

// Função para salvar checkpoints
function saveCheckpoint(checkpoint) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint));
}

// Função para logar progresso
function logProgress(message) {
  console.log(message);
  fs.appendFileSync(PROGRESS_LOG_FILE, `${message}\n`);
}

function logPercentage(totalSteps, currentStep) {
  const elapsedTime = (Date.now() - startTime) / 1000; // tempo decorrido em segundos
  const percentage = ((currentStep / totalSteps) * 100).toFixed(2);
  const estimatedTotalTime = (elapsedTime / currentStep) * totalSteps;
  const remainingTime = estimatedTotalTime - elapsedTime;
  logProgress(`Progress: ${percentage}% completed. Estimated time remaining: ${remainingTime.toFixed(2)} seconds.`);
}

// Função para inserir temporadas
async function insertSeasons(checkpoint) {
  if (checkpoint.seasons) return;
  logProgress('Inserting seasons...');
  const leagues = await fetchData('leagues');
  checkpoint.totalLeagues = leagues.length;
  for (const league of leagues) {
    const leagueRecord = await prisma.league.findUnique({ where: { id: league.league.id } });
    if (!leagueRecord) {
      logProgress(`League not found in database: ${league.league.name}`);
      continue;
    }
    logProgress(`Fetching seasons for league: ${league.league.name}`);
    const leagueDetails = await fetchData(`leagues`, { id: league.league.id });
    const seasons = leagueDetails[0]?.seasons;
    if (!seasons || seasons.length === 0) {
      logProgress(`No seasons found for league: ${league.league.name}`);
      continue;
    }
    await Promise.all(seasons.map(async (season) => {
      const existsSeason = await exists('season', { year: season.year, leagueId: leagueRecord.id });
      if (!existsSeason) {
        logProgress(`Inserting season for league ${league.league.name}: ${season.year}`);
        await prisma.season.create({
          data: {
            year: season.year,
            start: new Date(season.start),
            end: new Date(season.end),
            current: season.current,
            league: {
              connect: {
                id: leagueRecord.id
              }
            }
          }
        });
      } else {
        logProgress(`Season already exists for league ${league.league.name}: ${season.year}`);
      }
    }));
    checkpoint.processedLeagues += 1;
    logPercentage(checkpoint.totalLeagues, checkpoint.processedLeagues);
  }
  checkpoint.seasons = true;
  saveCheckpoint(checkpoint);
}

// Função para inserir estádios
async function insertStadiums(checkpoint) {
  if (checkpoint.stadiums) return;
  logProgress('Inserting stadiums...');
  const leagues = await fetchData('leagues');
  checkpoint.totalLeagues = leagues.length;
  for (const league of leagues) {
    const teams = await fetchData('teams', { league: league.league.id, season: new Date().getFullYear() });
    const stadiums = teams.map(team => team.venue).filter(venue => venue && venue.name);
    await Promise.all(stadiums.map(async (stadium) => {
      const existsStadium = await exists('stadium', { name: stadium.name });
      if (!existsStadium) {
        logProgress(`Inserting stadium: ${stadium.name}`);
        try {
          await prisma.stadium.create({
            data: {
              name: stadium.name,
              city: stadium.city
            }
          });
        } catch (error) {
          if (error.code === 'P2002') {
            logProgress(`Stadium already exists: ${stadium.name}. Skipping.`);
          } else {
            throw error;
          }
        }
      } else {
        logProgress(`Stadium already exists: ${stadium.name}`);
      }
    }));
    checkpoint.processedLeagues += 1;
    logPercentage(checkpoint.totalLeagues, checkpoint.processedLeagues);
  }
  checkpoint.stadiums = true;
  saveCheckpoint(checkpoint);
}

// Função para inserir equipes
async function insertTeams(checkpoint) {
  if (checkpoint.teams) return;
  logProgress('Inserting teams...');
  const leagues = await fetchData('leagues');
  checkpoint.totalLeagues = leagues.length;
  for (const league of leagues) {
    const teams = await fetchData('teams', { league: league.league.id, season: new Date().getFullYear() });
    await Promise.all(teams.map(async (team) => {
      if (!team.team.name) {
        logProgress(`Team name is null, skipping.`);
        return;
      }
      const existsTeam = await exists('team', { name: team.team.name });
      if (!existsTeam) {
        logProgress(`Inserting team: ${team.team.name}`);
        await prisma.team.create({
          data: {
            name: team.team.name,
            logo: team.team.logo,
            country: {
              connectOrCreate: {
                where: { name: team.team.country },
                create: { name: team.team.country }
              }
            }
          }
        });
        logProgress(`Inserted team: ${team.team.name}`);
      } else {
        logProgress(`Team already exists: ${team.team.name}`);
      }
    }));
    checkpoint.processedLeagues += 1;
    logPercentage(checkpoint.totalLeagues, checkpoint.processedLeagues);
  }
  checkpoint.teams = true;
  saveCheckpoint(checkpoint);
}

// Função para inserir jogadores
async function insertPlayers(checkpoint) {
  if (checkpoint.players) return;
  logProgress('Inserting players...');
  const leagues = await fetchData('leagues');
  checkpoint.totalLeagues = leagues.length;

  // Contar o número total de jogadores para todos os times
  let totalPlayers = 0;
  for (const league of leagues) {
    const teams = await fetchData('teams', { league: league.league.id, season: new Date().getFullYear() });
    for (const team of teams) {
      const players = await fetchData('players', { team: team.team.id, season: new Date().getFullYear() });
      totalPlayers += players.length;
    }
  }

  let processedPlayers = 0;

  for (const leagueIndex of leagues.keys()) {
    if (leagueIndex < checkpoint.currentLeagueIndex) continue;
    const league = leagues[leagueIndex];
    const teams = await fetchData('teams', { league: league.league.id, season: new Date().getFullYear() });
    for (const teamIndex of teams.keys()) {
      if (teamIndex < checkpoint.currentTeamIndex) continue;
      const team = teams[teamIndex];
      logProgress(`Fetching players for team: ${team.team.name}`);
      const players = await fetchData('players', { team: team.team.id, season: new Date().getFullYear() });
      for (const playerIndex of players.keys()) {
        if (playerIndex < checkpoint.currentPlayerIndex) continue;
        const player = players[playerIndex];
        if (!player.player.name || player.player.age == null) {
          logProgress(`Player name or age is null, skipping.`);
          continue;
        }
        const teamRecord = await prisma.team.findUnique({ where: { id: team.team.id } });
        if (!teamRecord) {
          logProgress(`Team not found in database: ${team.team.name}, skipping player: ${player.player.name}`);
          continue;
        }
        const existsPlayer = await exists('player', { name: player.player.name, teamId: team.team.id });
        if (!existsPlayer) {
          logProgress(`Inserting player: ${player.player.name}`);
          await prisma.player.create({
            data: {
              name: player.player.name,
              age: player.player.age,
              nationality: player.player.nationality,
              position: player.statistics[0]?.games?.position || 'Unknown',
              team: {
                connect: {
                  id: team.team.id
                }
              }
            }
          });
          logProgress(`Inserted player: ${player.player.name}`);
          processedPlayers += 1;
          const percentage = ((processedPlayers / totalPlayers) * 100).toFixed(2);
          const elapsedTime = (Date.now() - startTime) / 1000; // tempo decorrido em segundos
          const estimatedTotalTime = (elapsedTime / processedPlayers) * totalPlayers;
          const remainingTime = estimatedTotalTime - elapsedTime;
          logProgress(`Progress: ${percentage}% completed. Estimated time remaining: ${remainingTime.toFixed(2)} seconds.`);
          checkpoint.currentPlayerIndex = playerIndex + 1;
          saveCheckpoint(checkpoint);
        } else {
          logProgress(`Player already exists: ${player.player.name}`);
        }
      }
      checkpoint.currentPlayerIndex = 0;
      checkpoint.currentTeamIndex = teamIndex + 1;
      saveCheckpoint(checkpoint);
    }
    checkpoint.currentTeamIndex = 0;
    checkpoint.currentLeagueIndex = leagueIndex + 1;
    saveCheckpoint(checkpoint);
  }
  checkpoint.players = true;
  saveCheckpoint(checkpoint);
}
async function insertCoaches(checkpoint) {
  if (checkpoint.coaches) return;
  logProgress('Inserting coaches...');

  const teams = await prisma.team.findMany({
    select: { id: true }
  });

  checkpoint.totalTeams = teams.length;
  let processedTeams = checkpoint.processedTeams || 0;

  for (const teamIndex in teams) {
    if (teamIndex < checkpoint.currentTeamIndex) continue;
    const teamId = teams[teamIndex].id;

    logProgress(`Fetching coaches for team ID: ${teamId}`);
    const coaches = await fetchData('coachs', { team: teamId });

    for (const coach of coaches) {
      if (!coach.id) {
        logProgress(`Missing data for coach, skipping.`);
        continue;
      }

      const existsCoach = await exists('coach', { id: coach.id });
      if (!existsCoach) {
        logProgress(`Inserting coach ID: ${coach.id}`);
        await prisma.coach.create({
          data: {
            id: coach.id,
            name: coach.name,
            nationality: coach.nationality,
            team: {
              connect: { id: teamId }
            }
          }
        });
        logProgress(`Inserted coach ID: ${coach.id}`);
      } else {
        logProgress(`Coach already exists ID: ${coach.id}`);
      }
    }

    processedTeams += 1;
    checkpoint.currentTeamIndex = parseInt(teamIndex, 10);
    checkpoint.processedTeams = processedTeams;
    logPercentage(checkpoint.totalTeams, processedTeams);
    saveCheckpoint(checkpoint);
  }

  checkpoint.coaches = true;
  saveCheckpoint(checkpoint);
}
async function insertStatistics(checkpoint) {
  if (checkpoint.statistics) return;
  logProgress('Inserting statistics...');
  
  const season2024 = await prisma.season.findFirst({
    where: {
      year: 2024
    },
    include: {
      league: true
    }
  });

  if (!season2024) {
    logProgress('Season 2024 not found.');
    return;
  }

  logProgress(`Fetching statistics for season: ${season2024.year}`);
  const teams = await prisma.team.findMany({
    where: {
      players: {
        some: {
          statistics: {
            none: {
              seasonId: season2024.id
            }
          }
        }
      }
    },
    include: {
      players: true
    }
  });

  for (const team of teams) {
    for (const playerIndex of team.players.keys()) {
      if (playerIndex < checkpoint.currentPlayerIndex) continue;
      const player = team.players[playerIndex];
      logProgress(`Fetching statistics for player: ${player.name} in season: ${season2024.year}`);
      const playerStats = await fetchData('players', { id: player.id, season: season2024.year });

      for (const stat of playerStats) {
        if (!stat.statistics || stat.statistics.length === 0) {
          logProgress(`No statistics found for player: ${player.name}`);
          continue;
        }
        const playerStat = stat.statistics[0];
        const existsStatistic = await exists('statistic', { playerId: player.id, seasonId: season2024.id });
        if (!existsStatistic) {
          logProgress(`Inserting statistics for player: ${player.name}`);
          try {
            await prisma.statistic.create({
              data: {
                goals: playerStat.goals.total || 0,
                assists: playerStat.goals.assists || 0,
                games: playerStat.games.appearences || 0,
                minutes: playerStat.games.minutes || 0,
                player: {
                  connect: {
                    id: player.id
                  }
                },
                season: {
                  connect: {
                    id: season2024.id
                  }
                }
              }
            });
            logProgress(`Inserted statistics for player: ${player.name}`);
          } catch (error) {
            logProgress(`Error inserting statistics for player ${player.name}: ${error.message}`);
          }
        } else {
          logProgress(`Statistics already exist for player: ${player.name}`);
        }
      }

      checkpoint.currentPlayerIndex = playerIndex + 1;
      saveCheckpoint(checkpoint);
    }
    checkpoint.currentPlayerIndex = 0;
  }

  checkpoint.statistics = true;
  saveCheckpoint(checkpoint);
}async function insertFixtures(checkpoint) {
  if (checkpoint.fixtures) return;
  logProgress('Inserting fixtures...');

  const leagueIds = await prisma.league.findMany({
    select: { id: true }
  });
  
  const season = await prisma.season.findFirst({
    where: { year: 2024 },
    select: { id: true, leagueId: true }
  });

  if (!season) {
    logProgress('Season 2024 not found.');
    return;
  }

  checkpoint.totalLeagues = leagueIds.length;
  let processedLeagues = checkpoint.processedLeagues || 0;

  for (const leagueIndex in leagueIds) {
    if (leagueIndex < checkpoint.currentLeagueIndex) continue;
    const leagueId = leagueIds[leagueIndex].id;

    logProgress(`Fetching fixtures for league ID: ${leagueId} and season 2024`);
    const fixtures = await fetchData('fixtures', { league: leagueId, season: 2024 });

    for (const fixture of fixtures) {
      const venueId = fixture.fixture.venue.id ? await prisma.stadium.findUnique({
        where: { id: fixture.fixture.venue.id },
        select: { id: true }
      }) : null;

      const homeTeamId = fixture.teams.home.id ? await prisma.team.findUnique({
        where: { id: fixture.teams.home.id },
        select: { id: true }
      }) : null;

      const awayTeamId = fixture.teams.away.id ? await prisma.team.findUnique({
        where: { id: fixture.teams.away.id },
        select: { id: true }
      }) : null;

      if (!venueId || !homeTeamId || !awayTeamId) {
        logProgress(`Missing data for fixture ${fixture.fixture.id}, skipping.`);
        continue;
      }

      const existsFixture = await exists('fixture', { fixtureId: fixture.fixture.id });
      if (!existsFixture) {
        logProgress(`Inserting fixture ID: ${fixture.fixture.id}`);
        await prisma.fixture.create({
          data: {
            fixtureId: fixture.fixture.id,
            referee: fixture.fixture.referee || 'Unknown',
            timezone: fixture.fixture.timezone || 'UTC',
            date: new Date(fixture.fixture.date),
            timestamp: fixture.fixture.timestamp,
            status: fixture.fixture.status.long,
            elapsed: fixture.fixture.status.elapsed || 0, // Valor padrão para `elapsed`
            venue: {
              connect: { id: venueId.id }
            },
            league: {
              connect: { id: leagueId }
            },
            season: {
              connect: { id: season.id }
            },
            homeTeam: {
              connect: { id: homeTeamId.id }
            },
            awayTeam: {
              connect: { id: awayTeamId.id }
            },
            goalsHome: fixture.goals.home || 0, // Valor padrão para `goalsHome`
            goalsAway: fixture.goals.away || 0, // Valor padrão para `goalsAway`
            halftimeHome: fixture.score.halftime.home || 0, // Valor padrão para `halftimeHome`
            halftimeAway: fixture.score.halftime.away || 0, // Valor padrão para `halftimeAway`
            fulltimeHome: fixture.score.fulltime.home || 0, // Valor padrão para `fulltimeHome`
            fulltimeAway: fixture.score.fulltime.away || 0, // Valor padrão para `fulltimeAway`
            extratimeHome: fixture.score.extratime.home || 0, // Valor padrão para `extratimeHome`
            extratimeAway: fixture.score.extratime.away || 0, // Valor padrão para `extratimeAway`
            penaltyHome: fixture.score.penalty.home || 0, // Valor padrão para `penaltyHome`
            penaltyAway: fixture.score.penalty.away || 0 // Valor padrão para `penaltyAway`
          }
        });
        logProgress(`Inserted fixture ID: ${fixture.fixture.id}`);
      } else {
        logProgress(`Fixture already exists ID: ${fixture.fixture.id}`);
      }
    }

    processedLeagues += 1;
    checkpoint.currentLeagueIndex = parseInt(leagueIndex, 10);
    checkpoint.processedLeagues = processedLeagues;
    logPercentage(checkpoint.totalLeagues, processedLeagues);
    saveCheckpoint(checkpoint);
  }

  checkpoint.fixtures = true;
  saveCheckpoint(checkpoint);
}

// Função principal para rodar todas as inserções
async function main() {
  logProgress('Starting ETL process...');
  const checkpoint = loadCheckpoint();
  logProgress(`Loaded checkpoint: ${JSON.stringify(checkpoint)}`);

  // if (!checkpoint.seasons) {
  //   await insertSeasons(checkpoint);
  // }
  // if (!checkpoint.stadiums) {
  //   await insertStadiums(checkpoint);
  // }
  // if (!checkpoint.teams) {
  //   await insertTeams(checkpoint);
  // }
  // if (!checkpoint.players) {
  //   await insertPlayers(checkpoint);
  // }
  if (!checkpoint.coaches) {
    await insertCoaches(checkpoint);
  }
  // if (!checkpoint.statistics) {
  //   await insertStatistics(checkpoint);
  // }
  if (!checkpoint.fixtures) {
    await insertFixtures(checkpoint);
  }

  logProgress('ETL process completed.');
}

main()
  .catch(e => {
    logProgress(`Error: ${e.message}`);
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
