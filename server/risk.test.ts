import { describe, expect, it } from "vitest";
import { calculateFireRisk } from "./risk";

describe("calculateFireRisk", () => {
  it("classifica uma leitura ambiental segura como risco baixo", () => {
    expect(calculateFireRisk({ temperature: 23, humidity: 72, smoke: 4, windSpeed: 5 })).toMatchObject({ level: "low" });
  });

  it("classifica uma leitura extrema como risco crítico", () => {
    const result = calculateFireRisk({ temperature: 43, humidity: 12, smoke: 95, windSpeed: 36 });
    expect(result).toMatchObject({ level: "critical" });
    expect(result.score).toBeGreaterThanOrEqual(75);
  });
});

