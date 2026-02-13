import { useState, useEffect, useCallback } from "react";
import { X, Star, Clock, User, MapPin, FileText, Brain, Calendar, Globe, CheckCircle2, XCircle, Send, Loader2, Copy, Check, Zap, RefreshCw, Image as ImageIcon, ChevronLeft, ChevronRight, ArrowUpDown, Info, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClusterInfo, hazardReports, HazardReport, reportClusters } from "@/data/hazardReports";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ── Types ──────────────────────────────────────────────────────────────────────
type AnnotationStatus = "pending" | "duplicate" | "not_duplicate" | "auto_confirmed";
type DuplicateStatus = "potential_duplicate" | "duplicate" | "duplicate_by_system";

interface AnnotationData {
  status: AnnotationStatus;
  notes?: string;
  confirmedAt?: Date;
  confirmedBy?: string;
  queuedForLabeling?: boolean;
}

const AUTO_CONFIRM_DURATION = 60;

// ── Helpers ────────────────────────────────────────────────────────────────────
const getDuplicateStatus = (report: HazardReport): DuplicateStatus => {
  const score = report.duplicateScores?.overall || 0;
  if (score >= 0.95 && Math.random() > 0.7) return "duplicate_by_system";
  if (score >= 0.85) return "duplicate";
  return "potential_duplicate";
};

const statusConfig: Record<DuplicateStatus, { label: string; sub: string | null; cls: string; Icon: typeof RefreshCw | null }> = {
  duplicate_by_system: { label: "Duplicate by System", sub: "Terupload 2 kali", cls: "bg-info/10 text-info border-info/30", Icon: RefreshCw },
  duplicate: { label: "Duplicate", sub: null, cls: "bg-destructive/10 text-destructive border-destructive/30", Icon: null },
  potential_duplicate: { label: "Potential Duplicate", sub: null, cls: "bg-warning/10 text-warning border-warning/30", Icon: null },
};

const generateBreakdown = () => ({
  image: Math.floor(Math.random() * 500000000) + 100000000,
  textDesc: Math.floor(Math.random() * 100000000) + 10000000,
  total: Math.floor(Math.random() * 500000000) + 100000000,
});

const getExplanation = (s: ReturnType<typeof generateBreakdown>) => {
  const e: string[] = [];
  if (s.image > 300000000) e.push("gambar sama");
  else if (s.image > 150000000) e.push("gambar berpotensi sama");
  if (s.textDesc > 50000000) e.push("deskripsi sama");
  else if (s.textDesc > 25000000) e.push("deskripsi berpotensi sama");
  return e.length > 0 ? e.join(", ") : "tidak ada kesamaan signifikan";
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const CopyIdButton = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast({ title: "ID disalin" });
    setTimeout(() => setCopied(false), 1500);
  }, [id]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors"
    >
      {id}
      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 opacity-50" />}
    </button>
  );
};

const StatusBadgeWithTooltip = ({ status }: { status: DuplicateStatus }) => {
  const c = statusConfig[status];
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${c.cls} text-[10px] gap-1 py-0 cursor-default`}>
            {c.Icon && <c.Icon className="w-2.5 h-2.5" />}
            {c.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[240px]">
          <p className="text-xs leading-relaxed">
            {status === "duplicate_by_system"
              ? "Kedobel oleh sistem — similarity tinggi, terkesan identik dengan metadata pelapor dan timestamp mirip/berdekatan."
              : status === "duplicate"
              ? "Similarity tinggi, teridentifikasi sebagai laporan duplikat."
              : "Berpotensi duplikat, memerlukan review manual."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ── Report info block (shared left/middle) ─────────────────────────────────────
const ReportInfo = ({ r }: { r: HazardReport }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{r.timestamp || r.tanggal}</span>
      <span className="inline-flex items-center gap-1"><User className="w-3 h-3" />{r.pelapor}</span>
    </div>

    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
      <div>
        <span className="text-muted-foreground">Site</span>
        <p className="font-medium text-foreground flex items-center gap-1 mt-0.5"><Globe className="w-3 h-3 text-muted-foreground" />{r.site}</p>
      </div>
      <div>
        <span className="text-muted-foreground">Lokasi</span>
        <p className="font-medium text-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-muted-foreground" />{r.lokasiArea || r.lokasi}</p>
      </div>
      <div>
        <span className="text-muted-foreground">Detail Lokasi</span>
        <p className="font-medium text-foreground mt-0.5">{r.detailLokasi || "—"}</p>
      </div>
      <div>
        <span className="text-muted-foreground">Keterangan Lokasi</span>
        <p className="font-medium text-foreground mt-0.5">{r.lokasi || "—"}</p>
      </div>
    </div>
  </div>
);

// ── Analysis Section (middle only) ─────────────────────────────────────────────
const SimilarityBreakdown = ({ breakdown }: { breakdown: ReturnType<typeof generateBreakdown> }) => {
  const explanation = getExplanation(breakdown);
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center gap-2">
        <Brain className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">Similarity Breakdown</span>
      </div>
      <div className="p-3 space-y-1.5">
        {[
          { label: "Image Similarity", value: breakdown.image },
          { label: "Text – Description", value: breakdown.textDesc },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-mono tabular-nums text-foreground">{value.toLocaleString()}</span>
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-foreground">Total Similarity</span>
          <span className="font-mono tabular-nums text-primary">{breakdown.total.toLocaleString()}</span>
        </div>
      </div>
      <div className="px-3 py-2 bg-primary/5 border-t border-primary/10">
        <p className="text-[11px] text-muted-foreground">Keterangan: <span className="text-foreground font-medium capitalize">{explanation}</span></p>
      </div>
    </div>
  );
};

// ── Report Card (left & middle columns) ────────────────────────────────────────
const ReportCard = ({
  r, isRepresentative = false, showAnalysis = false, title, breakdown
}: {
  r: HazardReport; isRepresentative?: boolean; showAnalysis?: boolean; title: string; breakdown: ReturnType<typeof generateBreakdown>;
}) => {
  const status = getDuplicateStatus(r);

  return (
    <div className="space-y-3">
      {/* Header badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {isRepresentative ? (
          <Badge variant="outline" className="bg-accent text-accent-foreground border-border gap-1 text-[10px]">
            <Star className="w-3 h-3 fill-current text-warning" /> Representative
          </Badge>
        ) : (
          <StatusBadgeWithTooltip status={status} />
        )}
      </div>

      {/* Title + ID */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <CopyIdButton id={r.id} />
      </div>

      <ReportInfo r={r} />

      {/* Description */}
      <div className="rounded-lg border border-border p-2.5">
        <p className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Deskripsi Temuan</p>
        <p className="text-xs text-foreground leading-relaxed">{r.deskripsiTemuan}</p>
      </div>

      {/* Image */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="aspect-[16/9] bg-muted/30 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-muted-foreground/20" />
        </div>
      </div>

      {/* Ketidaksesuaian table */}
      <div className="rounded-lg border border-border overflow-hidden text-[11px]">
        <div className="px-2.5 py-1.5 bg-muted/40 border-b border-border font-semibold text-foreground flex items-center gap-1">
          <Layers className="w-3 h-3 text-muted-foreground" /> Klasifikasi
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <span className="text-muted-foreground">Ketidaksesuaian</span>
            <span className="font-medium text-foreground text-right max-w-[55%] truncate">{r.ketidaksesuaian || "—"}</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <span className="text-muted-foreground">Sub Ketidaksesuaian</span>
            <span className="font-medium text-foreground text-right max-w-[55%] truncate">{r.subKetidaksesuaian || "—"}</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <span className="text-muted-foreground">Quick Action</span>
            <Badge variant="secondary" className="text-[10px] h-5">{r.quickAction || "—"}</Badge>
          </div>
        </div>
      </div>

      {showAnalysis && <SimilarityBreakdown breakdown={breakdown} />}
    </div>
  );
};

// ── Main Panel ─────────────────────────────────────────────────────────────────
interface DuplicateClusterDetailPanelProps {
  cluster: ClusterInfo;
  onClose: () => void;
  onViewReport?: (report: HazardReport) => void;
  allClusters?: ClusterInfo[];
  onNavigateCluster?: (cluster: ClusterInfo) => void;
}

const DuplicateClusterDetailPanel = ({ cluster, onClose, onViewReport, allClusters, onNavigateCluster }: DuplicateClusterDetailPanelProps) => {
  const clusters = allClusters || reportClusters;
  const currentIdx = clusters.findIndex(c => c.id === cluster.id);

  const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
  const representative = clusterReports[0];
  const duplicates = clusterReports.slice(1);

  const statusCounts = duplicates.reduce((acc, r) => {
    const s = getDuplicateStatus(r);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<DuplicateStatus, number>);

  const [selectedId, setSelectedId] = useState<string | null>(duplicates[0]?.id ?? null);
  const selected = duplicates.find(r => r.id === selectedId) ?? null;

  const [filterStatus, setFilterStatus] = useState<"all" | DuplicateStatus>("all");
  const [annotations, setAnnotations] = useState<Record<string, AnnotationData>>({});
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [showDialog, setShowDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const breakdown = generateBreakdown();

  useEffect(() => {
    const reps = hazardReports.filter(r => r.cluster === cluster.id).slice(1);
    setSelectedId(reps[0]?.id ?? null);
  }, [cluster.id]);

  useEffect(() => {
    const init: Record<string, number> = {};
    duplicates.forEach(r => { if (!annotations[r.id]) init[r.id] = AUTO_CONFIRM_DURATION; });
    setTimers(prev => ({ ...prev, ...init }));
  }, [duplicates.length]);

  useEffect(() => {
    const iv = setInterval(() => {
      setTimers(prev => {
        const u = { ...prev };
        Object.keys(u).forEach(id => {
          if (!annotations[id] && u[id] > 0) {
            u[id] -= 1;
            if (u[id] === 0) {
              setAnnotations(a => ({ ...a, [id]: { status: "auto_confirmed", confirmedAt: new Date(), confirmedBy: "System" } }));
              toast({ title: "Auto-confirmed", description: `${id} dikonfirmasi otomatis` });
            }
          }
        });
        return u;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [annotations]);

  const filtered = [...duplicates]
    .filter(r => filterStatus === "all" || getDuplicateStatus(r) === filterStatus)
    .sort((a, b) => (b.duplicateScores?.overall || 0) - (a.duplicateScores?.overall || 0));

  const annotate = useCallback((id: string, type: "duplicate" | "not_duplicate") => {
    if (type === "not_duplicate") {
      setPendingId(id); setNotes(""); setShowDialog(true);
    } else {
      setAnnotations(p => ({ ...p, [id]: { status: "duplicate", confirmedAt: new Date(), confirmedBy: "Evaluator" } }));
      toast({ title: "Dikonfirmasi sebagai Duplicate" });
    }
  }, []);

  const submitAnnotation = useCallback(() => {
    if (!pendingId) return;
    setSubmitting(true);
    setTimeout(() => {
      setAnnotations(p => ({ ...p, [pendingId!]: { status: "not_duplicate", notes, confirmedAt: new Date(), confirmedBy: "Evaluator", queuedForLabeling: true } }));
      toast({ title: "Bukan Duplicate — Masuk Antrian Labeling" });
      setShowDialog(false); setPendingId(null); setNotes(""); setSubmitting(false);
    }, 600);
  }, [pendingId, notes]);

  const annotationBadge = (id: string) => {
    const a = annotations[id];
    if (!a || a.status === "pending") return null;
    const map = {
      duplicate: { cls: "bg-success text-success-foreground", icon: CheckCircle2, text: "Duplicate" },
      not_duplicate: { cls: "bg-destructive text-destructive-foreground", icon: XCircle, text: "Bukan Duplicate" },
      auto_confirmed: { cls: "bg-info text-info-foreground", icon: Clock, text: "Auto-confirmed" },
    } as const;
    const m = map[a.status as keyof typeof map];
    if (!m) return null;
    return <Badge className={`${m.cls} text-[10px] gap-1`}><m.icon className="w-2.5 h-2.5" />{m.text}</Badge>;
  };

  const navigate = (dir: -1 | 1) => {
    const next = currentIdx + dir;
    if (next >= 0 && next < clusters.length && onNavigateCluster) onNavigateCluster(clusters[next]);
  };

  const totalScore = representative?.duplicateScores ? Math.round(representative.duplicateScores.overall * 100) : 0;

  // ── Compact list item ──────────────────────────────────────────────────────
  const ListItem = ({ r }: { r: HazardReport }) => {
    const score = r.duplicateScores ? Math.round(r.duplicateScores.overall * 100) : 0;
    const active = selectedId === r.id;
    const ann = annotations[r.id];
    const t = timers[r.id] || 0;
    const status = getDuplicateStatus(r);

    return (
      <div
        onClick={() => setSelectedId(r.id)}
        className={`group rounded-lg border p-2 cursor-pointer transition-all duration-150 ${
          active
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
        }`}
      >
        <div className="flex gap-2">
          {/* Thumbnail */}
          <div className="w-12 h-12 rounded bg-muted/40 flex items-center justify-center flex-shrink-0 border border-border">
            <ImageIcon className="w-4 h-4 text-muted-foreground/25" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-semibold text-foreground truncate">{r.id}</span>
              <span className={`text-xs font-bold tabular-nums ${score >= 85 ? "text-destructive" : score >= 70 ? "text-warning" : "text-muted-foreground"}`}>{score}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">{r.tanggal} · {r.pelapor}</p>
            <div className="mt-1">
              <StatusBadgeWithTooltip status={status} />
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1.5 pl-14">{r.deskripsiTemuan}</p>

        {/* Timer or badge */}
        <div className="mt-2 pl-14">
          {ann ? (
            annotationBadge(r.id)
          ) : (
            <>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Auto-confirm</span>
                <span className="font-mono tabular-nums">{Math.floor(t / 60)}:{(t % 60).toString().padStart(2, "0")}</span>
              </div>
              <Progress value={(t / AUTO_CONFIRM_DURATION) * 100} className="h-1 mb-1.5" />
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="flex-1 h-6 text-[10px] bg-success/10 text-success border-success/30 hover:bg-success/20"
                  onClick={e => { e.stopPropagation(); annotate(r.id, "duplicate"); }}>
                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Duplicate
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-6 text-[10px] bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                  onClick={e => { e.stopPropagation(); annotate(r.id, "not_duplicate"); }}>
                  <XCircle className="w-2.5 h-2.5 mr-0.5" /> Bukan
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[1440px] h-full bg-card shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-300">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="border-b border-border bg-card">
          {/* Top bar */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate">Semantic Review</h3>
                <p className="text-[11px] text-muted-foreground truncate">{cluster.id} · {cluster.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentIdx <= 0} onClick={() => navigate(-1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-center">{currentIdx + 1} / {clusters.length}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentIdx >= clusters.length - 1} onClick={() => navigate(1)}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="px-4 pb-2.5 flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold gap-1">
              <Zap className="w-3 h-3" /> Similarity {totalScore}%
            </Badge>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-[11px] text-muted-foreground">Total <strong className="text-foreground">{clusterReports.length}</strong></span>
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className="text-[11px] text-destructive">Duplicate <strong>{statusCounts.duplicate || 0}</strong></span>
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className="text-[11px] text-warning">Potential <strong>{statusCounts.potential_duplicate || 0}</strong></span>
            <span className="text-[11px] text-muted-foreground">·</span>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[11px] text-info cursor-help inline-flex items-center gap-0.5">
                    <RefreshCw className="w-3 h-3" /> System <strong>{statusCounts.duplicate_by_system || 0}</strong>
                    <Info className="w-3 h-3 opacity-60" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px]">
                  <p className="text-xs leading-relaxed">Kedobel oleh sistem — similarity tinggi, terkesan identik dengan metadata pelapor dan timestamp mirip/berdekatan.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* ── 3-Column Content ────────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left — Representative */}
          <ScrollArea className="w-[34%] border-r border-border">
            <div className="p-4">
              {representative && (
                <ReportCard r={representative} isRepresentative title="Laporan Utama (Representative)" breakdown={generateBreakdown()} />
              )}
            </div>
          </ScrollArea>

          {/* Middle — Comparison */}
          <ScrollArea className="w-[34%] border-r border-border">
            <div className="p-4">
              {selected ? (
                <ReportCard r={selected} title="Laporan Pembanding" showAnalysis breakdown={breakdown} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pilih laporan dari daftar</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Right — Navigation list */}
          <ScrollArea className="w-[32%]">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground">Laporan Mirip</h4>
                <span className="text-[10px] text-muted-foreground tabular-nums">{filtered.length} laporan</span>
              </div>

              {/* Filter */}
              <Select value={filterStatus} onValueChange={(v: "all" | DuplicateStatus) => setFilterStatus(v)}>
                <SelectTrigger className="h-7 text-[11px]">
                  <div className="flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua — Sort by Similarity</SelectItem>
                  <SelectItem value="duplicate">Duplicate</SelectItem>
                  <SelectItem value="potential_duplicate">Potential Duplicate</SelectItem>
                  <SelectItem value="duplicate_by_system">Duplicate by System</SelectItem>
                </SelectContent>
              </Select>

              {/* List */}
              <div className="space-y-1.5">
                {filtered.length > 0 ? (
                  filtered.map(r => <ListItem key={r.id} r={r} />)
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <FileText className="w-7 h-7 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">Tidak ada laporan</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Cluster dibuat oleh AI · {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>Tutup</Button>
        </div>
      </div>

      {/* ── Annotation Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <XCircle className="w-5 h-5 text-warning" />
              Bukan Duplicate
            </DialogTitle>
            <DialogDescription>Berikan alasan. Laporan akan masuk ke antrian labeling.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <Textarea placeholder="Alasan mengapa bukan duplicate…" value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[80px] text-sm" />
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
              <Send className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground"><span className="font-medium text-primary">Masuk Antrian Labeling</span> — TBC/PSPP.gr</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowDialog(false)} disabled={submitting}>Batal</Button>
            <Button size="sm" onClick={submitAnnotation} disabled={!notes.trim() || submitting} className="gap-1.5">
              {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan…</> : <><Send className="w-3.5 h-3.5" /> Kirim</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DuplicateClusterDetailPanel;
