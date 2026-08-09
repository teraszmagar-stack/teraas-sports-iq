export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.SPORTS_API_KEY;
  if (!key) return res.status(500).json({ error: "SPORTS_API_KEY is not configured in Vercel." });

  const url = new URL("https://v3.football.api-sports.io/fixtures");
  url.searchParams.set("next", "10");
  url.searchParams.set("timezone", "Asia/Kathmandu");

  try {
    const response = await fetch(url, {
      headers: { "x-apisports-key": key, "Accept": "application/json" }
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Sports API request failed",
        details: data?.errors || null
      });
    }

    return res.status(200).json({
      source: "API-Football",
      fetchedAt: new Date().toISOString(),
      fixtures: data.response || []
    });
  } catch {
    return res.status(500).json({ error: "Unable to reach sports API." });
  }
}
