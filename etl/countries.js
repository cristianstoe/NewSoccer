async function fetchAndStoreCountries() {
  console.log('Fetching countries...');
  try {
    const response = await axios.get(`${API_URL}/countries`, {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY }
    });
    console.log('Full countries response:', response.data);
    const countries = response.data.response;
    console.log('Countries fetched:', countries.length);

    for (const country of countries) {
      await prisma.country.create({ data: { name: country.name } });
      console.log('Inserted country:', country.name);
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
  }
}
