import { useState } from "react";
import { X, Star, Clock, User, MapPin, FileText, Brain, Calendar, Building2, ChevronDown, ChevronUp, Globe, Type, Users } from "lucide-react";
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
  const isRepresentative = representativeReport?.id === report.id;
  
  // Other reports in cluster (excluding selected and representative)
  const otherReportsCount = clusterReports.length - (isRepresentative ? 1 : 2);
  
  // Calculate scores
  const geoScore = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : 0;
  const lexicalScore = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : 0;
  const semanticScore = report.duplicateScores ? Math.round(report.duplicateScores.semantic * 100) : 0;
  const overallScore = report.duplicateScores ? Math.round(report.duplicateScores.overall * 100) : 0;

  // Report Card Component
  const ReportCard = ({ r, isMain = false }: { r: HazardReport; isMain?: boolean }) => {
    const rGeo = r.duplicateScores ? Math.round(r.duplicateScores.geo * 100) : geoScore;
    const rLex = r.duplicateScores ? Math.round(r.duplicateScores.lexical * 100) : lexicalScore;
    const rSem = r.duplicateScores ? Math.round(r.duplicateScores.semantic * 100) : semanticScore;

    return (
      <div className="space-y-4">
        {/* Report Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              {isMain ? "Laporan Representative" : "Laporan Dipilih"}
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

        {/* Ketidaksesuaian */}
        <div className="grid grid-cols-1 gap-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ketidaksesuaian</p>
            <p className="text-sm text-foreground">{r.ketidaksesuaian || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Sub Ketidaksesuaian</p>
            <p className="text-sm text-foreground">{r.subKetidaksesuaian || "-"}</p>
          </div>
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

        {/* Quick Action */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Quick Action</p>
          <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
            {r.quickAction}
          </Badge>
        </div>

        {/* Analysis Section */}
        {!isMain && (
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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 lg:inset-8 bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Detail Duplicate - {report.id}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {cluster && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                    Cluster: {cluster.id}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  Score: {overallScore}%
                </Badge>
                {clusterReports.length > 0 && (
                  <Badge variant="outline" className="bg-muted/50 text-muted-foreground text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {clusterReports.length} laporan dalam cluster
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - Side by Side */}
        <div className="flex h-[calc(100%-4rem)]">
          {/* Left Side - Selected Report */}
          <div className="flex-1 border-r border-border">
            <ScrollArea className="h-full">
              <div className="p-6">
                <ReportCard r={report} isMain={false} />
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Representative Report */}
          <div className="flex-1 bg-muted/10">
            <ScrollArea className="h-full">
              <div className="p-6">
                {representativeReport && !isRepresentative ? (
                  <>
                    <ReportCard r={representativeReport} isMain={true} />
                    
                    {/* Other Reports Info */}
                    {otherReportsCount > 0 && (
                      <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">
                            +{otherReportsCount} laporan lain dalam cluster ini
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {clusterReports
                            .filter(cr => cr.id !== report.id && cr.id !== representativeReport.id)
                            .slice(0, 5)
                            .map(cr => (
                              <Badge key={cr.id} variant="outline" className="text-xs font-mono">
                                {cr.id}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : isRepresentative ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Star className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Laporan Representative
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Laporan ini adalah laporan utama (representative) dari cluster. 
                      Pilih laporan lain untuk membandingkan.
                    </p>
                    {clusterReports.length > 1 && (
                      <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">
                            {clusterReports.length - 1} laporan duplicate dalam cluster
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {clusterReports
                            .filter(cr => cr.id !== report.id)
                            .slice(0, 5)
                            .map(cr => (
                              <Badge key={cr.id} variant="outline" className="text-xs font-mono">
                                {cr.id}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Tidak Ada Cluster
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Laporan ini belum memiliki cluster duplicate yang teridentifikasi.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateHazardDetailPanel;

