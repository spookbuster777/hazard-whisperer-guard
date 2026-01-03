import { useState, useMemo } from "react";
import { Layers, Search, Clock, Loader2, Filter, ChevronLeft, ChevronRight, RotateCcw, Info, ArrowUpDown, Check, Minus, Eye, MapPin, Type, Brain, FileCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HazardReport, DuplicateStatus, siteOptions, lokasiOptions } from "@/data/hazardReports";

interface AIDuplicateQueueTableProps {
  reports: HazardReport[];
  onViewDetail?: (report: HazardReport) => void;
  onViewCluster?: (report: HazardReport) => void;
}

// AI Processing States for each analysis stage
type AnalysisStageStatus = 'queued' | 'processing' | 'match' | 'no_match' | 'done';

// Derive AI analysis stages from duplicate status and scores
const getAnalysisStages = (report: HazardReport) => {
  const status = report.duplicateStatus;
  const scores = report.duplicateScores;
  
  // If completed, all stages are done with their match status
  if (status === "DUPLICATE_SELESAI" && scores) {
    return {
      ruleBased: scores.ruleBased >= 0.7 ? 'match' : 'no_match' as AnalysisStageStatus,
      geo: scores.geo >= 0.7 ? 'match' : 'no_match' as AnalysisStageStatus,
      lexical: scores.lexical >= 0.7 ? 'match' : 'no_match' as AnalysisStageStatus,
      semantic: 'done' as AnalysisStageStatus,
      aiStatus: 'Completed' as string
    };
  }
  
  // If currently processing
  if (status === "SEDANG_ANALISIS_DUPLICATE") {
    // Simulate different stages based on available scores
    if (scores?.semantic !== undefined) {
      return {
        ruleBased: scores.ruleBased >= 0.7 ? 'match' : 'no_match' as AnalysisStageStatus,
        geo: scores.geo >= 0.7 ? 'match' : 'no_match' as AnalysisStageStatus,
        lexical: scores.lexical >= 0.7 ? 'match' : 'no_match' as AnalysisStageStatus,
        semantic: 'processing' as AnalysisStageStatus,
        aiStatus: 'Analyzing Semantic' as string
      };
    }
    if (scores?.lexical !== undefined) {
      return {
        ruleBased: scores.ruleBased >= 0.7 ? 'match' : 'no_match' as AnalysisStageStatus,
        geo: scores.geo >= 0.7 ? 'match' : 'no_match' as AnalysisStageStatus,
        lexical: 'processing' as AnalysisStageStatus,
        semantic: 'queued' as AnalysisStageStatus,
        aiStatus: 'Analyzing Lexical' as string
      };
    }
    if (scores?.geo !== undefined) {
      return {
        ruleBased: scores.ruleBased >= 0.7 ? 'match' : 'no_match' as AnalysisStageStatus,
        geo: 'processing' as AnalysisStageStatus,
        lexical: 'queued' as AnalysisStageStatus,
        semantic: 'queued' as AnalysisStageStatus,
        aiStatus: 'Analyzing Geo' as string
      };
    }
    return {
      ruleBased: 'processing' as AnalysisStageStatus,
      geo: 'queued' as AnalysisStageStatus,
      lexical: 'queued' as AnalysisStageStatus,
      semantic: 'queued' as AnalysisStageStatus,
      aiStatus: 'Analyzing Rule-Based' as string
    };
  }
  
  // Queued - nothing started
  return {
    ruleBased: 'queued' as AnalysisStageStatus,
    geo: 'queued' as AnalysisStageStatus,
    lexical: 'queued' as AnalysisStageStatus,
    semantic: 'queued' as AnalysisStageStatus,
    aiStatus: 'Queued' as string
  };
};

// Icon-only status indicator
const StageIcon = ({ status, label }: { status: AnalysisStageStatus; label: string }) => {
  const getIconAndStyle = () => {
    switch (status) {
      case 'match':
        return { 
          icon: <Check className="w-3.5 h-3.5" />, 
          className: "text-success bg-success/10" 
        };
      case 'no_match':
        return { 
          icon: <Minus className="w-3.5 h-3.5" />, 
          className: "text-muted-foreground bg-muted/50" 
        };
      case 'processing':
        return { 
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, 
          className: "text-info bg-info/10" 
        };
      case 'done':
        return { 
          icon: <Check className="w-3.5 h-3.5" />, 
          className: "text-success bg-success/10" 
        };
      case 'queued':
      default:
        return { 
          icon: <Clock className="w-3.5 h-3.5" />, 
          className: "text-muted-foreground/50 bg-muted/30" 
        };
    }
  };

  const { icon, className } = getIconAndStyle();
  const tooltipText = {
    match: `${label}: Match`,
    no_match: `${label}: Not Checked`,
    processing: `${label}: Processing`,
    done: `${label}: Done`,
    queued: `${label}: Queued`
  }[status];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center cursor-help ${className}`}>
          {icon}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// AI Analysis Status Badge
const AIAnalysisStatusBadge = ({ status }: { status: string }) => {
  const getStyle = () => {
    switch (status) {
      case 'Completed':
        return "bg-success/10 text-success border-success/30";
      case 'Analyzing Semantic':
        return "bg-info/10 text-info border-info/30";
      case 'Analyzing Lexical':
      case 'Analyzing Geo':
      case 'Analyzing Rule-Based':
        return "bg-info/10 text-info border-info/30";
      case 'Queued':
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'Completed':
        return <Check className="w-3 h-3" />;
      case 'Queued':
        return <Clock className="w-3 h-3" />;
      default:
        return <Loader2 className="w-3 h-3 animate-spin" />;
    }
  };

  return (
    <Badge variant="outline" className={`gap-1 text-[10px] whitespace-nowrap ${getStyle()}`}>
      {getIcon()}
      {status}
    </Badge>
  );
};

// Duplicate Score Display (only when completed)
const DuplicateScoreDisplay = ({ score, isCompleted }: { score?: number; isCompleted: boolean }) => {
  if (!isCompleted || score === undefined) {
    return (
      <span className="text-xs text-muted-foreground">— (Processing)</span>
    );
  }

  const percentage = score * 100;
  
  const getScoreInfo = () => {
    if (percentage >= 85) {
      return { 
        label: "Duplikat Kuat", 
        color: "text-destructive",
        bgColor: "bg-destructive",
        emoji: "🔴"
      };
    }
    if (percentage >= 75) {
      return { 
        label: "Mirip (Perlu Review)", 
        color: "text-warning",
        bgColor: "bg-warning",
        emoji: "🟠"
      };
    }
    if (percentage >= 70) {
      return { 
        label: "Low Similarity", 
        color: "text-yellow-500",
        bgColor: "bg-yellow-500",
        emoji: "🟡"
      };
    }
    return { 
      label: "Tidak Duplikat", 
      color: "text-success",
      bgColor: "bg-success",
      emoji: "🟢"
    };
  };

  const { label, color, bgColor, emoji } = getScoreInfo();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help">
          <div className="w-14 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${bgColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className={`text-xs font-semibold ${color}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-[280px]">
        <p className="text-xs font-medium mb-1">{emoji} {label}</p>
        <p className="text-xs text-muted-foreground">
          Duplicate Score dihitung setelah seluruh analisis AI selesai. Nilai ≥75% dianggap berpotensi duplikat.
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

const getDuplicateStatusBadge = (status?: DuplicateStatus) => {
  switch (status) {
    case "MENUNGGU_ANALISIS_DUPLICATE":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1 text-[10px] whitespace-nowrap">
          Menunggu
        </Badge>
      );
    case "SEDANG_ANALISIS_DUPLICATE":
      return (
        <Badge variant="outline" className="bg-info/10 text-info border-info/30 gap-1 text-[10px] whitespace-nowrap">
          Diproses
        </Badge>
      );
    case "DUPLICATE_SELESAI":
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1 text-[10px] whitespace-nowrap">
          Selesai
        </Badge>
      );
    default:
      return null;
  }
};

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleString("id-ID", { 
    day: "2-digit", 
    month: "short",
    hour: "2-digit", 
    minute: "2-digit" 
  });
};

const ITEMS_PER_PAGE = 10;

const AIDuplicateQueueTable = ({ reports, onViewDetail, onViewCluster }: AIDuplicateQueueTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [aiStatusFilter, setAiStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Location filters
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [lokasiAreaFilter, setLokasiAreaFilter] = useState<string>("all");

  // Get lokasi options based on selected site
  const availableLokasiOptions = useMemo(() => {
    if (siteFilter === "all") {
      return [...new Set(Object.values(lokasiOptions).flat())];
    }
    return lokasiOptions[siteFilter] || [];
  }, [siteFilter]);

  // Reset dependent filters when parent changes
  const handleSiteChange = (value: string) => {
    setSiteFilter(value);
    setLokasiAreaFilter("all");
    setCurrentPage(1);
  };

  const handleLokasiAreaChange = (value: string) => {
    setLokasiAreaFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setAiStatusFilter("all");
    setSiteFilter("all");
    setLokasiAreaFilter("all");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    statusFilter !== "all" || 
    aiStatusFilter !== "all" ||
    siteFilter !== "all" ||
    lokasiAreaFilter !== "all";

  const filteredAndSortedReports = useMemo(() => {
    const filtered = reports.filter(report => {
      const matchesSearch = searchTerm === "" || 
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || report.duplicateStatus === statusFilter;
      const matchesSite = siteFilter === "all" || report.site === siteFilter;
      const matchesLokasiArea = lokasiAreaFilter === "all" || report.lokasiArea === lokasiAreaFilter;
      
      // AI Status filter
      const stages = getAnalysisStages(report);
      const matchesAiStatus = aiStatusFilter === "all" || 
        (aiStatusFilter === "Queued" && stages.aiStatus === "Queued") ||
        (aiStatusFilter === "Processing" && stages.aiStatus.startsWith("Analyzing")) ||
        (aiStatusFilter === "Completed" && stages.aiStatus === "Completed");
      
      return matchesSearch && matchesStatus && matchesSite && matchesLokasiArea && matchesAiStatus;
    });

    // Sort: SEDANG_ANALISIS_DUPLICATE always first, then by timestamp
    return filtered.sort((a, b) => {
      // Processing items always come first
      if (a.duplicateStatus === "SEDANG_ANALISIS_DUPLICATE" && b.duplicateStatus !== "SEDANG_ANALISIS_DUPLICATE") return -1;
      if (b.duplicateStatus === "SEDANG_ANALISIS_DUPLICATE" && a.duplicateStatus !== "SEDANG_ANALISIS_DUPLICATE") return 1;
      
      // Then sort by timestamp
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  }, [reports, searchTerm, statusFilter, aiStatusFilter, siteFilter, lokasiAreaFilter, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredAndSortedReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const menungguCount = reports.filter(r => r.duplicateStatus === "MENUNGGU_ANALISIS_DUPLICATE").length;
  const sedangProsesCount = reports.filter(r => r.duplicateStatus === "SEDANG_ANALISIS_DUPLICATE").length;

  return (
    <div className="bg-card rounded-lg card-shadow animate-fade-in">
      {/* Header Info */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Layers className="w-5 h-5 text-info" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Antrian AI Duplicate Detection</h2>
              <p className="text-sm text-muted-foreground">
                {menungguCount} menunggu · {sedangProsesCount} diproses
              </p>
            </div>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="mt-3 p-2.5 rounded-md bg-info/10 border border-info/20 flex items-start gap-2">
          <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
          <p className="text-xs text-info">
            AI menganalisis kemiripan laporan menggunakan <strong>Rule-based</strong>, <strong>Geo</strong> (lokasi), <strong>Lexical</strong> (kata), dan <strong>Semantic</strong> (makna). Duplicate Score hanya muncul setelah seluruh proses selesai.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-shrink-0 w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari..." 
              className="pl-9 bg-background h-8 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          
          <Select value={siteFilter} onValueChange={handleSiteChange}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Site</SelectItem>
              {siteOptions.map(site => (
                <SelectItem key={site} value={site}>{site}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={lokasiAreaFilter} onValueChange={handleLokasiAreaChange}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lokasi</SelectItem>
              {availableLokasiOptions.map(lok => (
                <SelectItem key={lok} value={lok}>{lok}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={aiStatusFilter} onValueChange={(v) => { setAiStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="AI Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua AI Status</SelectItem>
              <SelectItem value="Queued">Queued</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="h-8 px-2 text-xs gap-1"
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortOrder === "asc" ? "Terlama" : "Terbaru"}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">ID</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Timestamp</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Pelapor</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Site</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Lokasi</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-2 py-2.5 whitespace-nowrap w-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center cursor-help">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs max-w-[180px]">Rule-Based: Kecocokan aturan tetap (site, ketidaksesuaian)</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground px-2 py-2.5 whitespace-nowrap w-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center cursor-help">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs max-w-[180px]">Geo: Kedekatan lokasi geografis</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground px-2 py-2.5 whitespace-nowrap w-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center cursor-help">
                      <Type className="w-3.5 h-3.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs max-w-[180px]">Lexical: Kesamaan kata/teks</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground px-2 py-2.5 whitespace-nowrap w-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center cursor-help">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs max-w-[180px]">Semantic: Kesamaan makna (AI)</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">AI Analysis</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">
                <Tooltip>
                  <TooltipTrigger className="cursor-help underline decoration-dotted">Duplicate Score</TooltipTrigger>
                  <TooltipContent><p className="text-xs max-w-[220px]">Duplicate Score dihitung setelah seluruh analisis AI selesai. Nilai ≥75% dianggap berpotensi duplikat.</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Status</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap w-16">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-3 py-8 text-center text-muted-foreground">
                  Tidak ada laporan ditemukan
                </td>
              </tr>
            ) : (
              paginatedReports.map((report) => {
                const stages = getAnalysisStages(report);
                const isCompleted = report.duplicateStatus === "DUPLICATE_SELESAI";
                const showViewCluster = isCompleted && (report.duplicateScores?.overall ?? 0) >= 0.75;

                return (
                  <tr 
                    key={report.id} 
                    className="border-b border-border hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-medium text-foreground text-xs whitespace-nowrap">{report.id}</td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs whitespace-nowrap">{formatTimestamp(report.timestamp)}</td>
                    <td className="px-3 py-2.5 text-foreground text-xs whitespace-nowrap">{report.pelapor}</td>
                    <td className="px-3 py-2.5 text-foreground text-xs whitespace-nowrap">{report.site}</td>
                    <td className="px-3 py-2.5 text-foreground text-xs whitespace-nowrap">{report.lokasiArea || "-"}</td>
                    
                    {/* Icon-only analysis stage columns */}
                    <td className="px-2 py-2.5">
                      <div className="flex justify-center">
                        <StageIcon status={stages.ruleBased} label="Rule-Based" />
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex justify-center">
                        <StageIcon status={stages.geo} label="Geo" />
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex justify-center">
                        <StageIcon status={stages.lexical} label="Lexical" />
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex justify-center">
                        <StageIcon status={stages.semantic} label="Semantic" />
                      </div>
                    </td>

                    {/* AI Analysis Status */}
                    <td className="px-3 py-2.5">
                      <AIAnalysisStatusBadge status={stages.aiStatus} />
                    </td>

                    {/* Duplicate Score - only shown when completed */}
                    <td className="px-3 py-2.5">
                      <DuplicateScoreDisplay 
                        score={report.duplicateScores?.overall} 
                        isCompleted={isCompleted} 
                      />
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5">
                      {getDuplicateStatusBadge(report.duplicateStatus)}
                    </td>

                    {/* Action */}
                    <td className="px-3 py-2.5">
                      <div className="flex justify-center">
                        {showViewCluster ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-info hover:text-info hover:bg-info/10"
                                onClick={() => onViewCluster?.(report)}
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                Cluster
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Lihat Cluster Duplicate</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-border flex items-center justify-between bg-muted/10">
        <p className="text-xs text-muted-foreground">
          {filteredAndSortedReports.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSortedReports.length)} dari {filteredAndSortedReports.length}
        </p>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {currentPage} / {totalPages || 1}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIDuplicateQueueTable;
