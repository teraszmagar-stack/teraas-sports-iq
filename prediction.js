export default async function handler(req, res) {
  const fixture = req.query?.fixture;
  const key = process.env.SPORTS_API_KEY;

  if (!fixture) return res.status(400).json({ error: "fixture is required" });
  if (!key) return res.status(500).json({ error: "SPORTS_API_KEY is not configured." });

  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/predictions?fixture=${encodeURIComponent(fixture)}`,
      { headers: { "x-apisports-key": key, "Accept": "application/json" } }
    );
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Prediction API request failed",
        details: data?.errors || null
      });
    }

    const item = data?.response?.[0];
    if (!item) return res.status(404).json({ error: "No prediction available for this fixture." });

    const p = item.predictions || {};
    const winner = p.winner || {};
    const percent = p.percent || {};
    const home = Number.parseFloat(percent.home) || 0;
    const draw = Number.parseFloat(percent.draw) || 0;
    const away = Number.parseFloat(percent.away) || 0;
    const max = Math.max(home, draw, away);
    const confidence = Math.round(Math.min(95, Math.max(35, max)));

    return res.status(200).json({
      fixture: Number(fixture),
      winner: winner.name || "Undetermined",
      winnerId: winner.id || null,
      advice: p.advice || null,
      score: p.score || null,
      probabilities: { home, draw, away },
      confidence,
      comparison: item.comparison || null,
      source: "API-Football",
      generatedAt: new Date().toISOString()
    });
  } catch {
    return res.status(500).json({ error: "Unable to reach prediction provider." });
  }
}
