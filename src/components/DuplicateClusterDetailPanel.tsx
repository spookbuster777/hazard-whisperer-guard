import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Star, Clock, User, MapPin, FileText, Brain, Calendar, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Globe, Type, CheckCircle2, XCircle, Timer, AlertTriangle, Send, Loader2, Copy, Check, Zap, RefreshCw, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClusterInfo, hazardReports, HazardReport } from "@/data/hazardReports";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

type AnnotationStatus = "pending" | "duplicate" | "not_duplicate" | "auto_confirmed";

interface AnnotationData {
  status: AnnotationStatus;
  notes?: string;
  confirmedAt?: Date;
  confirmedBy?: string;
  queuedForLabeling?: boolean;
}

const AUTO_CONFIRM_DURATION = 60;

type DuplicateStatus = 'potential_duplicate' | 'duplicate' | 'duplicate_by_system';

const getDuplicateStatus = (report: HazardReport): DuplicateStatus => {
  const overallScore = report.duplicateScores?.overall || 0;
  if (overallScore >= 0.95) {
    const isSystemDuplicate = Math.random() > 0.7;
    if (isSystemDuplicate) return 'duplicate_by_system';
  }
  if (overallScore >= 0.85) return 'duplicate';
  return 'potential_duplicate';
};

const getDuplicateStatusInfo = (status: DuplicateStatus) => {
  switch (status) {
    case 'duplicate_by_system':
      return { label: 'Duplicate by System', sublabel: 'Terupload 2 kali', className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20', icon: RefreshCw };
    case 'duplicate':
      return { label: 'Duplicate', sublabel: null, className: 'bg-destructive/10 text-destructive border-destructive/20', icon: null };
    case 'potential_duplicate':
    default:
      return { label: 'Potential Duplicate', sublabel: null, className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20', icon: null };
  }
};

const generateSimilarityBreakdown = () => ({
  imageSimilarity: Math.floor(Math.random() * 500000000) + 100000000,
  textSimilarity: Math.floor(Math.random() * 100000000) + 10000000,
  textDescription: Math.floor(Math.random() * 100000000) + 10000000,
  textLocation: Math.floor(Math.random() * 100000000) + 10000000,
  totalSimilarity: Math.floor(Math.random() * 500000000) + 100000000,
});

const getSimilarityExplanation = (scores: ReturnType<typeof generateSimilarityBreakdown>) => {
  const explanations: string[] = [];
  if (scores.imageSimilarity > 300000000) explanations.push("gambar sama");
  else if (scores.imageSimilarity > 150000000) explanations.push("gambar berpotensi sama");
  if (scores.textDescription > 50000000) explanations.push("deskripsi sama");
  else if (scores.textDescription > 25000000) explanations.push("deskripsi berpotensi sama");
  if (scores.textLocation > 50000000) explanations.push("keterangan lokasi sama");
  else if (scores.textLocation > 25000000) explanations.push("keterangan lokasi berpotensi sama");
  return explanations.length > 0 ? explanations.join(", ") : "tidak ada kesamaan signifikan";
};

const CopyIdButton = ({ id, compact = false }: { id: string; compact?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast({ title: "Berhasil disalin", description: id });
    setTimeout(() => setCopied(false), 2000);
  }, [id]);
  return (
    <button onClick={handleCopy} className={`inline-flex items-center gap-1 rounded border border-border bg-muted/50 hover:bg-muted transition-colors ${compact ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}>
      <span className={`font-mono font-medium text-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>{id}</span>
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
    </button>
  );
};

// Semantic Analysis Section
const AnalysisSection = ({ report, semanticScore, similarityBreakdown }: { report: HazardReport; semanticScore: number; similarityBreakdown: ReturnType<typeof generateSimilarityBreakdown> }) => {
  const [geoOpen, setGeoOpen] = useState(false);
  const [lexicalOpen, setLexicalOpen] = useState(false);
  const similarityExplanation = getSimilarityExplanation(similarityBreakdown);

  return (
    <div className="space-y-2.5">
      {/* Semantic Analysis - Similarity Breakdown */}
      <div className="p-3 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-2 mb-2.5">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Analisis Semantik</span>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] ml-auto">{semanticScore}%</Badge>
        </div>
        <div className="space-y-2.5">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-1"><Zap className="w-3 h-3" /> Similarity Breakdown</p>
            <div className="space-y-1 bg-muted/30 p-2.5 rounded-md border border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Image Similarity</span>
                <span className="font-mono text-foreground tabular-nums">{similarityBreakdown.imageSimilarity.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Text Similarity</span>
                <span className="font-mono text-foreground tabular-nums">{similarityBreakdown.textSimilarity.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs pl-3 border-l-2 border-border">
                <span className="text-muted-foreground">Text – Description</span>
                <span className="font-mono text-foreground tabular-nums">{similarityBreakdown.textDescription.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs pl-3 border-l-2 border-border">
                <span className="text-muted-foreground">Text – Location</span>
                <span className="font-mono text-foreground tabular-nums">{similarityBreakdown.textLocation.toLocaleString()}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Total Similarity</span>
                <span className="font-mono text-primary tabular-nums">{similarityBreakdown.totalSimilarity.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="p-2 rounded-md bg-muted/40 border border-border/50">
            <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Keterangan</p>
            <p className="text-xs text-foreground capitalize">{similarityExplanation}</p>
          </div>
        </div>
      </div>

      {/* Geo Analysis */}
      <Collapsible open={geoOpen} onOpenChange={setGeoOpen}>
        <div className="rounded-lg border border-border overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full p-2.5 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-foreground">Analisis Geo (Lokasi)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px]">100%</Badge>
                {geoOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-2.5 border-t border-border bg-muted/20">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-card border border-border">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Site</p>
                  <p className="font-medium text-foreground">{report.site}</p>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Area</p>
                  <p className="font-medium text-foreground">{report.lokasiArea || report.lokasi}</p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Lexical Analysis */}
      <Collapsible open={lexicalOpen} onOpenChange={setLexicalOpen}>
        <div className="rounded-lg border border-border overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full p-2.5 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <Type className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-semibold text-foreground">Analisis Lexical (Kata)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-[10px]">100%</Badge>
                {lexicalOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-2.5 border-t border-border bg-muted/20">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-card border border-border">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Ketidaksesuaian</p>
                  <p className="font-medium text-foreground">{report.ketidaksesuaian || '-'}</p>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Sub Ketidaksesuaian</p>
                  <p className="font-medium text-foreground">{report.subKetidaksesuaian || '-'}</p>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Quick Action</p>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">Warning Letter</Badge>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

// Location Info Component
const LocationInfo = ({ r }: { r: HazardReport }) => (
  <div className="space-y-1.5">
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Site</p>
        <p className="text-xs font-medium text-foreground">{r.site || '-'}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Lokasi</p>
        <p className="text-xs font-medium text-foreground">{r.lokasiArea || r.lokasi || '-'}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Detail Lokasi</p>
        <p className="text-xs font-medium text-foreground">{r.detailLokasi || '-'}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Keterangan Lokasi</p>
        <p className="text-xs font-medium text-foreground">{(r as any).keteranganLokasi || '-'}</p>
      </div>
    </div>
  </div>
);

// Representative Report Card (left column) - no status labels, no cluster semantic
const RepresentativeCard = ({ r }: { r: HazardReport }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 gap-1 text-[10px]">
        <Star className="w-3 h-3 fill-current" />
        Representative
      </Badge>
    </div>

    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-semibold text-foreground">Laporan Utama</span>
      <CopyIdButton id={r.id} compact />
    </div>

    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{r.timestamp || r.tanggal}</span></div>
      <div className="flex items-center gap-1"><User className="w-3 h-3" /><span>{r.pelapor}</span></div>
    </div>

    <Separator />

    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">Lokasi</span>
      </div>
      <LocationInfo r={r} />
    </div>

    <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
      <div className="flex items-center gap-1.5 mb-1.5">
        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Deskripsi Temuan</span>
      </div>
      <p className="text-xs text-foreground leading-relaxed">{r.deskripsiTemuan}</p>
    </div>

    <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
      <div className="flex items-center gap-1.5 mb-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Gambar Temuan</span>
      </div>
      <div className="aspect-video rounded bg-muted/50 flex items-center justify-center border border-border/50">
        <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
      </div>
    </div>
  </div>
);

// Comparison Report Card (middle column) - with analysis moved above deskripsi
const ComparisonCard = ({ r, similarityBreakdown }: { r: HazardReport; similarityBreakdown: ReturnType<typeof generateSimilarityBreakdown> }) => {
  const semanticVal = r.duplicateScores ? Math.round(r.duplicateScores.semantic * 100) : 0;
  const status = getDuplicateStatus(r);
  const statusInfo = getDuplicateStatusInfo(status);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`${statusInfo.className} gap-1 text-[10px]`}>
          {statusInfo.icon && <statusInfo.icon className="w-3 h-3" />}
          {statusInfo.label}
        </Badge>
        {statusInfo.sublabel && <span className="text-[10px] text-muted-foreground">({statusInfo.sublabel})</span>}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-foreground">Laporan Pembanding</span>
        <CopyIdButton id={r.id} compact />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{r.timestamp || r.tanggal}</span></div>
        <div className="flex items-center gap-1"><User className="w-3 h-3" /><span>{r.pelapor}</span></div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Lokasi</span>
        </div>
        <LocationInfo r={r} />
      </div>

      <Separator />

      {/* Analysis moved ABOVE Deskripsi Temuan */}
      <AnalysisSection report={r} semanticScore={semanticVal} similarityBreakdown={similarityBreakdown} />

      <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-1.5 mb-1.5">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Deskripsi Temuan</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed">{r.deskripsiTemuan}</p>
      </div>

      <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-1.5 mb-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Gambar Temuan</span>
        </div>
        <div className="aspect-video rounded bg-muted/50 flex items-center justify-center border border-border/50">
          <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
        </div>
      </div>
    </div>
  );
};

interface DuplicateClusterDetailPanelProps {
  cluster: ClusterInfo;
  allClusters?: ClusterInfo[];
  onClose: () => void;
  onViewReport?: (report: HazardReport) => void;
  onNavigateCluster?: (cluster: ClusterInfo) => void;
}

const DuplicateClusterDetailPanel = ({ cluster, allClusters = [], onClose, onViewReport, onNavigateCluster }: DuplicateClusterDetailPanelProps) => {
  const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
  const representativeReport = clusterReports[0];
  const duplicateReports = clusterReports.slice(1);

  const [selectedComparisonId, setSelectedComparisonId] = useState<string | null>(
    duplicateReports.length > 0 ? duplicateReports[0].id : null
  );
  const selectedComparison = duplicateReports.find(r => r.id === selectedComparisonId) || null;

  const [sortBy, setSortBy] = useState<'semantic' | 'geo' | 'lexical'>('semantic');
  const [annotations, setAnnotations] = useState<Record<string, AnnotationData>>({});
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [annotationNotes, setAnnotationNotes] = useState("");
  const [pendingAnnotation, setPendingAnnotation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const compSimilarityBreakdown = useMemo(() => generateSimilarityBreakdown(), [selectedComparisonId]);

  // SCL ID
  const numId = cluster.id.replace('C-', '');
  const sclId = `SCL-${numId}`;

  // Cluster navigation
  const clusterIndex = allClusters.findIndex(c => c.id === cluster.id);
  const hasPrev = clusterIndex > 0;
  const hasNext = clusterIndex < allClusters.length - 1 && clusterIndex >= 0;

  // Stats: count statuses among duplicate reports
  const statusCounts = useMemo(() => {
    const counts = { duplicate: 0, potential_duplicate: 0, duplicate_by_system: 0 };
    duplicateReports.forEach(r => {
      const st = getDuplicateStatus(r);
      counts[st]++;
    });
    return counts;
  }, [duplicateReports]);

  const similarityPercent = Math.round(cluster.similarityScore * 100);

  useEffect(() => {
    const initialTimers: Record<string, number> = {};
    duplicateReports.forEach(r => {
      if (!annotations[r.id]) initialTimers[r.id] = AUTO_CONFIRM_DURATION;
    });
    setTimers(prev => ({ ...prev, ...initialTimers }));
  }, [duplicateReports.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          if (!annotations[id] && updated[id] > 0) {
            updated[id] -= 1;
            if (updated[id] === 0) {
              setAnnotations(a => ({
                ...a,
                [id]: { status: 'auto_confirmed', notes: 'Auto-confirmed by system', confirmedAt: new Date(), confirmedBy: 'System' }
              }));
              toast({ title: "Auto-confirmed", description: `Laporan ${id} dikonfirmasi sebagai duplicate` });
            }
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [annotations]);

  // Reset selection when cluster changes
  useEffect(() => {
    const reports = hazardReports.filter(r => r.cluster === cluster.id).slice(1);
    setSelectedComparisonId(reports.length > 0 ? reports[0].id : null);
  }, [cluster.id]);

  const sortedDuplicates = [...duplicateReports].sort((a, b) => {
    const aScore = a.duplicateScores?.[sortBy] || 0;
    const bScore = b.duplicateScores?.[sortBy] || 0;
    return bScore - aScore;
  });

  const handleAnnotate = useCallback((reportId: string, type: 'duplicate' | 'not_duplicate') => {
    if (type === 'not_duplicate') {
      setPendingAnnotation(reportId);
      setAnnotationNotes("");
      setShowAnnotationDialog(true);
    } else {
      setAnnotations(prev => ({ ...prev, [reportId]: { status: 'duplicate', confirmedAt: new Date(), confirmedBy: 'Evaluator' } }));
      toast({ title: "Dikonfirmasi sebagai Duplicate" });
    }
  }, []);

  const handleSubmitAnnotation = useCallback(() => {
    if (!pendingAnnotation) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setAnnotations(prev => ({
        ...prev,
        [pendingAnnotation]: { status: 'not_duplicate', notes: annotationNotes, confirmedAt: new Date(), confirmedBy: 'Evaluator', queuedForLabeling: true }
      }));
      toast({ title: "Bukan Duplicate - Masuk Antrian Labeling" });
      setShowAnnotationDialog(false);
      setPendingAnnotation(null);
      setAnnotationNotes("");
      setIsSubmitting(false);
    }, 800);
  }, [pendingAnnotation, annotationNotes]);

  const getAnnotationBadge = (reportId: string) => {
    const annotation = annotations[reportId];
    if (!annotation || annotation.status === 'pending') return null;
    switch (annotation.status) {
      case 'duplicate': return <Badge className="bg-emerald-600 text-white text-[10px] gap-1"><CheckCircle2 className="w-3 h-3" />Duplicate</Badge>;
      case 'not_duplicate': return <Badge className="bg-red-600 text-white text-[10px] gap-1"><XCircle className="w-3 h-3" />Bukan Duplicate</Badge>;
      case 'auto_confirmed': return <Badge className="bg-blue-600 text-white text-[10px] gap-1"><Clock className="w-3 h-3" />Auto-confirmed</Badge>;
      default: return null;
    }
  };

  const handlePrevCluster = () => {
    if (hasPrev && onNavigateCluster) onNavigateCluster(allClusters[clusterIndex - 1]);
  };
  const handleNextCluster = () => {
    if (hasNext && onNavigateCluster) onNavigateCluster(allClusters[clusterIndex + 1]);
  };

  const SimilarReportItem = ({ r }: { r: HazardReport }) => {
    const semanticVal = r.duplicateScores ? Math.round(r.duplicateScores.semantic * 100) : 0;
    const isSelected = selectedComparisonId === r.id;
    const annotation = annotations[r.id];
    const timer = timers[r.id] || 0;
    const timerProgress = (timer / AUTO_CONFIRM_DURATION) * 100;

    return (
      <div
        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-muted-foreground/30'}`}
        onClick={() => setSelectedComparisonId(r.id)}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <p className="text-xs font-semibold text-foreground font-mono">{r.id}</p>
            <p className="text-[10px] text-muted-foreground">{r.tanggal} • {r.pelapor}</p>
          </div>
          <span className="text-sm font-bold text-primary tabular-nums">{semanticVal}%</span>
        </div>

        <div className="flex gap-1 mb-1.5">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] px-1.5 py-0">G:100%</Badge>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-[10px] px-1.5 py-0">L:100%</Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] px-1.5 py-0">S:{semanticVal}%</Badge>
        </div>

        <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">{r.deskripsiTemuan}</p>

        {annotation ? (
          <div className="mb-1">{getAnnotationBadge(r.id)}</div>
        ) : (
          <div className="mb-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
              <div className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /><span>Auto-confirm</span></div>
              <span className="font-mono tabular-nums">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
            </div>
            <Progress value={timerProgress} className="h-1" />
          </div>
        )}

        {!annotation && (
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="flex-1 h-7 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 text-[10px]"
              onClick={(e) => { e.stopPropagation(); handleAnnotate(r.id, 'duplicate'); }}>
              <CheckCircle2 className="w-3 h-3 mr-0.5" />Duplicate
            </Button>
            <Button size="sm" variant="outline" className="flex-1 h-7 bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20 text-[10px]"
              onClick={(e) => { e.stopPropagation(); handleAnnotate(r.id, 'not_duplicate'); }}>
              <XCircle className="w-3 h-3 mr-0.5" />Bukan
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Background - no blur */}
      <div className="absolute inset-0 bg-background/80" onClick={onClose} />

      <div className="relative w-full max-w-[1400px] h-full bg-card shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header - Enterprise grade with SCL ID, stats, nav */}
        <div className="px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground text-sm">Semantic Review</h3>
                  <CopyIdButton id={sclId} compact />
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-xs text-muted-foreground">Similarity</span>
                  <span className={`text-sm font-bold tabular-nums ${similarityPercent >= 85 ? 'text-destructive' : similarityPercent >= 75 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}`}>
                    {similarityPercent}%
                  </span>
                </div>
                {/* Stats row */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{duplicateReports.length} laporan mirip</span>
                  <Separator orientation="vertical" className="h-3" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">Dup: {statusCounts.duplicate}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">Potential: {statusCounts.potential_duplicate}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-medium">System: {statusCounts.duplicate_by_system}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Cluster navigation */}
              {allClusters.length > 1 && (
                <div className="flex items-center gap-1 mr-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevCluster} disabled={!hasPrev}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground tabular-nums px-1">
                    {clusterIndex + 1}/{allClusters.length}
                  </span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextCluster} disabled={!hasNext}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 3-Column Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Representative */}
          <ScrollArea className="w-[30%] border-r border-border">
            <div className="p-3">
              {representativeReport && <RepresentativeCard r={representativeReport} />}
            </div>
          </ScrollArea>

          {/* Middle Column - Comparison with analysis above deskripsi */}
          <ScrollArea className="w-[40%] border-r border-border">
            <div className="p-3">
              {selectedComparison ? (
                <ComparisonCard r={selectedComparison} similarityBreakdown={compSimilarityBreakdown} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">Pilih laporan dari daftar di kanan</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Right Column - Navigation */}
          <ScrollArea className="w-[30%]">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Laporan Mirip</h4>
                <Select value={sortBy} onValueChange={(v: 'semantic' | 'geo' | 'lexical') => setSortBy(v)}>
                  <SelectTrigger className="w-[120px] h-7 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semantic">Semantic</SelectItem>
                    <SelectItem value="geo">Geo</SelectItem>
                    <SelectItem value="lexical">Lexical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {sortedDuplicates.length > 0 ? (
                  sortedDuplicates.map(r => <SimilarReportItem key={r.id} r={r} />)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-xs">Tidak ada laporan mirip</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border bg-card flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Cluster dibuat oleh AI • {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>Tutup</Button>
        </div>
      </div>

      {/* Annotation Dialog */}
      <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <XCircle className="w-4 h-4 text-amber-500" />
              Anotasi: Bukan Duplicate
            </DialogTitle>
            <DialogDescription className="text-xs">Berikan alasan. Laporan akan masuk antrian TBC/PSPP.gr labeling.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Catatan <span className="text-destructive">*</span></label>
              <Textarea placeholder="Jelaskan mengapa bukan duplicate..." value={annotationNotes} onChange={(e) => setAnnotationNotes(e.target.value)} className="min-h-[80px] text-xs" />
            </div>
            <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <Send className="w-3.5 h-3.5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-primary">Masuk Antrian Labeling</p>
                  <p className="text-[10px] text-muted-foreground">Laporan akan masuk ke antrian TBC/PSPP.gr</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAnnotationDialog(false)} disabled={isSubmitting}>Batal</Button>
            <Button size="sm" onClick={handleSubmitAnnotation} disabled={!annotationNotes.trim() || isSubmitting} className="gap-1.5">
              {isSubmitting ? <><Loader2 className="w-3 h-3 animate-spin" />Menyimpan...</> : <><Send className="w-3 h-3" />Simpan</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DuplicateClusterDetailPanel;
