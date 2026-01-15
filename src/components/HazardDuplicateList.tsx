import { useState, useMemo } from "react";
import { Search, MapPin, FileText, Layers, ChevronDown, Eye, AlertTriangle, Zap, Navigation, Star, Clock, User, Calendar, Building2, Brain, ChevronUp, Globe, Type, Users, Image, ExternalLink } from "lucide-react";
import HazardDuplicateFloatingPanel from "./HazardDuplicateFloatingPanel";
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

      // AI Cluster filters - now using cluster codes (GCL-xxx, LCL-xxx, SCL-xxx)
      // Geo cluster filter
      if (filterState.cluster.geo.enabled && filterState.cluster.geo.codes.length > 0) {
        const geoScore = report.duplicateScores?.geo || 0;
        // In production, this would match actual cluster assignments
        if (geoScore < 0.5) return false;
      }

      // Lexical cluster filter
      if (filterState.cluster.lexical.enabled && filterState.cluster.lexical.codes.length > 0) {
        const lexicalScore = report.duplicateScores?.lexical || 0;
        if (lexicalScore < 0.5) return false;
      }

      // Semantic cluster filter
      if (filterState.cluster.semantic.enabled && filterState.cluster.semantic.codes.length > 0) {
        const semanticScore = report.duplicateScores?.semantic || 0;
        if (semanticScore < 0.5) return false;
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
      {/* Hierarchical Filter System with Content inside */}
      <HierarchicalFilterSystem
        filterState={filterState}
        onFilterChange={setFilterState}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Menampilkan {filteredReports.length} dari {duplicateReports.length} laporan duplikat
        </div>

        {/* Main Content - Table + Detail Panel */}
        <div className="flex gap-6">
          {/* Left Column - Report Table */}
          <div className="flex-1">
            {filteredReports.length > 0 ? (
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead className="w-[90px]">Tanggal</TableHead>
                      <TableHead className="w-[100px]">Site</TableHead>
                      <TableHead className="w-[120px]">Lokasi</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="w-[140px]">Cluster</TableHead>
                      <TableHead className="w-[80px] text-center">Similarity</TableHead>
                      <TableHead className="w-[60px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => {
                      const geoScore = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : 0;
                      const lexScore = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : 0;
                      const semScore = report.duplicateScores ? Math.round(report.duplicateScores.semantic * 100) : 0;
                      const avgScore = Math.round((geoScore + lexScore + semScore) / 3);
                      
                      // Generate cluster codes based on report cluster
                      const clusterNum = report.cluster?.replace('C-', '') || '001';
                      const gclCode = `GCL-${clusterNum}`;
                      const lclCode = `LCL-${clusterNum}`;
                      const sclCode = `SCL-${clusterNum}`;
                      
                      // Compact ID - show only last 8 chars
                      const compactId = report.id.length > 8 ? report.id.slice(-8) : report.id;
                      
                      return (
                        <TableRow 
                          key={report.id}
                          className={`cursor-pointer hover:bg-muted/50 ${selectedReport?.id === report.id ? 'bg-primary/5' : ''}`}
                          onClick={() => handleViewDetail(report)}
                        >
                          <TableCell>
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-mono text-xs text-muted-foreground">{compactId}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover border">
                                  <p className="text-xs font-mono">{report.id}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{report.tanggal}</TableCell>
                          <TableCell className="text-xs">{report.site}</TableCell>
                          <TableCell className="text-xs">{report.lokasiArea || report.lokasi}</TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">
                            {report.deskripsiTemuan}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-0.5">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                {gclCode}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                {lclCode}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                {sclCode}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-semibold ${
                                    avgScore >= 80 ? 'bg-red-500/15 text-red-600' :
                                    avgScore >= 60 ? 'bg-orange-500/15 text-orange-600' :
                                    'bg-green-500/15 text-green-600'
                                  }`}>
                                    {avgScore}%
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover border p-2">
                                  <div className="space-y-1 text-xs">
                                    <p><span className="text-blue-500">Geo:</span> {geoScore}%</p>
                                    <p><span className="text-orange-500">Lexical:</span> {lexScore}%</p>
                                    <p><span className="text-purple-500">Semantic:</span> {semScore}%</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Eye className="w-3.5 h-3.5" />
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

        </div>
      </HierarchicalFilterSystem>

      {/* Floating Panel */}
      {selectedReport && (
        <HazardDuplicateFloatingPanel
          report={selectedReport}
          onClose={handleClosePanel}
        />
      )}
    </>
  );
};

export default HazardDuplicateList;
