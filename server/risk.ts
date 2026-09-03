export type EnvironmentalReading = {
  temperature: number;
  humidity: number;
  smoke: number;
  windSpeed: number;
};

export type RiskLevel = "low" | "medium" | "high" | "critical";

export function calculateFireRisk(reading: EnvironmentalReading): { score: number; level: RiskLevel } {
  const temperatureScore = Math.max(0, Math.min(100, ((reading.temperature - 18) / 27) * 100));
  const humidityScore = Math.max(0, Math.min(100, ((80 - reading.humidity) / 60) * 100));
  const smokeScore = Math.max(0, Math.min(100, reading.smoke));
  const windScore = Math.max(0, Math.min(100, (reading.windSpeed / 45) * 100));
  const score = Math.round(temperatureScore * 0.35 + humidityScore * 0.25 + smokeScore * 0.25 + windScore * 0.15);

  if (score >= 75) return { score, level: "critical" };
  if (score >= 55) return { score, level: "high" };
  if (score >= 30) return { score, level: "medium" };
  return { score, level: "low" };
}
