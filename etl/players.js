async function fetchAndStorePlayersAndStatistics() {
  console.log('Fetching players and statistics...');
  try {
    const response = await axios.get(`${API_URL}/players`, {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY },
      params: { team: TEAM_ID, season: SEASON_YEAR } // Set appropriate parameters
    });
    console.log('Full players response:', response.data);
    const players = response.data.response;
    console.log('Players fetched:', players.length);

    for (const player of players) {
      const createdPlayer = await prisma.player.create({
        data: {
          name: player.name,
          teamId: player.team.id
        }
      });
      console.log('Inserted player:', player.name);

      const statsResponse = await axios.get(`${API_URL}/players/statistics`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { player: player.id, season: SEASON_YEAR } // Set appropriate parameters
      });
      const stats = statsResponse.data.response;
      console.log('Statistics fetched for player:', player.name);

      for (const stat of stats) {
        await prisma.statistic.create({
          data: {
            goals: stat.goals.total,
            assists: stat.assists.total,
            playerId: createdPlayer.id,
            seasonId: stat.season.id
          }
        });
        console.log('Inserted statistics for player:', player.name);
      }
    }
  } catch (error) {
    console.error('Error fetching players and statistics:', error);
  }
}
