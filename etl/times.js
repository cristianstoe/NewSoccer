async function fetchAndStoreTeams() {
  console.log('Fetching teams...');
  try {
    const response = await axios.get(`${API_URL}/teams`, {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY },
      params: { league: LEAGUE_ID, season: SEASON_YEAR } // Set appropriate parameters
    });
    console.log('Full teams response:', response.data);
    const teams = response.data.response;
    console.log('Teams fetched:', teams.length);

    for (const team of teams) {
      await prisma.team.create({
        data: {
          name: team.name,
          countryId: team.country.id,
          stadium: {
            connectOrCreate: {
              where: { name: team.stadium.name },
              create: { name: team.stadium.name, city: team.stadium.city }
            }
          },
          coach: {
            connectOrCreate: {
              where: { name: team.coach.name },
              create: { name: team.coach.name }
            }
          }
        }
      });
      console.log('Inserted team:', team.name);
    }
  } catch (error) {
    console.error('Error fetching teams:', error);
  }
}
