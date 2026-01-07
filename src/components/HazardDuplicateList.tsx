import { useState, useMemo } from "react";
import { Search, Filter, X, MapPin, FileText, Layers, ChevronDown, Eye, AlertTriangle, Zap, Navigation, Star, Clock, User, Calendar, Building2, Brain, ChevronUp, Globe, Type, Users, Image, ExternalLink } from "lucide-react";
import { ClusterInfo, HazardReport, hazardReports, reportClusters, siteOptions } from "@/data/hazardReports";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ketidaksesuaianData } from "@/data/ketidaksesuaianData";

interface HazardDuplicateListProps {
  onNavigateToCluster?: (clusterId: string) => void;
}

// Get all reports that have a cluster (duplicate reports)
const duplicateReports = hazardReports.filter(r => r.cluster);

// Get unique values from hazard reports for filters
const getUniqueValues = (field: keyof HazardReport): string[] => {
  const values = duplicateReports.map(r => r[field]).filter(Boolean) as string[];
  return [...new Set(values)];
};

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
  
  // Filters
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedLokasi, setSelectedLokasi] = useState<string[]>([]);
  const [selectedKetidaksesuaian, setSelectedKetidaksesuaian] = useState<string[]>([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);

  const uniqueLokasiAreas = useMemo(() => getUniqueValues('lokasiArea'), []);
  const uniqueClusters = useMemo(() => [...new Set(duplicateReports.map(r => r.cluster).filter(Boolean))], []);

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

      if (selectedSites.length > 0 && (!report.site || !selectedSites.includes(report.site))) return false;
      if (selectedLokasi.length > 0 && (!report.lokasiArea || !selectedLokasi.includes(report.lokasiArea))) return false;
      if (selectedKetidaksesuaian.length > 0 && (!report.ketidaksesuaian || !selectedKetidaksesuaian.includes(report.ketidaksesuaian))) return false;
      if (selectedClusters.length > 0 && (!report.cluster || !selectedClusters.includes(report.cluster))) return false;

      return true;
    });
  }, [searchTerm, selectedSites, selectedLokasi, selectedKetidaksesuaian, selectedClusters]);

  const handleViewDetail = (report: HazardReport) => {
    setSelectedReport(report);
  };

  const handleClosePanel = () => {
    setSelectedReport(null);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedSites([]);
    setSelectedLokasi([]);
    setSelectedKetidaksesuaian([]);
    setSelectedClusters([]);
  };

  const activeFilterCount = [
    selectedSites,
    selectedLokasi,
    selectedKetidaksesuaian,
    selectedClusters
  ].filter(arr => arr.length > 0).length;

  const toggleArrayItem = (arr: string[], item: string, setter: (arr: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else {
      setter([...arr, item]);
    }
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
      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari laporan, ID, lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Cluster Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                Cluster
                {selectedClusters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {selectedClusters.length}
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-popover">
              <DropdownMenuLabel>Cluster</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {uniqueClusters.map(id => (
                <DropdownMenuCheckboxItem
                  key={id}
                  checked={selectedClusters.includes(id!)}
                  onCheckedChange={() => toggleArrayItem(selectedClusters, id!, setSelectedClusters)}
                >
                  {id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* More Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter Lainnya
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-popover">
              {/* Site Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Site
                  {selectedSites.length > 0 && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {selectedSites.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-popover">
                    {siteOptions.map(site => (
                      <DropdownMenuCheckboxItem
                        key={site}
                        checked={selectedSites.includes(site)}
                        onCheckedChange={() => toggleArrayItem(selectedSites, site, setSelectedSites)}
                      >
                        {site}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Lokasi Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Lokasi
                  {selectedLokasi.length > 0 && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {selectedLokasi.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-popover max-h-60 overflow-y-auto">
                    {uniqueLokasiAreas.map(lokasi => (
                      <DropdownMenuCheckboxItem
                        key={lokasi}
                        checked={selectedLokasi.includes(lokasi)}
                        onCheckedChange={() => toggleArrayItem(selectedLokasi, lokasi, setSelectedLokasi)}
                      >
                        {lokasi}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* Ketidaksesuaian Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Ketidaksesuaian
                  {selectedKetidaksesuaian.length > 0 && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {selectedKetidaksesuaian.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-popover max-h-60 overflow-y-auto w-72">
                    {ketidaksesuaianData.map(item => (
                      <DropdownMenuCheckboxItem
                        key={item.ketidaksesuaian}
                        checked={selectedKetidaksesuaian.includes(item.ketidaksesuaian)}
                        onCheckedChange={() => toggleArrayItem(selectedKetidaksesuaian, item.ketidaksesuaian, setSelectedKetidaksesuaian)}
                        className="text-xs"
                      >
                        <span className="line-clamp-2">{item.ketidaksesuaian}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {(searchTerm || activeFilterCount > 0) && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-1 text-muted-foreground">
              <X className="w-4 h-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Menampilkan {filteredReports.length} dari {duplicateReports.length} laporan duplicate
        </div>
      </div>

      {/* Table List */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">ID Laporan</TableHead>
              <TableHead className="w-[100px]">Tanggal</TableHead>
              <TableHead className="w-[120px]">Pelapor</TableHead>
              <TableHead className="w-[150px]">Site / Lokasi</TableHead>
              <TableHead className="w-[200px]">Deskripsi</TableHead>
              <TableHead className="w-[100px]">Cluster</TableHead>
              <TableHead className="w-[100px]">Similarity</TableHead>
              <TableHead className="w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => {
              const similarityScore = report.duplicateScores 
                ? Math.round(report.duplicateScores.semantic * 100) 
                : 0;
              return (
                <TableRow 
                  key={report.id} 
                  className="hover:bg-muted/30 cursor-pointer group"
                  onClick={() => handleViewDetail(report)}
                >
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {report.id}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {report.tanggal}
                  </TableCell>
                  <TableCell className="text-sm">
                    {report.pelapor}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-foreground">{report.site}</span>
                      <span className="text-xs text-muted-foreground">{report.lokasiArea || report.lokasi}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-foreground line-clamp-2 cursor-help">
                            {report.deskripsiTemuan?.slice(0, 60)}...
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>{report.deskripsiTemuan}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-0.5 text-xs">
                      <Layers className="w-3 h-3" />
                      {report.cluster}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-lg font-bold ${
                      similarityScore >= 85 ? 'text-destructive' :
                      similarityScore >= 75 ? 'text-warning' :
                      similarityScore >= 70 ? 'text-yellow-500' : 'text-success'
                    }`}>
                      {similarityScore}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 px-2 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(report);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Tidak ada laporan yang cocok dengan filter</p>
          <Button variant="link" onClick={clearAllFilters} className="mt-2">
            Reset semua filter
          </Button>
        </div>
      )}

      {/* Side Panel */}
      {selectedReport && (
        <HazardDuplicateSidePanel 
          report={selectedReport}
          onClose={handleClosePanel}
          onNavigateToCluster={onNavigateToCluster}
        />
      )}
    </>
  );
};

// Side Panel Component
interface HazardDuplicateSidePanelProps {
  report: HazardReport;
  onClose: () => void;
  onNavigateToCluster?: (clusterId: string) => void;
}

const HazardDuplicateSidePanel = ({ report, onClose, onNavigateToCluster }: HazardDuplicateSidePanelProps) => {
  const cluster = reportClusters.find(c => c.id === report.cluster);
  const clusterReports = report.cluster ? hazardReports.filter(r => r.cluster === report.cluster) : [];
  const representativeReport = clusterReports.length > 0 ? clusterReports[0] : null;
  
  const geoScore = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : 0;
  const lexicalScore = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : 0;
  const semanticScore = report.duplicateScores ? Math.round(report.duplicateScores.semantic * 100) : 0;

  const handleNavigateToCluster = () => {
    if (cluster && onNavigateToCluster) {
      onNavigateToCluster(cluster.id);
      onClose();
    }
  };

  // Report Card Component for side panel
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
        {isRepresentative && (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1">
            <Star className="w-3 h-3 fill-current" />
            Representative
          </Badge>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{title}</span>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {r.id}
          </Badge>
        </div>

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

        <div>
          <p className="text-xs text-muted-foreground mb-1">Detail Lokasi</p>
          <span className="text-sm font-medium text-foreground">{r.detailLokasi}</span>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Ketidaksesuaian</p>
          <span className="text-sm font-medium text-foreground">{r.ketidaksesuaian || '-'}</span>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Sub Ketidaksesuaian</p>
          <span className="text-sm font-medium text-foreground">{r.subKetidaksesuaian || '-'}</span>
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Deskripsi Temuan</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {r.deskripsiTemuan}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Image className="w-4 h-4" />
            <span className="text-sm font-medium">Gambar Temuan (1)</span>
          </div>
          <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center">
            <Image className="w-8 h-8 text-muted-foreground/30" />
          </div>
        </div>

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
      
      {/* Floating Sidebar */}
      <div className="relative w-full max-w-5xl h-full bg-card shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Hazard Duplicate Review</h3>
                <p className="text-sm text-muted-foreground">
                  Perbandingan Laporan Individual
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
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
                  <ReportCard 
                    r={representativeReport} 
                    isRepresentative 
                    title="Laporan Representative"
                    showAnalysis 
                  />
                  
                  {/* Cluster Summary - Clickable */}
                  {cluster && (
                    <button
                      onClick={handleNavigateToCluster}
                      className="w-full p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-primary/10 border border-purple-500/30 hover:border-purple-500/50 transition-all group text-left"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <Layers className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold">Cluster Semantic</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-purple-500 group-hover:text-purple-400">
                          <span>Lihat Detail Cluster</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Cluster ID</p>
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">
                            {cluster.id}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Laporan</p>
                          <span className="text-sm font-medium text-foreground">{clusterReports.length} laporan</span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Similarity</p>
                          <span className="text-lg font-bold text-primary">
                            {Math.round(cluster.similarityScore * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge 
                          variant="outline" 
                          className={`${
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
                    </button>
                  )}
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
            <span>Laporan individual • Cluster {report.cluster}</span>
          </div>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HazardDuplicateList;
