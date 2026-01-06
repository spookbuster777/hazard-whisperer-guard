import { useState } from "react";
import { X, Star, Clock, User, MapPin, FileText, Brain, Calendar, Building2, ChevronDown, ChevronUp, Globe, Type, Users, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { hazardReports, HazardReport, reportClusters } from "@/data/hazardReports";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  // Find cluster info
  const cluster = reportClusters.find(c => c.id === report.cluster);
  
  // Get all reports in the same cluster
  const clusterReports = report.cluster 
    ? hazardReports.filter(r => r.cluster === report.cluster)
    : [];
  
  // Get representative report (first in cluster)
  const representativeReport = clusterReports.length > 0 ? clusterReports[0] : null;
  
  // Other reports in cluster (excluding selected and representative)
  const otherReportsCount = clusterReports.length - 2; // excluding selected and representative
  
  // Calculate scores
  const geoScore = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : 0;
  const lexicalScore = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : 0;
  const semanticScore = report.duplicateScores ? Math.round(report.duplicateScores.semantic * 100) : 0;

  // Report Card Component - Same structure for both selected and representative
  const ReportCard = ({ 
    r, 
    isRepresentative = false, 
    showAnalysis = false,
    title = "Laporan"
  }: { 
    r: HazardReport; 
    isRepresentative?: boolean; 
    showAnalysis?: boolean;
    title?: string;
  }) => {
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
            <span className="font-semibold text-foreground">{title}</span>
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

        {/* Detail Lokasi */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Detail Lokasi</p>
          <span className="text-sm font-medium text-foreground">{r.detailLokasi}</span>
        </div>

        {/* Ketidaksesuaian */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Ketidaksesuaian</p>
          <span className="text-sm font-medium text-foreground">{r.ketidaksesuaian || '-'}</span>
        </div>

        {/* Sub Ketidaksesuaian */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Sub Ketidaksesuaian</p>
          <span className="text-sm font-medium text-foreground">{r.subKetidaksesuaian || '-'}</span>
        </div>

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
                  Perbandingan Laporan dengan Representative
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
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  cluster.status === 'Duplikat Kuat' 
                    ? 'bg-destructive/10 text-destructive border-destructive/30' 
                    : cluster.status === 'Duplikat Mungkin'
                    ? 'bg-warning/10 text-warning border-warning/30'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                {cluster.status}
              </Badge>
            </div>
          )}
        </div>

        {/* Content - Side by Side */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Selected Report */}
          <ScrollArea className="w-1/2 border-r border-border">
            <div className="p-4">
              <ReportCard 
                r={report} 
                isRepresentative={representativeReport?.id === report.id}
                title="Laporan Dipilih"
                showAnalysis 
              />
            </div>
          </ScrollArea>

          {/* Right Side - Representative Report */}
          <ScrollArea className="w-1/2 bg-muted/10">
            <div className="p-4">
              {representativeReport ? (
                <div className="space-y-6">
                  {/* Representative Report - Same content as left */}
                  <ReportCard 
                    r={representativeReport} 
                    isRepresentative 
                    title="Laporan Representative"
                    showAnalysis 
                  />
                  
                  {/* Cluster Info at Bottom */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 text-foreground mb-3">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">Informasi Cluster</span>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Cluster ID and Name */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Cluster ID</p>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                            {cluster?.id || report.cluster}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <Badge 
                            variant="outline" 
                            className={`${
                              cluster?.status === 'Duplikat Kuat' 
                                ? 'bg-destructive/10 text-destructive border-destructive/30' 
                                : cluster?.status === 'Duplikat Mungkin'
                                ? 'bg-warning/10 text-warning border-warning/30'
                                : 'bg-muted/50 text-muted-foreground'
                            }`}
                          >
                            {cluster?.status || 'Unknown'}
                          </Badge>
                        </div>
                      </div>

                      {/* Cluster Name */}
                      {cluster?.name && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Nama Cluster</p>
                          <span className="text-sm font-medium text-foreground">{cluster.name}</span>
                        </div>
                      )}

                      {/* Similarity Score */}
                      {cluster?.similarityScore && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Skor Kemiripan Cluster</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${cluster.similarityScore * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-primary">
                              {Math.round(cluster.similarityScore * 100)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Total Reports in Cluster */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Laporan</p>
                        <span className="text-sm font-medium text-foreground">
                          {clusterReports.length} laporan
                        </span>
                      </div>

                      {/* Other Reports Count */}
                      {otherReportsCount > 0 && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2">Laporan Lain dalam Cluster</p>
                          <div className="flex flex-wrap gap-1.5">
                            {clusterReports
                              .filter(r => r.id !== report.id && r.id !== representativeReport.id)
                              .slice(0, 5)
                              .map((r) => (
                                <Badge 
                                  key={r.id} 
                                  variant="outline" 
                                  className="font-mono text-[10px] bg-muted/50"
                                >
                                  {r.id}
                                </Badge>
                              ))}
                            {otherReportsCount > 5 && (
                              <Badge variant="outline" className="text-[10px] bg-muted/50">
                                +{otherReportsCount - 5} lainnya
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Tidak ada representative untuk cluster ini</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Cluster dibuat oleh AI • Otomatis</span>
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
