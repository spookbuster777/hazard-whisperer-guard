import { useState, useEffect, useCallback } from "react";
import { X, Star, Clock, User, MapPin, FileText, Image, Brain, ArrowLeft, Calendar, Building2, ChevronDown, ChevronUp, Globe, Type, CheckCircle2, XCircle, Timer, AlertTriangle, Send, Loader2 } from "lucide-react";
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

// Annotation status types
type AnnotationStatus = "pending" | "duplicate" | "not_duplicate" | "auto_confirmed";

interface AnnotationData {
  status: AnnotationStatus;
  notes?: string;
  confirmedAt?: Date;
  confirmedBy?: string;
  queuedForLabeling?: boolean;
}

// Auto-confirm timer duration in seconds (e.g., 48 hours = 172800 seconds, using 60 for demo)
const AUTO_CONFIRM_DURATION = 60; // seconds for demo

// Analysis Section Component with expandable Geo & Lexical
const AnalysisSection = ({ 
  report, 
  geoScore, 
  lexicalScore, 
  semanticScore 
}: { 
  report: HazardReport; 
  geoScore: number; 
  lexicalScore: number; 
  semanticScore: number;
}) => {
  const [geoOpen, setGeoOpen] = useState(false);
  const [lexicalOpen, setLexicalOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Semantic Analysis - Always visible */}
      <div className="p-3 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Analisis Semantik</span>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs ml-auto">
            {semanticScore}%
          </Badge>
        </div>
        
        <div className="space-y-3">
          {/* Visual Signals */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
              <span>✨</span> Sinyal Visual Terdeteksi
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-xs">
                objek teridentifikasi
              </Badge>
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-xs">
                kondisi terdeteksi
              </Badge>
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-xs">
                konteks visual
              </Badge>
            </div>
          </div>

          {/* Interpretation */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
              <span>⊙</span> Interpretasi Makna
            </p>
            <p className="text-sm italic text-muted-foreground">
              Analisis semantik menunjukkan kemiripan visual dengan laporan utama berdasarkan konteks gambar dan deskripsi temuan.
            </p>
          </div>

          {/* Similarity Scores Summary */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Skor Kemiripan</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                Geo: {geoScore}%
              </Badge>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                Lexical: {lexicalScore}%
              </Badge>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                Semantic: {semanticScore}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Geo Analysis - Expandable */}
      <Collapsible open={geoOpen} onOpenChange={setGeoOpen}>
        <div className="rounded-lg border border-border overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full p-3 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-success" />
                <span className="text-sm font-semibold text-foreground">Analisis Geo (Lokasi)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                  {geoScore}%
                </Badge>
                {geoOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-3 bg-success/5 border-t border-border space-y-3">
              {/* Location Match */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Kecocokan Lokasi
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-card border border-border">
                    <p className="text-muted-foreground">Site</p>
                    <p className="font-medium text-foreground">{report.site}</p>
                  </div>
                  <div className="p-2 rounded bg-card border border-border">
                    <p className="text-muted-foreground">Area</p>
                    <p className="font-medium text-foreground">{report.lokasiArea || report.lokasi}</p>
                  </div>
                  <div className="p-2 rounded bg-card border border-border col-span-2">
                    <p className="text-muted-foreground">Detail Lokasi</p>
                    <p className="font-medium text-foreground">{report.detailLokasi}</p>
                  </div>
                </div>
              </div>

              {/* Radius Analysis */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>📍</span> Analisis Radius
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                    Dalam radius 500m
                  </Badge>
                  <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-xs">
                    Zona kerja sama
                  </Badge>
                </div>
              </div>

              {/* Geo Interpretation */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>⊙</span> Interpretasi
                </p>
                <p className="text-sm italic text-muted-foreground">
                  Lokasi laporan berada dalam radius yang sama dengan laporan utama. Site dan area menunjukkan kecocokan tinggi.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Lexical Analysis - Expandable */}
      <Collapsible open={lexicalOpen} onOpenChange={setLexicalOpen}>
        <div className="rounded-lg border border-border overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full p-3 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-warning" />
                <span className="text-sm font-semibold text-foreground">Analisis Lexical (Kata)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                  {lexicalScore}%
                </Badge>
                {lexicalOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-3 bg-warning/5 border-t border-border space-y-3">
              {/* Keyword Match */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>🔤</span> Kata Kunci Terdeteksi
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {report.jenisHazard && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                      {report.jenisHazard}
                    </Badge>
                  )}
                  {report.subJenisHazard && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                      {report.subJenisHazard}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-xs">
                    {report.quickAction}
                  </Badge>
                </div>
              </div>

              {/* Text Similarity */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>📝</span> Kecocokan Teks
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-card border border-border">
                    <p className="text-muted-foreground">Ketidaksesuaian</p>
                    <p className="font-medium text-foreground text-xs">{report.ketidaksesuaian?.slice(0, 30)}...</p>
                  </div>
                  <div className="p-2 rounded bg-card border border-border">
                    <p className="text-muted-foreground">Sub Kategori</p>
                    <p className="font-medium text-foreground text-xs">{report.subKetidaksesuaian?.slice(0, 25)}...</p>
                  </div>
                </div>
              </div>

              {/* N-gram Analysis */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>🔗</span> Pola N-gram
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-xs">
                    2-gram match: 65%
                  </Badge>
                  <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-xs">
                    3-gram match: 48%
                  </Badge>
                </div>
              </div>

              {/* Lexical Interpretation */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>⊙</span> Interpretasi
                </p>
                <p className="text-sm italic text-muted-foreground">
                  Analisis kata menunjukkan kesamaan pada kategori hazard, kata kunci deskripsi, dan pola teks yang digunakan.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
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
  const [selectedDuplicateId, setSelectedDuplicateId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("semantic");
  
  // Annotation states
  const [annotations, setAnnotations] = useState<Record<string, AnnotationData>>({});
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [annotationNotes, setAnnotationNotes] = useState("");
  const [pendingAnnotation, setPendingAnnotation] = useState<{ reportId: string; type: "duplicate" | "not_duplicate" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timer states for auto-confirm
  const [timers, setTimers] = useState<Record<string, number>>({});
  
  // First report is the representative (main report)
  const representativeReport = clusterReports[0];
  const duplicateReports = clusterReports.slice(1);
  
  // Selected duplicate for comparison view
  const selectedDuplicate = duplicateReports.find(r => r.id === selectedDuplicateId);
  
  // Calculate scores
  const geoScore = Math.round(cluster.components.locationRadius * 100);
  const lexicalScore = Math.round((cluster.components.locationName + cluster.components.detailLocation + cluster.components.nonCompliance + cluster.components.subNonCompliance) / 4 * 100);
  const semanticScore = Math.round((cluster.components.locationDescription + cluster.components.imageContext + cluster.components.findingDescription) / 3 * 100);

  // Initialize timers for pending reports
  useEffect(() => {
    const initialTimers: Record<string, number> = {};
    duplicateReports.forEach(report => {
      if (!annotations[report.id] || annotations[report.id].status === "pending") {
        initialTimers[report.id] = AUTO_CONFIRM_DURATION;
      }
    });
    setTimers(initialTimers);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        
        Object.keys(updated).forEach(reportId => {
          if (updated[reportId] > 0 && (!annotations[reportId] || annotations[reportId].status === "pending")) {
            updated[reportId] -= 1;
            hasChanges = true;
            
            // Auto-confirm when timer reaches 0
            if (updated[reportId] === 0) {
              setAnnotations(prevAnn => ({
                ...prevAnn,
                [reportId]: {
                  status: "auto_confirmed",
                  notes: "Label AI dikonfirmasi otomatis setelah timeout",
                  confirmedAt: new Date(),
                  confirmedBy: "System"
                }
              }));
              toast({
                title: "Label Dikonfirmasi Otomatis",
                description: `Laporan ${reportId} dikonfirmasi sebagai duplicate (AI label)`,
              });
            }
          }
        });
        
        return hasChanges ? updated : prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [annotations]);

  // Handle annotation action
  const handleAnnotate = useCallback((reportId: string, type: "duplicate" | "not_duplicate") => {
    if (type === "not_duplicate") {
      setPendingAnnotation({ reportId, type });
      setAnnotationNotes("");
      setShowAnnotationDialog(true);
    } else {
      // Direct duplicate confirmation
      setAnnotations(prev => ({
        ...prev,
        [reportId]: {
          status: "duplicate",
          confirmedAt: new Date(),
          confirmedBy: "Evaluator"
        }
      }));
      toast({
        title: "Dikonfirmasi sebagai Duplicate",
        description: `Laporan ${reportId} dikonfirmasi sebagai duplicate dari laporan utama`,
      });
    }
  }, []);

  // Submit annotation with notes
  const handleSubmitAnnotation = useCallback(() => {
    if (!pendingAnnotation) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setAnnotations(prev => ({
        ...prev,
        [pendingAnnotation.reportId]: {
          status: "not_duplicate",
          notes: annotationNotes,
          confirmedAt: new Date(),
          confirmedBy: "Evaluator",
          queuedForLabeling: true
        }
      }));
      
      toast({
        title: "Bukan Duplicate - Masuk Antrian Labeling",
        description: `Laporan ${pendingAnnotation.reportId} akan masuk ke antrian TBC/PSPP.gr labeling`,
      });
      
      setShowAnnotationDialog(false);
      setPendingAnnotation(null);
      setAnnotationNotes("");
      setIsSubmitting(false);
    }, 800);
  }, [pendingAnnotation, annotationNotes]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get annotation badge
  const getAnnotationBadge = (reportId: string) => {
    const annotation = annotations[reportId];
    if (!annotation || annotation.status === "pending") return null;
    
    switch (annotation.status) {
      case "duplicate":
        return (
          <Badge className="bg-success/20 text-success border-success/30 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Duplicate
          </Badge>
        );
      case "not_duplicate":
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30 gap-1">
            <XCircle className="w-3 h-3" />
            Bukan Duplicate
          </Badge>
        );
      case "auto_confirmed":
        return (
          <Badge className="bg-muted text-muted-foreground border-border gap-1">
            <Timer className="w-3 h-3" />
            Auto-confirmed
          </Badge>
        );
      default:
        return null;
    }
  };

  // Sort duplicate reports
  const sortedDuplicates = [...duplicateReports].sort((a, b) => {
    const aScore = a.duplicateScores?.[sortBy as keyof typeof a.duplicateScores] || 0;
    const bScore = b.duplicateScores?.[sortBy as keyof typeof b.duplicateScores] || 0;
    return (bScore as number) - (aScore as number);
  });

  // Render report card (used for both main and duplicate)
  const ReportCard = ({ report, isMain = false, showAnalysis = false }: { report: HazardReport; isMain?: boolean; showAnalysis?: boolean }) => {
    const reportGeo = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : geoScore;
    const reportLex = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : lexicalScore;
    const reportSem = report.duplicateScores ? Math.round(report.duplicateScores.semantic * 100) : semanticScore;

    return (
      <div className="space-y-4">
        {/* Report Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              {isMain ? "Laporan Utama" : "Laporan Pembanding"}
            </span>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {report.id}
          </Badge>
        </div>

        {/* Date & Reporter */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{report.tanggal}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{report.pelapor}</span>
          </div>
        </div>

        {/* Site & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Site</p>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{report.site}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Lokasi</p>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{report.lokasiArea || report.lokasi}</span>
            </div>
          </div>
        </div>

        {/* Cluster Info */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Asal Cluster</p>
          {report.cluster ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                ⊕ {report.cluster}
              </Badge>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Tidak ada cluster sebelumnya</span>
          )}
        </div>

        {/* Finding Description */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Deskripsi Temuan</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {report.deskripsiTemuan}
          </p>
        </div>

        {/* Finding Image Placeholder */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Image className="w-4 h-4" />
            <span className="text-sm font-medium">Gambar Temuan (1)</span>
          </div>
          <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center">
            <Image className="w-8 h-8 text-muted-foreground/30" />
          </div>
        </div>

        {/* Semantic Analysis */}
        {showAnalysis && (
          <AnalysisSection 
            report={report} 
            geoScore={reportGeo} 
            lexicalScore={reportLex} 
            semanticScore={reportSem} 
          />
        )}
      </div>
    );
  };

  // Duplicate report item in list
  const DuplicateReportItem = ({ report }: { report: HazardReport }) => {
    const matchPercent = report.duplicateScores 
      ? Math.round(report.duplicateScores.semantic * 100) 
      : semanticScore;
    const geoPercent = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : geoScore;
    const lexPercent = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : lexicalScore;
    const isSelected = selectedDuplicateId === report.id;
    const annotation = annotations[report.id];
    const timeRemaining = timers[report.id] || 0;
    const isPending = !annotation || annotation.status === "pending";

    return (
      <div
        className={`p-3 rounded-lg border transition-all ${
          isSelected 
            ? 'bg-primary/10 border-primary/50' 
            : 'bg-card border-border hover:border-primary/30 hover:bg-muted/30'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div 
            className="cursor-pointer flex-1"
            onClick={() => setSelectedDuplicateId(isSelected ? null : report.id)}
          >
            <p className="font-medium text-sm text-foreground">{report.id}</p>
            <p className="text-xs text-muted-foreground">{report.tanggal} • {report.pelapor}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-lg font-bold ${
              matchPercent >= 80 ? 'text-primary' :
              matchPercent >= 60 ? 'text-warning' : 'text-muted-foreground'
            }`}>
              {matchPercent}%
            </span>
            {getAnnotationBadge(report.id)}
          </div>
        </div>

        {/* Similarity Scores */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs px-1.5 py-0">
            G:{geoPercent}%
          </Badge>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs px-1.5 py-0">
            L:{lexPercent}%
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs px-1.5 py-0">
            S:{matchPercent}%
          </Badge>
        </div>

        {/* Image Badge & Thumbnail Row */}
        <div 
          className="flex items-center gap-3 mb-2 cursor-pointer"
          onClick={() => setSelectedDuplicateId(isSelected ? null : report.id)}
        >
          <div className="w-12 h-12 rounded bg-muted/50 flex items-center justify-center shrink-0">
            <Image className="w-4 h-4 text-muted-foreground/30" />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
            {report.deskripsiTemuan}
          </p>
        </div>

        {/* Timer & Action Buttons */}
        {isPending && (
          <div className="mt-3 pt-3 border-t border-border">
            {/* Countdown Timer */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Timer className="w-3.5 h-3.5" />
                <span>Auto-confirm dalam:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-mono font-semibold ${timeRemaining <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
            </div>
            <Progress 
              value={(timeRemaining / AUTO_CONFIRM_DURATION) * 100} 
              className="h-1 mb-3"
            />
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-8 gap-1.5 border-success/50 text-success hover:bg-success/10 hover:text-success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnnotate(report.id, "duplicate");
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Duplicate
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-8 gap-1.5 border-warning/50 text-warning hover:bg-warning/10 hover:text-warning"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnnotate(report.id, "not_duplicate");
                }}
              >
                <XCircle className="w-3.5 h-3.5" />
                Bukan Duplicate
              </Button>
            </div>
          </div>
        )}

        {/* Queued for labeling indicator */}
        {annotation?.queuedForLabeling && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-info/10 border border-info/30">
              <Send className="w-4 h-4 text-info" />
              <div className="flex-1">
                <p className="text-xs font-medium text-info">Masuk Antrian Labeling</p>
                <p className="text-xs text-muted-foreground">TBC/PSPP.gr labeling queue</p>
              </div>
            </div>
            {annotation.notes && (
              <div className="mt-2 p-2 rounded bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground italic">"{annotation.notes}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-4xl bg-card border-l border-border shadow-xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Semantic Review</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDuplicate ? "Mode Perbandingan Makna" : "Analisis Gambar & Deskripsi"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Comparison Summary (shown when duplicate selected) */}
          {selectedDuplicate && (
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Ringkasan Kemiripan Semantik
              </p>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  A: {representativeReport?.duplicateScores ? Math.round(representativeReport.duplicateScores.semantic * 100) : semanticScore}% | B: {selectedDuplicate?.duplicateScores ? Math.round(selectedDuplicate.duplicateScores.semantic * 100) : semanticScore}%
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge className="bg-success text-success-foreground gap-1 text-xs">
                  Keduanya Punya Gambar
                </Badge>
                {representativeReport?.site === selectedDuplicate?.site && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    ⊕ Site Sama
                  </Badge>
                )}
                {representativeReport?.lokasiArea === selectedDuplicate?.lokasiArea && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    ⊕ Lokasi Sama
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Main Report */}
          <div className="w-1/2 border-r border-border p-4 overflow-y-auto">
            {representativeReport && (
              <div>
                {/* Representative Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Representative
                  </Badge>
                </div>
                
                <ReportCard report={representativeReport} isMain showAnalysis />
              </div>
            )}
          </div>

          {/* Right Side - Duplicate Reports List or Selected Comparison */}
          <div className="w-1/2 p-4 overflow-hidden flex flex-col">
            {selectedDuplicate ? (
              /* Comparison View */
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedDuplicateId(null)}
                    className="gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke List
                  </Button>
                </div>
                
                <ReportCard report={selectedDuplicate} showAnalysis />
              </div>
            ) : (
              /* Duplicate List View */
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">Laporan Mirip (berdasarkan makna)</span>
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className="mb-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Urutkan..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semantic">Semantic Tertinggi</SelectItem>
                      <SelectItem value="lexical">Lexical Tertinggi</SelectItem>
                      <SelectItem value="geo">Geo Tertinggi</SelectItem>
                      <SelectItem value="overall">Overall Tertinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duplicate Reports List */}
                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-2">
                    {sortedDuplicates.length > 0 ? (
                      sortedDuplicates.map((report) => (
                        <DuplicateReportItem key={report.id} report={report} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Tidak ada laporan duplicate lainnya</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Cluster dibuat oleh AI • 24 Des 15:30</span>
            </div>
            {/* Annotation Summary */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1">
                <CheckCircle2 className="w-3 h-3 text-success" />
                {Object.values(annotations).filter(a => a.status === "duplicate" || a.status === "auto_confirmed").length}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <XCircle className="w-3 h-3 text-warning" />
                {Object.values(annotations).filter(a => a.status === "not_duplicate").length}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                {duplicateReports.length - Object.keys(annotations).filter(k => annotations[k].status !== "pending").length}
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
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
            <DialogDescription>
              Berikan alasan mengapa laporan ini bukan duplicate dari laporan utama. 
              Laporan akan masuk ke antrian TBC/PSPP.gr labeling.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Catatan Anotasi <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Jelaskan mengapa laporan ini bukan duplicate..."
                value={annotationNotes}
                onChange={(e) => setAnnotationNotes(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Contoh: "Lokasi berbeda meskipun deskripsi mirip", "Jenis hazard berbeda", dll.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-info/10 border border-info/30">
              <div className="flex items-start gap-2">
                <Send className="w-4 h-4 text-info mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-info">Masuk Antrian Labeling</p>
                  <p className="text-xs text-muted-foreground">
                    Laporan akan masuk ke antrian TBC/PSPP.gr untuk dilakukan labeling ulang oleh AI
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAnnotationDialog(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSubmitAnnotation}
              disabled={!annotationNotes.trim() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Simpan & Kirim ke Queue
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DuplicateClusterDetailPanel;