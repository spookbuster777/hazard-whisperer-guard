import { useState } from "react";
import { X, Star, Clock, User, MapPin, FileText, Image, Brain, ArrowLeft, Calendar, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClusterInfo, hazardReports, HazardReport } from "@/data/hazardReports";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DuplicateClusterDetailPanelProps {
  cluster: ClusterInfo;
  onClose: () => void;
  onViewReport?: (report: HazardReport) => void;
}

const DuplicateClusterDetailPanel = ({ cluster, onClose, onViewReport }: DuplicateClusterDetailPanelProps) => {
  const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
  const [selectedDuplicateId, setSelectedDuplicateId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("semantic");
  
  // First report is the representative (main report)
  const representativeReport = clusterReports[0];
  const duplicateReports = clusterReports.slice(1);
  
  // Selected duplicate for comparison view
  const selectedDuplicate = duplicateReports.find(r => r.id === selectedDuplicateId);
  
  // Calculate scores
  const geoScore = Math.round(cluster.components.locationRadius * 100);
  const lexicalScore = Math.round((cluster.components.locationName + cluster.components.detailLocation + cluster.components.nonCompliance + cluster.components.subNonCompliance) / 4 * 100);
  const semanticScore = Math.round((cluster.components.locationDescription + cluster.components.imageContext + cluster.components.findingDescription) / 3 * 100);

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
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Analisis Semantik</span>
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

              {/* Similarity Scores */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Skor Kemiripan</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                    Geo: {reportGeo}%
                  </Badge>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                    Lexical: {reportLex}%
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                    Semantic: {reportSem}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Duplicate report item in list
  const DuplicateReportItem = ({ report }: { report: HazardReport }) => {
    const matchPercent = report.duplicateScores 
      ? Math.round(report.duplicateScores.semantic * 100) 
      : semanticScore;
    const isSelected = selectedDuplicateId === report.id;

    return (
      <div
        className={`p-3 rounded-lg border transition-all cursor-pointer ${
          isSelected 
            ? 'bg-primary/10 border-primary/50' 
            : 'bg-card border-border hover:border-primary/30 hover:bg-muted/30'
        }`}
        onClick={() => setSelectedDuplicateId(isSelected ? null : report.id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-medium text-sm text-foreground">{report.id}</p>
            <p className="text-xs text-muted-foreground">{report.tanggal} • {report.pelapor}</p>
          </div>
          <span className={`text-lg font-bold ${
            matchPercent >= 80 ? 'text-primary' :
            matchPercent >= 60 ? 'text-warning' : 'text-muted-foreground'
          }`}>
            {matchPercent}%
          </span>
        </div>

        {/* Image Badge */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1 text-xs">
            <span>⊙</span>
            <Image className="w-3 h-3" />
            1 gambar
          </Badge>
        </div>

        {/* Thumbnail */}
        <div className="w-12 h-12 rounded bg-muted/50 flex items-center justify-center mb-2">
          <Image className="w-4 h-4 text-muted-foreground/30" />
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {report.deskripsiTemuan}
        </p>
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Cluster dibuat oleh AI • 24 Des 15:30</span>
          </div>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateClusterDetailPanel;