import { useState, useMemo } from "react";
import { Search, MapPin, FileText, Layers, ChevronDown, Eye, AlertTriangle, Zap, Navigation, Star, Clock, User, Calendar, Building2, Brain, ChevronUp, Globe, Type, Users, Image, ExternalLink } from "lucide-react";
import { ClusterInfo, HazardReport, hazardReports, reportClusters } from "@/data/hazardReports";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import HierarchicalFilterSystem, { 
  HierarchicalFilterState, 
  initialFilterState 
} from "./HierarchicalFilterSystem";

interface HazardDuplicateListProps {
  onNavigateToCluster?: (clusterId: string) => void;
}

// Get all reports that have a cluster (duplicate reports)
const duplicateReports = hazardReports.filter(r => r.cluster);

// Analysis Section Component
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
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

const HazardDuplicateList = ({ onNavigateToCluster }: HazardDuplicateListProps) => {
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<HierarchicalFilterState>(initialFilterState);

  // Filter reports
  const filteredReports = useMemo(() => {
    return duplicateReports.filter(report => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          report.id.toLowerCase().includes(searchLower) ||
          report.deskripsiTemuan?.toLowerCase().includes(searchLower) ||
          report.site?.toLowerCase().includes(searchLower) ||
          report.lokasiArea?.toLowerCase().includes(searchLower) ||
          report.cluster?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Site filter
      if (filterState.site.length > 0) {
        if (!report.site || !filterState.site.includes(report.site)) return false;
      }

      // Location filter
      if (filterState.location.length > 0) {
        if (!report.lokasiArea || !filterState.location.includes(report.lokasiArea)) return false;
      }

      // Detail location filter
      if (filterState.detailLocation.length > 0) {
        if (!report.detailLokasi || !filterState.detailLocation.includes(report.detailLokasi)) return false;
      }

      // AI Cluster filters (only apply if physical context is selected)
      const isClusterFiltersEnabled = filterState.site.length > 0 && 
        filterState.location.length > 0 && 
        filterState.detailLocation.length > 0;

      if (isClusterFiltersEnabled) {
        // Geo cluster filter
        if (filterState.cluster.geo.enabled) {
          const geoScore = report.duplicateScores?.geo || 0;
          if (filterState.cluster.geo.mode === "same_area") {
            if (geoScore < 0.9) return false;
          } else {
            if (geoScore < 0.7 || geoScore >= 0.9) return false;
          }
        }

        // Lexical cluster filter
        if (filterState.cluster.lexical.enabled) {
          const lexicalScore = report.duplicateScores?.lexical || 0;
          if (lexicalScore < filterState.cluster.lexical.threshold) return false;
        }

        // Semantic cluster filter
        if (filterState.cluster.semantic.enabled) {
          const semanticScore = report.duplicateScores?.semantic || 0;
          if (semanticScore < filterState.cluster.semantic.threshold) return false;
        }
      }

      return true;
    });
  }, [searchTerm, filterState]);

  const handleViewDetail = (report: HazardReport) => {
    setSelectedReport(report);
  };

  const handleClosePanel = () => {
    setSelectedReport(null);
  };

  // Get data for side panel
  const getReportData = (report: HazardReport) => {
    const cluster = reportClusters.find(c => c.id === report.cluster);
    const clusterReports = report.cluster ? hazardReports.filter(r => r.cluster === report.cluster) : [];
    const representativeReport = clusterReports.length > 0 ? clusterReports[0] : null;
    
    const geoScore = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : 0;
    const lexicalScore = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : 0;
    const semanticScore = report.duplicateScores ? Math.round(report.duplicateScores.semantic * 100) : 0;

    return { cluster, clusterReports, representativeReport, geoScore, lexicalScore, semanticScore };
  };

  // Report Card Component
  const ReportCard = ({ 
    r, 
    isRepresentative = false, 
    showAnalysis = false,
    title = "Laporan",
    geoScore = 0,
    lexicalScore = 0,
    semanticScore = 0
  }: { 
    r: HazardReport; 
    isRepresentative?: boolean; 
    showAnalysis?: boolean;
    title?: string;
    geoScore?: number;
    lexicalScore?: number;
    semanticScore?: number;
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
    <>
      {/* Hierarchical Filter System */}
      <div className="mb-6">
        <HierarchicalFilterSystem
          filterState={filterState}
          onFilterChange={setFilterState}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Menampilkan {filteredReports.length} dari {duplicateReports.length} laporan duplikat
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex gap-6">
        {/* Left Column - Report Table */}
        <div className="flex-1">
          {filteredReports.length > 0 ? (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">ID</TableHead>
                    <TableHead className="w-[100px]">Tanggal</TableHead>
                    <TableHead className="w-[120px]">Site</TableHead>
                    <TableHead className="w-[140px]">Lokasi</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="w-[100px]">Cluster</TableHead>
                    <TableHead className="w-[120px]">Similarity</TableHead>
                    <TableHead className="w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => {
                    const geoScore = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : 0;
                    const lexScore = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : 0;
                    const semScore = report.duplicateScores ? Math.round(report.duplicateScores.semantic * 100) : 0;
                    
                    return (
                      <TableRow 
                        key={report.id}
                        className={`cursor-pointer hover:bg-muted/50 ${selectedReport?.id === report.id ? 'bg-primary/5' : ''}`}
                        onClick={() => handleViewDetail(report)}
                      >
                        <TableCell className="font-mono text-xs">{report.id}</TableCell>
                        <TableCell className="text-sm">{report.tanggal}</TableCell>
                        <TableCell className="text-sm">{report.site}</TableCell>
                        <TableCell className="text-sm">{report.lokasiArea || report.lokasi}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {report.deskripsiTemuan}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-xs">
                            SCL-{report.cluster?.replace('C-', '')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px] px-1">
                                    G:{geoScore}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover border">
                                  <p className="text-xs">Geo Score: {geoScore}%</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-[10px] px-1">
                                    L:{lexScore}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover border">
                                  <p className="text-xs">Lexical Score: {lexScore}%</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[10px] px-1">
                                    S:{semScore}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover border">
                                  <p className="text-xs">Semantic Score: {semScore}%</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border bg-card">
              <div className="text-muted-foreground mb-2">
                Tidak ada laporan yang cocok dengan filter
              </div>
              <p className="text-sm text-muted-foreground/70">
                Coba ubah atau reset filter untuk melihat lebih banyak hasil
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Detail Panel */}
        {selectedReport && (
          <div className="w-[400px] shrink-0">
            <div className="sticky top-4 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Detail Laporan</h3>
                <Button variant="ghost" size="sm" onClick={handleClosePanel}>
                  ×
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <ReportCard 
                  r={selectedReport}
                  showAnalysis={true}
                  geoScore={getReportData(selectedReport).geoScore}
                  lexicalScore={getReportData(selectedReport).lexicalScore}
                  semanticScore={getReportData(selectedReport).semanticScore}
                />
                
                {/* Navigate to Cluster */}
                {selectedReport.cluster && onNavigateToCluster && (
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2"
                      onClick={() => onNavigateToCluster(selectedReport.cluster!)}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Lihat Cluster SCL-{selectedReport.cluster.replace('C-', '')}
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HazardDuplicateList;
