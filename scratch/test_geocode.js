// native fetch in Node 18+

async function run() {
  const url = `https://photon.komoot.io/reverse?lat=28.4526094&lon=76.990898&limit=1`;
  console.log("Fetching URL:", url);
  try {
    const response = await fetch(url);
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
