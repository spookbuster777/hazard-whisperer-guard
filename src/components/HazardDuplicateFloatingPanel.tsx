import { useState } from "react";
import { X, Star, User, MapPin, FileText, Brain, Calendar, Building2, ChevronDown, ChevronUp, Globe, Type, Users, Image, ArrowLeft } from "lucide-react";
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
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">
                Geo: {geoScore}%
              </Badge>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">
                Lexical: {lexicalScore}%
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs">
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
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-foreground">Analisis Geo (Lokasi)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">
                  {geoScore}%
                </Badge>
                {geoOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-3 bg-blue-500/5 border-t border-border space-y-3">
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
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">
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
                <Type className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-foreground">Analisis Lexical (Kata)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">
                  {lexicalScore}%
                </Badge>
                {lexicalOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-3 bg-orange-500/5 border-t border-border space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>🔤</span> Kata Kunci Terdeteksi
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {report.jenisHazard && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">
                      {report.jenisHazard}
                    </Badge>
                  )}
                  {report.subJenisHazard && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">
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

interface HazardDuplicateFloatingPanelProps {
  report: HazardReport;
  onClose: () => void;
}

const HazardDuplicateFloatingPanel = ({ report, onClose }: HazardDuplicateFloatingPanelProps) => {
  // Find cluster info
  const cluster = reportClusters.find(c => c.id === report.cluster);
  
  // Get all reports in the same cluster
  const clusterReports = report.cluster 
    ? hazardReports.filter(r => r.cluster === report.cluster)
    : [];
  
  // Get representative report (first in cluster)
  const representativeReport = clusterReports.length > 0 ? clusterReports[0] : null;
  
  // Calculate scores
  const geoScore = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : 0;
  const lexicalScore = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : 0;
  const semanticScore = report.duplicateScores ? Math.round(report.duplicateScores.semantic * 100) : 0;

  const repGeoScore = representativeReport?.duplicateScores ? Math.round(representativeReport.duplicateScores.geo * 100) : geoScore;
  const repLexicalScore = representativeReport?.duplicateScores ? Math.round(representativeReport.duplicateScores.lexical * 100) : lexicalScore;
  const repSemanticScore = representativeReport?.duplicateScores ? Math.round(representativeReport.duplicateScores.semantic * 100) : semanticScore;

  // Average scores for summary
  const avgGeoScore = Math.round((geoScore + repGeoScore) / 2);
  const avgLexScore = Math.round((lexicalScore + repLexicalScore) / 2);
  const avgSemScore = Math.round((semanticScore + repSemanticScore) / 2);

  // Check site/location match
  const isSameSite = representativeReport?.site === report.site;
  const isSameLocation = representativeReport?.lokasiArea === report.lokasiArea;
  const bothHaveImages = true; // Placeholder - would check if both have images

  // Report Card Component
  const ReportCard = ({ 
    r, 
    isRepresentative = false, 
    showAnalysis = false,
    title = "Laporan",
    scores
  }: { 
    r: HazardReport; 
    isRepresentative?: boolean; 
    showAnalysis?: boolean;
    title?: string;
    scores: { geo: number; lexical: number; semantic: number };
  }) => {
    return (
      <div className="space-y-4">
        {/* Representative Badge */}
        {isRepresentative && (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 gap-1">
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
          <Badge variant="outline" className="font-mono text-xs bg-muted/50">
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
        <div>
          <p className="text-xs text-muted-foreground mb-1">Asal Cluster</p>
          {r.cluster ? (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              ⊕ {r.cluster}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
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
            geoScore={scores.geo} 
            lexicalScore={scores.lexical} 
            semanticScore={scores.semantic} 
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
      
      {/* Floating Panel */}
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
                  Mode Perbandingan Makna
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Similarity Summary */}
          <div className="mt-4 p-3 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Ringkasan Kemiripan Semantik</p>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                A: {semanticScore}% | B: {repSemanticScore}%
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {bothHaveImages && (
                <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                  Keduanya Punya Gambar
                </Badge>
              )}
              {isSameSite && (
                <Badge variant="outline" className="bg-muted/50 text-foreground border-border text-xs">
                  ⊕ Site Sama
                </Badge>
              )}
              {isSameLocation && (
                <Badge variant="outline" className="bg-muted/50 text-foreground border-border text-xs">
                  ⊕ Lokasi Sama
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content - Side by Side */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Selected Report */}
          <ScrollArea className="w-1/2 border-r border-border">
            <div className="p-4">
              <ReportCard 
                r={report} 
                isRepresentative={representativeReport?.id === report.id}
                title="Laporan Utama"
                showAnalysis 
                scores={{ geo: geoScore, lexical: lexicalScore, semantic: semanticScore }}
              />
            </div>
          </ScrollArea>

          {/* Right Side - Representative Report */}
          <ScrollArea className="w-1/2 bg-muted/5">
            <div className="p-4">
              {/* Back to list link */}
              <button 
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                onClick={onClose}
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke List
              </button>

              {representativeReport && representativeReport.id !== report.id ? (
                <ReportCard 
                  r={representativeReport} 
                  isRepresentative 
                  title="Laporan Pembanding"
                  showAnalysis 
                  scores={{ geo: repGeoScore, lexical: repLexicalScore, semantic: repSemanticScore }}
                />
              ) : representativeReport && representativeReport.id === report.id ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Star className="w-12 h-12 text-warning mb-4" />
                  <p className="text-foreground font-medium">Laporan ini adalah Representative</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Laporan pembanding tidak tersedia
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Tidak ada cluster terkait</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Cluster dibuat oleh AI • {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HazardDuplicateFloatingPanel;
