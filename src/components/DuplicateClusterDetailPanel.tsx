import { useState, useEffect, useCallback } from "react";
import { X, Star, Clock, User, MapPin, FileText, Image, Brain, Calendar, ChevronDown, ChevronUp, Globe, Type, CheckCircle2, XCircle, Timer, AlertTriangle, Send, Loader2, Copy, Check, Zap, RefreshCw, Image as ImageIcon } from "lucide-react";
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

// Duplicate Status
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
      return { label: 'Duplicate by System', sublabel: 'Terupload 2 kali', className: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30', icon: RefreshCw };
    case 'duplicate':
      return { label: 'Duplicate', sublabel: null, className: 'bg-destructive/10 text-destructive border-destructive/30', icon: null };
    case 'potential_duplicate':
    default:
      return { label: 'Potential Duplicate', sublabel: null, className: 'bg-warning/10 text-warning border-warning/30', icon: null };
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

const CopyIdButton = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast({ title: "ID berhasil disalin!" });
    setTimeout(() => setCopied(false), 2000);
  }, [id]);
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-colors">
      <span className="font-mono text-xs font-semibold text-primary">{id}</span>
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-primary" />}
    </button>
  );
};

// Analysis Section matching HazardDuplicateFloatingPanel
const AnalysisSection = ({ report, semanticScore, similarityBreakdown }: { report: HazardReport; semanticScore: number; similarityBreakdown: ReturnType<typeof generateSimilarityBreakdown> }) => {
  const [geoOpen, setGeoOpen] = useState(false);
  const [lexicalOpen, setLexicalOpen] = useState(false);
  const similarityExplanation = getSimilarityExplanation(similarityBreakdown);

  return (
    <div className="space-y-3">
      {/* Semantic Analysis - Similarity Breakdown */}
      <div className="p-3 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-semibold text-foreground">Analisis Semantik</span>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs ml-auto">{semanticScore}%</Badge>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Similarity Breakdown</p>
            <div className="space-y-1.5 bg-muted/30 p-2 rounded-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Image Similarity</span>
                <span className="font-mono text-foreground">{similarityBreakdown.imageSimilarity.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Text Similarity</span>
                <span className="font-mono text-foreground">{similarityBreakdown.textSimilarity.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs pl-3 border-l-2 border-muted">
                <span className="text-muted-foreground">Text – Description</span>
                <span className="font-mono text-foreground">{similarityBreakdown.textDescription.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs pl-3 border-l-2 border-muted">
                <span className="text-muted-foreground">Text – Location</span>
                <span className="font-mono text-foreground">{similarityBreakdown.textLocation.toLocaleString()}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-foreground">Total Similarity</span>
                <span className="font-mono text-primary">{similarityBreakdown.totalSimilarity.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="p-2 rounded-md bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Keterangan:</p>
            <p className="text-xs text-foreground capitalize">{similarityExplanation}</p>
          </div>
        </div>
      </div>

      {/* Geo Analysis */}
      <Collapsible open={geoOpen} onOpenChange={setGeoOpen}>
        <div className="rounded-lg border border-border overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full p-3 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-foreground">Analisis Geo (Lokasi)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">100%</Badge>
                {geoOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-3 bg-blue-500/5 border-t border-border">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-card border border-border">
                  <p className="text-muted-foreground">Site</p>
                  <p className="font-medium text-foreground">{report.site}</p>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <p className="text-muted-foreground">Area</p>
                  <p className="font-medium text-foreground">{report.lokasiArea || report.lokasi}</p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Lexical Analysis - 3 columns */}
      <Collapsible open={lexicalOpen} onOpenChange={setLexicalOpen}>
        <div className="rounded-lg border border-border overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full p-3 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-foreground">Analisis Lexical (Kata)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">100%</Badge>
                {lexicalOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-3 bg-orange-500/5 border-t border-border">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-card border border-border">
                  <p className="text-muted-foreground mb-1">Ketidaksesuaian</p>
                  <p className="font-medium text-foreground">{report.ketidaksesuaian || '-'}</p>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <p className="text-muted-foreground mb-1">Sub Ketidaksesuaian</p>
                  <p className="font-medium text-foreground">{report.subKetidaksesuaian || '-'}</p>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <p className="text-muted-foreground mb-1">Quick Action</p>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">Warning Letter</Badge>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

// Report Card component
const ReportCard = ({
  r, isRepresentative = false, showAnalysis = false, title = "Laporan", similarityBreakdown
}: {
  r: HazardReport; isRepresentative?: boolean; showAnalysis?: boolean; title?: string; similarityBreakdown: ReturnType<typeof generateSimilarityBreakdown>;
}) => {
  const semanticVal = r.duplicateScores ? Math.round(r.duplicateScores.semantic * 100) : 0;
  const status = getDuplicateStatus(r);
  const statusInfo = getDuplicateStatusInfo(status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`${statusInfo.className} gap-1`}>
          {statusInfo.icon && <statusInfo.icon className="w-3 h-3" />}
          {statusInfo.label}
        </Badge>
        {statusInfo.sublabel && <span className="text-xs text-muted-foreground">({statusInfo.sublabel})</span>}
      </div>

      {isRepresentative && (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 gap-1">
          <Star className="w-3 h-3 fill-current" />
          Representative
        </Badge>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <CopyIdButton id={r.id} />
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{r.timestamp || r.tanggal}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>{r.pelapor}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Site</p>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{r.site}</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Lokasi</p>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{r.lokasiArea || r.lokasi}</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Cluster Semantic</p>
        {r.cluster ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1">⊕ {r.cluster}</Badge>
            <CopyIdButton id={r.cluster} />
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </div>

      <div className="p-3 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Deskripsi Temuan</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{r.deskripsiTemuan}</p>
      </div>

      <div className="p-3 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Gambar Temuan (1)</span>
        </div>
        <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
        </div>
      </div>

      {showAnalysis && (
        <AnalysisSection report={r} semanticScore={semanticVal} similarityBreakdown={similarityBreakdown} />
      )}
    </div>
  );
};

interface DuplicateClusterDetailPanelProps {
  cluster: ClusterInfo;
  onClose: () => void;
  onViewReport?: (report: HazardReport) => void;
}

const DuplicateClusterDetailPanel = ({ cluster, onClose, onViewReport }: DuplicateClusterDetailPanelProps) => {
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

  const compSimilarityBreakdown = generateSimilarityBreakdown();

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
              toast({ title: "Label Dikonfirmasi Otomatis", description: `Laporan ${id} dikonfirmasi sebagai duplicate` });
            }
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [annotations]);

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
      case 'duplicate': return <Badge className="bg-green-500 text-white text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Duplicate</Badge>;
      case 'not_duplicate': return <Badge className="bg-red-500 text-white text-xs gap-1"><XCircle className="w-3 h-3" />Bukan Duplicate</Badge>;
      case 'auto_confirmed': return <Badge className="bg-blue-500 text-white text-xs gap-1"><Clock className="w-3 h-3" />Auto-confirmed</Badge>;
      default: return null;
    }
  };

  const SimilarReportItem = ({ r }: { r: HazardReport }) => {
    const semanticVal = r.duplicateScores ? Math.round(r.duplicateScores.semantic * 100) : 0;
    const isSelected = selectedComparisonId === r.id;
    const annotation = annotations[r.id];
    const timer = timers[r.id] || 0;
    const timerProgress = (timer / AUTO_CONFIRM_DURATION) * 100;

    return (
      <div
        className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}
        onClick={() => setSelectedComparisonId(r.id)}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{r.id}</p>
            <p className="text-xs text-muted-foreground">{r.tanggal} • {r.pelapor}</p>
          </div>
          <span className="text-lg font-bold text-primary">{semanticVal}%</span>
        </div>

        <div className="flex gap-1.5 mb-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">G:100%</Badge>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">L:100%</Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs">S:{semanticVal}%</Badge>
        </div>

        <div className="flex items-start gap-2 mb-3">
          <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground line-clamp-2">{r.deskripsiTemuan}</p>
        </div>

        {annotation ? (
          <div className="mb-2">{getAnnotationBadge(r.id)}</div>
        ) : (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>Auto-confirm dalam:</span></div>
              <span className="font-mono">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
            </div>
            <Progress value={timerProgress} className="h-1.5" />
          </div>
        )}

        {!annotation && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20 text-xs"
              onClick={(e) => { e.stopPropagation(); handleAnnotate(r.id, 'duplicate'); }}>
              <CheckCircle2 className="w-3 h-3 mr-1" />Duplicate
            </Button>
            <Button size="sm" variant="outline" className="flex-1 bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20 text-xs"
              onClick={(e) => { e.stopPropagation(); handleAnnotate(r.id, 'not_duplicate'); }}>
              <XCircle className="w-3 h-3 mr-1" />Bukan Duplicate
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-6xl h-full bg-card shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Semantic Review</h3>
                <p className="text-sm text-muted-foreground">Mode Perbandingan Makna • {duplicateReports.length} laporan mirip</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 3-Column Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Representative */}
          <ScrollArea className="w-1/3 border-r border-border">
            <div className="p-4">
              {representativeReport && (
                <ReportCard r={representativeReport} isRepresentative title="Laporan Utama" showAnalysis={false} similarityBreakdown={generateSimilarityBreakdown()} />
              )}
            </div>
          </ScrollArea>

          {/* Middle Column - Comparison */}
          <ScrollArea className="w-1/3 border-r border-border bg-muted/5">
            <div className="p-4">
              {selectedComparison ? (
                <ReportCard r={selectedComparison} title="Laporan Pembanding" showAnalysis similarityBreakdown={compSimilarityBreakdown} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Pilih laporan dari daftar di kanan</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Right Column - Similar Reports List */}
          <ScrollArea className="w-1/3">
            <div className="p-4">
              <h4 className="font-semibold text-foreground text-sm mb-4">Laporan Mirip (berdasarkan makna)</h4>

              <Select value={sortBy} onValueChange={(v: 'semantic' | 'geo' | 'lexical') => setSortBy(v)}>
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semantic">Semantic Tertinggi</SelectItem>
                  <SelectItem value="geo">Geo Tertinggi</SelectItem>
                  <SelectItem value="lexical">Lexical Tertinggi</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-3">
                {sortedDuplicates.length > 0 ? (
                  sortedDuplicates.map(r => <SimilarReportItem key={r.id} r={r} />)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tidak ada laporan mirip</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Cluster dibuat oleh AI • {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
      </div>

      {/* Annotation Dialog */}
      <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-warning" />
              Anotasi: Bukan Duplicate
            </DialogTitle>
            <DialogDescription>Berikan alasan mengapa laporan ini bukan duplicate. Laporan akan masuk ke antrian TBC/PSPP.gr labeling.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Catatan Anotasi <span className="text-destructive">*</span></label>
              <Textarea placeholder="Jelaskan mengapa laporan ini bukan duplicate..." value={annotationNotes} onChange={(e) => setAnnotationNotes(e.target.value)} className="min-h-[100px]" />
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-start gap-2">
                <Send className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">Masuk Antrian Labeling</p>
                  <p className="text-xs text-muted-foreground">Laporan akan masuk ke antrian TBC/PSPP.gr untuk dilakukan labeling ulang</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnnotationDialog(false)} disabled={isSubmitting}>Batal</Button>
            <Button onClick={handleSubmitAnnotation} disabled={!annotationNotes.trim() || isSubmitting} className="gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : <><Send className="w-4 h-4" />Simpan & Kirim ke Queue</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DuplicateClusterDetailPanel;
