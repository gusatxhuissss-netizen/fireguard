import { Crosshair, Flame, MapPin, ScanSearch, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";

type RiskLevel = "low" | "medium" | "high" | "critical";
type Incident = { id: number; title: string; riskLevel: RiskLevel; latitude: number; longitude: number; status: string; source: string };
type Report = { id: number; description: string; riskLevel: RiskLevel; latitude: number; longitude: number; status: string };
type Point = (Incident | Report) & { kind: "Foco" | "Denúncia"; displayTitle: string; sourceLabel: string };

const riskInfo: Record<RiskLevel, { label: string; color: string; ring: string }> = {
  low: { label: "Baixo", color: "#5c9f80", ring: "rgba(92,159,128,.20)" },
  medium: { label: "Médio", color: "#d69c3c", ring: "rgba(214,156,60,.20)" },
  high: { label: "Alto", color: "#df6a36", ring: "rgba(223,106,54,.20)" },
  critical: { label: "Crítico", color: "#c83d32", ring: "rgba(200,61,50,.22)" },
};

function normalize(value: number, min: number, max: number) {
  return Math.max(7, Math.min(93, ((value - min) / (max - min)) * 86 + 7));
}

const ACRE_VIEW = { minLat: -11.2, maxLat: -7.0, minLng: -74.0, maxLng: -66.5 };

export function RiskMap({ incidents, reports, visibleRisks }: { incidents: Incident[]; reports: Report[]; visibleRisks: RiskLevel[] }) {
  const points = useMemo<Point[]>(() => [
    ...incidents.filter(incident => visibleRisks.includes(incident.riskLevel)).map(incident => ({ ...incident, kind: "Foco" as const, displayTitle: incident.title, sourceLabel: incident.source === "simulation" ? "simulação" : incident.source })),
    ...reports.filter(report => visibleRisks.includes(report.riskLevel)).map(report => ({ ...report, kind: "Denúncia" as const, displayTitle: `Denúncia #${report.id}`, sourceLabel: "denúncia" })),
  ], [incidents, reports, visibleRisks]);
  const [selectedId, setSelectedId] = useState<number | null>(points[0]?.id ?? null);
  const selected = points.find(point => point.id === selectedId) ?? points[0];
  const minLat = ACRE_VIEW.minLat;
  const maxLat = ACRE_VIEW.maxLat;
  const minLng = ACRE_VIEW.minLng;
  const maxLng = ACRE_VIEW.maxLng;

  return <div className="relative isolate h-[430px] overflow-hidden rounded-[1.25rem] border border-[#b9cdb9] bg-[#d6e3cb]">
    <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "linear-gradient(rgba(52,108,84,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(52,108,84,.18) 1px,transparent 1px)", backgroundSize: "38px 38px" }} />
    <div className="absolute -left-16 top-10 h-72 w-[45%] rotate-12 rounded-[46%] border-[22px] border-[#aac6a1]/80" /><div className="absolute -right-10 -bottom-16 h-80 w-[44%] rounded-[46%] border-[24px] border-[#b3cfa7]/80" /><div className="absolute left-[27%] top-[20%] h-48 w-[42%] rounded-[45%] border-[16px] border-[#c5d8b7]/90" />
    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-lg border border-white/75 bg-[#f7f9f1]/85 px-3 py-2 text-[#31594b] shadow-sm"><ScanSearch className="h-3.5 w-3.5" /><span className="font-mono text-[9px] font-bold uppercase tracking-[.14em]">Acre · camada territorial simulada</span></div>
    <div className="absolute right-5 top-5 flex items-center gap-2 rounded-lg border border-white/75 bg-[#f7f9f1]/85 px-3 py-2 text-[10px] font-semibold text-[#57776b]"><Crosshair className="h-3.5 w-3.5" />{points.length} pontos ativos</div>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-55" aria-hidden="true"><path d="M-5,65 C15,48 28,73 45,53 S72,22 105,47" fill="none" stroke="#779b78" strokeWidth=".45" strokeDasharray="1.5 1.5"/><path d="M-5,33 C18,18 34,43 54,26 S79,57 106,20" fill="none" stroke="#779b78" strokeWidth=".45" strokeDasharray="1.5 1.5"/><path d="M10,-5 C25,25 42,29 35,105" fill="none" stroke="#8da88a" strokeWidth=".35"/><path d="M84,-5 C72,30 89,61 61,105" fill="none" stroke="#8da88a" strokeWidth=".35"/></svg>
    {points.map(point => { const x = normalize(point.longitude, minLng, maxLng); const y = 100 - normalize(point.latitude, minLat, maxLat); const info = riskInfo[point.riskLevel]; const isSelected = selected?.id === point.id; return <button key={`${point.kind}-${point.id}`} onClick={() => setSelectedId(point.id)} aria-label={`${point.kind}: ${point.displayTitle}, risco ${info.label}`} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none" style={{ left: `${x}%`, top: `${y}%` }}><span className={`absolute -inset-3 rounded-full ${isSelected ? "animate-ping" : ""}`} style={{ background: info.ring, animationDuration: "2.4s" }} /><span className="relative grid h-8 w-8 place-items-center rounded-full border-[3px] border-white text-white shadow-lg transition-transform hover:scale-110" style={{ background: info.color }}>{point.kind === "Foco" ? <Flame className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}</span></button> })}
    {selected ? <div className="absolute bottom-5 left-5 right-5 z-10 flex items-center gap-3 rounded-xl border border-white/80 bg-[#fbfcf7]/95 p-3 shadow-lg backdrop-blur sm:left-auto sm:right-5 sm:w-[310px]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white" style={{ background: riskInfo[selected.riskLevel].color }}>{selected.kind === "Foco" ? <Flame className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-[#23483d]">{selected.displayTitle}</p><p className="mt-0.5 text-[11px] text-[#668178]">{selected.kind} · risco {riskInfo[selected.riskLevel].label} · {selected.sourceLabel}</p></div></div> : <div className="absolute inset-0 grid place-items-center text-center"><div className="rounded-xl bg-white/80 px-5 py-4 text-sm font-semibold text-[#53756a]">Nenhum ponto para os filtros selecionados.</div></div>}
  </div>;
}
