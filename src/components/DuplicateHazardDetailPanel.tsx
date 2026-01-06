import { useState } from "react";
import { X, Star, Clock, User, MapPin, FileText, Brain, Calendar, Building2, ChevronDown, ChevronUp, Globe, Type, Users, Image, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { hazardReports, HazardReport, reportClusters } from "@/data/hazardReports";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
                {geoOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-3 bg-success/5 border-t border-border space-y-3">
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
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>📍</span> Analisis Radius
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                    Dalam radius 500m
                  </Badge>
                </div>
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
                {lexicalOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-3 bg-warning/5 border-t border-border space-y-3">
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
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>📝</span> Kecocokan Teks
                </p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="p-2 rounded bg-card border border-border">
                    <p className="text-muted-foreground">Ketidaksesuaian</p>
                    <p className="font-medium text-foreground text-xs">{report.ketidaksesuaian?.slice(0, 40)}...</p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

interface DuplicateHazardDetailPanelProps {
  report: HazardReport;
  onClose: () => void;
}

const DuplicateHazardDetailPanel = ({ report, onClose }: DuplicateHazardDetailPanelProps) => {
  const [sortBy, setSortBy] = useState("semantic");
  const [selectedOtherId, setSelectedOtherId] = useState<string | null>(null);
  
  // Find cluster info
  const cluster = reportClusters.find(c => c.id === report.cluster);
  
  // Get all reports in the same cluster
  const clusterReports = report.cluster 
    ? hazardReports.filter(r => r.cluster === report.cluster)
    : [];
  
  // Get representative report (first in cluster)
  const representativeReport = clusterReports.length > 0 ? clusterReports[0] : null;
  const isSelectedRepresentative = representativeReport?.id === report.id;
  
  // Other reports in cluster (excluding selected)
  const otherReports = clusterReports.filter(r => r.id !== report.id);
  
  // Selected other report for viewing
  const selectedOtherReport = otherReports.find(r => r.id === selectedOtherId);
  
  // Sort other reports
  const sortedOtherReports = [...otherReports].sort((a, b) => {
    const aScore = a.duplicateScores?.[sortBy as keyof typeof a.duplicateScores] || 0;
    const bScore = b.duplicateScores?.[sortBy as keyof typeof b.duplicateScores] || 0;
    return (bScore as number) - (aScore as number);
  });
  
  // Calculate scores
  const geoScore = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : 0;
  const lexicalScore = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : 0;
  const semanticScore = report.duplicateScores ? Math.round(report.duplicateScores.semantic * 100) : 0;

  // Report Card Component
  const ReportCard = ({ r, isRepresentative = false, showAnalysis = false }: { r: HazardReport; isRepresentative?: boolean; showAnalysis?: boolean }) => {
    const rGeo = r.duplicateScores ? Math.round(r.duplicateScores.geo * 100) : geoScore;
    const rLex = r.duplicateScores ? Math.round(r.duplicateScores.lexical * 100) : lexicalScore;
    const rSem = r.duplicateScores ? Math.round(r.duplicateScores.semantic * 100) : semanticScore;

    return (
      <div className="space-y-4">
        {/* Representative Badge */}
        {isRepresentative && (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1">
            <Star className="w-3 h-3 fill-current" />
            Representative
          </Badge>
        )}

        {/* Report Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              {isRepresentative ? "Laporan Utama" : "Laporan Dipilih"}
            </span>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {r.id}
          </Badge>
        </div>

        {/* Date & Reporter */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{r.tanggal}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{r.pelapor}</span>
          </div>
        </div>

        {/* Site & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Site</p>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{r.site}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Lokasi</p>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{r.lokasiArea || r.lokasi}</span>
            </div>
          </div>
        </div>

        {/* Cluster Info */}
        {r.cluster && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Asal Cluster</p>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              ⊕ {r.cluster}
            </Badge>
          </div>
        )}

        {/* Finding Description */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Deskripsi Temuan</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {r.deskripsiTemuan}
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

        {/* Analysis Section */}
        {showAnalysis && (
          <AnalysisSection 
            report={r} 
            geoScore={rGeo} 
            lexicalScore={rLex} 
            semanticScore={rSem} 
          />
        )}
      </div>
    );
  };

  // Other Report Item in list
  const OtherReportItem = ({ r }: { r: HazardReport }) => {
    const matchPercent = r.duplicateScores 
      ? Math.round(r.duplicateScores.semantic * 100) 
      : semanticScore;
    const isSelected = selectedOtherId === r.id;
    const isRep = representativeReport?.id === r.id;

    return (
      <div
        className={`p-3 rounded-lg border transition-all cursor-pointer ${
          isSelected 
            ? 'bg-primary/10 border-primary/50' 
            : 'bg-card border-border hover:border-primary/30 hover:bg-muted/30'
        }`}
        onClick={() => setSelectedOtherId(isSelected ? null : r.id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="font-mono text-sm text-foreground">{r.id}</span>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{r.tanggal}</span>
              <span>•</span>
              <span>{r.pelapor}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-primary">{matchPercent}%</span>
            {isRep && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1 text-[10px] ml-2">
                <Star className="w-2.5 h-2.5 fill-current" />
                Rep
              </Badge>
            )}
          </div>
        </div>

        {/* Image indicator */}
        <Badge variant="outline" className="text-xs gap-1 bg-primary/10 text-primary border-primary/30 mb-2">
          <Clock className="w-3 h-3" />
          <Image className="w-3 h-3" />
          1 gambar
        </Badge>

        {/* Image placeholder */}
        <div className="w-full h-8 rounded bg-muted/50 flex items-center justify-center mb-2">
          <Image className="w-4 h-4 text-muted-foreground/30" />
        </div>

        {/* Description preview */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {r.deskripsiTemuan}
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
      
      {/* Floating Sidebar - Same size as DuplicateClusterDetailPanel */}
      <div className="relative w-full max-w-5xl h-full bg-card shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Semantic Review</h3>
                <p className="text-sm text-muted-foreground">
                  Analisis Gambar & Deskripsi
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Cluster Info Summary */}
          {cluster && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                Cluster: {cluster.id}
              </Badge>
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground text-xs">
                <Users className="w-3 h-3 mr-1" />
                {clusterReports.length} laporan dalam cluster
              </Badge>
            </div>
          )}
        </div>

        {/* Content - Side by Side */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Selected Report */}
          <div className="w-1/2 border-r border-border p-4 overflow-y-auto">
            <ReportCard r={report} isRepresentative={isSelectedRepresentative} showAnalysis />
          </div>

          {/* Right Side - Representative or Other Reports List */}
          <div className="w-1/2 p-4 overflow-hidden flex flex-col bg-muted/10">
            {selectedOtherReport ? (
              /* Comparison View */
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedOtherId(null)}
                    className="gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke List
                  </Button>
                </div>
                
                <ReportCard 
                  r={selectedOtherReport} 
                  isRepresentative={representativeReport?.id === selectedOtherReport.id} 
                  showAnalysis 
                />
              </div>
            ) : isSelectedRepresentative ? (
              /* When selected is representative, show list of other reports */
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

                {/* Other Reports List */}
                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-2">
                    {sortedOtherReports.length > 0 ? (
                      sortedOtherReports.map((r) => (
                        <OtherReportItem key={r.id} r={r} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Tidak ada laporan duplicate lainnya</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            ) : (
              /* When selected is NOT representative, show representative on right */
              <>
                {representativeReport && (
                  <div className="flex-1 overflow-y-auto">
                    <ReportCard r={representativeReport} isRepresentative showAnalysis={false} />
                    
                    {/* Other Reports Info */}
                    {otherReports.length > 1 && (
                      <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            +{otherReports.length - 1} laporan lain dalam cluster ini
                          </span>
                        </div>
                        
                        {/* Sort Dropdown */}
                        <div className="mb-3">
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full">
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
                        
                        {/* Clickable list */}
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {sortedOtherReports
                            .filter(r => r.id !== representativeReport.id)
                            .map((r) => (
                              <OtherReportItem key={r.id} r={r} />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

export default DuplicateHazardDetailPanel;
