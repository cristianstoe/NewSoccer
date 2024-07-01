async function fetchAndStoreLeaguesAndSeasons() {
  console.log('Fetching leagues...');
  try {
    const response = await axios.get(`${API_URL}/leagues`, {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY }
    });
    console.log('Full leagues response:', response.data);
    const leagues = response.data.response;
    console.log('Leagues fetched:', leagues.length);

    for (const league of leagues) {
      const createdLeague = await prisma.league.create({
        data: {
          name: league.name,
          country: { connect: { id: league.country.id } }
        }
      });
      console.log('Inserted league:', league.name);

      for (const season of league.seasons) {
        await prisma.season.create({
          data: {
            year: season.year,
            leagueId: createdLeague.id
          }
        });
        console.log('Inserted season:', season.year);
      }
    }
  } catch (error) {
    console.error('Error fetching leagues:', error);
  }
}
