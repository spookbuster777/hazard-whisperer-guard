import { useState, useMemo } from "react";
import { Layers, Search, Clock, Loader2, Filter, ChevronLeft, ChevronRight, RotateCcw, Info, ArrowUpDown, Check, MapPin, Type, Brain, Play, Pause, RefreshCw, ArrowUp, AlertTriangle, CheckCircle2, MoreHorizontal, Eye, Hourglass } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HazardReport, DuplicateStatus, siteOptions, lokasiOptions } from "@/data/hazardReports";
import { toast } from "sonner";

interface AIDuplicateQueueTableProps {
  reports: HazardReport[];
  onViewDetail?: (report: HazardReport) => void;
  onViewCluster?: (report: HazardReport) => void;
}

// Simplified Status Labels
type StatusLabel = 'Menunggu' | 'Diproses' | 'Selesai' | 'Gagal';

// AI Processing States for each analysis stage
type AnalysisStageStatus = 'queued' | 'processing' | 'done';

// Derive AI analysis stages from duplicate status and scores
const getAnalysisStages = (report: HazardReport): {
  geo: AnalysisStageStatus;
  lexical: AnalysisStageStatus;
  semantic: AnalysisStageStatus;
  statusLabel: StatusLabel;
  globalState: 'queued' | 'processing' | 'aggregating' | 'completed' | 'failed';
} => {
  const status = report.duplicateStatus;
  const scores = report.duplicateScores;
  
  // Failed state
  if (report.id.endsWith('-FAIL')) {
    return {
      geo: 'done',
      lexical: 'queued',
      semantic: 'queued',
      statusLabel: 'Gagal',
      globalState: 'failed'
    };
  }
  
  // Completed
  if (status === "DUPLICATE_SELESAI" && scores) {
    return {
      geo: 'done',
      lexical: 'done',
      semantic: 'done',
      statusLabel: 'Selesai',
      globalState: 'completed'
    };
  }
  
  // Processing
  if (status === "SEDANG_ANALISIS_DUPLICATE") {
    if (scores?.semantic !== undefined && scores?.lexical !== undefined && scores?.geo !== undefined && scores.semantic > 0 && scores.lexical > 0) {
      return {
        geo: 'done',
        lexical: 'done',
        semantic: 'done',
        statusLabel: 'Diproses',
        globalState: 'aggregating'
      };
    }
    if (scores?.semantic !== undefined && scores.semantic > 0) {
      return {
        geo: 'done',
        lexical: 'done',
        semantic: 'processing',
        statusLabel: 'Diproses',
        globalState: 'processing'
      };
    }
    if (scores?.lexical !== undefined && scores.lexical > 0) {
      return {
        geo: 'done',
        lexical: 'processing',
        semantic: 'queued',
        statusLabel: 'Diproses',
        globalState: 'processing'
      };
    }
    if (scores?.geo !== undefined && scores.geo > 0) {
      return {
        geo: 'processing',
        lexical: 'queued',
        semantic: 'queued',
        statusLabel: 'Diproses',
        globalState: 'processing'
      };
    }
    // Processing started but no scores yet
    return {
      geo: 'processing',
      lexical: 'queued',
      semantic: 'queued',
      statusLabel: 'Diproses',
      globalState: 'processing'
    };
  }
  
  // Queued
  return {
    geo: 'queued',
    lexical: 'queued',
    semantic: 'queued',
    statusLabel: 'Menunggu',
    globalState: 'queued'
  };
};

// Icon-only status indicator for Geo, Lexical, Semantic
const StageIcon = ({ status, label }: { status: AnalysisStageStatus; label: string }) => {
  const getIconAndStyle = () => {
    switch (status) {
      case 'done':
        return { 
          icon: <Check className="w-3.5 h-3.5" />, 
          className: "text-success bg-success/10" 
        };
      case 'processing':
        return { 
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, 
          className: "text-info bg-info/10" 
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
    done: `${label}: Done`,
    processing: `${label}: On Progress`,
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

// Unified Status Badge
const StatusBadge = ({ statusLabel }: { statusLabel: StatusLabel }) => {
  const getStyle = () => {
    switch (statusLabel) {
      case 'Selesai':
        return "bg-success/10 text-success border-success/30";
      case 'Gagal':
        return "bg-destructive/10 text-destructive border-destructive/30";
      case 'Diproses':
        return "bg-info/10 text-info border-info/30";
      case 'Menunggu':
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getIcon = () => {
    switch (statusLabel) {
      case 'Selesai':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'Gagal':
        return <AlertTriangle className="w-3 h-3" />;
      case 'Diproses':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'Menunggu':
      default:
        return <Hourglass className="w-3 h-3" />;
    }
  };

  return (
    <Badge variant="outline" className={`gap-1 text-[10px] whitespace-nowrap ${getStyle()}`}>
      {getIcon()}
      {statusLabel}
    </Badge>
  );
};

// Duplicate Score Display with better styling for processing state
const DuplicateScoreDisplay = ({ score, isCompleted }: { score?: number; isCompleted: boolean }) => {
  if (!isCompleted || score === undefined) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-muted-foreground/20 animate-pulse rounded-full" />
        </div>
        <span className="text-[10px] text-muted-foreground italic">Processing...</span>
      </div>
    );
  }

  const percentage = score * 100;
  
  const getScoreInfo = () => {
    if (percentage >= 85) {
      return { label: "Duplikat Kuat", color: "text-destructive", bgColor: "bg-destructive" };
    }
    if (percentage >= 75) {
      return { label: "Mirip", color: "text-warning", bgColor: "bg-warning" };
    }
    if (percentage >= 70) {
      return { label: "Low", color: "text-yellow-500", bgColor: "bg-yellow-500" };
    }
    return { label: "Unik", color: "text-success", bgColor: "bg-success" };
  };

  const { color, bgColor } = getScoreInfo();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help">
          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full ${bgColor}`} style={{ width: `${percentage}%` }} />
          </div>
          <span className={`text-xs font-semibold ${color}`}>{percentage.toFixed(0)}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px]">
        <p className="text-xs">Score ≥75% = berpotensi duplikat</p>
      </TooltipContent>
    </Tooltip>
  );
};

// Duplicate Status Badge
const DuplicateStatusBadge = ({ score, isCompleted }: { score?: number; isCompleted: boolean }) => {
  if (!isCompleted || score === undefined) {
    return <span className="text-[10px] text-muted-foreground">—</span>;
  }

  const percentage = score * 100;
  
  if (percentage >= 85) {
    return <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">Duplikat Kuat</Badge>;
  }
  if (percentage >= 75) {
    return <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">Perlu Review</Badge>;
  }
  if (percentage >= 70) {
    return <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Low Similarity</Badge>;
  }
  return <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">Tidak Duplikat</Badge>;
};

// Click-based Queue Actions Dropdown
const QueueActionsDropdown = ({ 
  globalState, 
  reportId,
  showViewCluster,
  onViewCluster
}: { 
  globalState: 'queued' | 'processing' | 'aggregating' | 'completed' | 'failed';
  reportId: string;
  showViewCluster?: boolean;
  onViewCluster?: () => void;
}) => {
  const handleAction = (action: string) => {
    const messages: Record<string, { title: string; desc: string }> = {
      start: { title: "Memulai proses", desc: `Laporan ${reportId}` },
      stop: { title: "Menghentikan proses", desc: `Laporan ${reportId}` },
      retry: { title: "Mengulangi analisis", desc: `Laporan ${reportId}` },
      prioritize: { title: "Diprioritaskan", desc: `Laporan ${reportId} ke antrian teratas` }
    };
    const msg = messages[action];
    if (msg) toast.success(msg.title, { description: msg.desc });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {globalState === 'queued' && (
          <>
            <DropdownMenuItem onClick={() => handleAction('start')}>
              <Play className="w-3.5 h-3.5 mr-2 text-success" />
              Start Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('prioritize')}>
              <ArrowUp className="w-3.5 h-3.5 mr-2" />
              Prioritize
            </DropdownMenuItem>
          </>
        )}
        {(globalState === 'processing' || globalState === 'aggregating') && (
          <DropdownMenuItem onClick={() => handleAction('stop')}>
            <Pause className="w-3.5 h-3.5 mr-2 text-warning" />
            Stop Processing
          </DropdownMenuItem>
        )}
        {(globalState === 'failed' || globalState === 'completed') && (
          <DropdownMenuItem onClick={() => handleAction('retry')}>
            <RefreshCw className="w-3.5 h-3.5 mr-2 text-info" />
            Retry Analysis
          </DropdownMenuItem>
        )}
        {showViewCluster && (
          <DropdownMenuItem onClick={onViewCluster}>
            <Eye className="w-3.5 h-3.5 mr-2 text-info" />
            Lihat Cluster
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Analytics Summary Card
const AnalyticsSummary = ({ 
  queued, 
  processing, 
  completed, 
  failed 
}: { 
  queued: number; 
  processing: number; 
  completed: number; 
  failed: number; 
}) => {
  const total = queued + processing + completed + failed;
  
  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      <div className="bg-muted/30 rounded-lg p-3 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <Hourglass className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Menunggu</span>
        </div>
        <p className="text-xl font-semibold text-foreground">{queued}</p>
        <p className="text-[10px] text-muted-foreground">{total > 0 ? ((queued/total)*100).toFixed(0) : 0}% dari total</p>
      </div>
      
      <div className="bg-info/5 rounded-lg p-3 border border-info/20">
        <div className="flex items-center gap-2 mb-1">
          <Loader2 className="w-4 h-4 text-info animate-spin" />
          <span className="text-xs text-info">Diproses</span>
        </div>
        <p className="text-xl font-semibold text-info">{processing}</p>
        <p className="text-[10px] text-muted-foreground">{total > 0 ? ((processing/total)*100).toFixed(0) : 0}% dari total</p>
      </div>
      
      <div className="bg-success/5 rounded-lg p-3 border border-success/20">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-xs text-success">Selesai</span>
        </div>
        <p className="text-xl font-semibold text-success">{completed}</p>
        <p className="text-[10px] text-muted-foreground">{total > 0 ? ((completed/total)*100).toFixed(0) : 0}% dari total</p>
      </div>
      
      <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/20">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-xs text-destructive">Gagal</span>
        </div>
        <p className="text-xl font-semibold text-destructive">{failed}</p>
        <p className="text-[10px] text-muted-foreground">{total > 0 ? ((failed/total)*100).toFixed(0) : 0}% dari total</p>
      </div>
    </div>
  );
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
  const [aiStatusFilter, setAiStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"timestamp" | "priority">("timestamp");
  
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [lokasiAreaFilter, setLokasiAreaFilter] = useState<string>("all");

  const availableLokasiOptions = useMemo(() => {
    if (siteFilter === "all") {
      return [...new Set(Object.values(lokasiOptions).flat())];
    }
    return lokasiOptions[siteFilter] || [];
  }, [siteFilter]);

  const handleSiteChange = (value: string) => {
    setSiteFilter(value);
    setLokasiAreaFilter("all");
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setAiStatusFilter("all");
    setSiteFilter("all");
    setLokasiAreaFilter("all");
    setSortOrder("timestamp");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || aiStatusFilter !== "all" || siteFilter !== "all" || lokasiAreaFilter !== "all";

  const filteredAndSortedReports = useMemo(() => {
    const filtered = reports.filter(report => {
      const matchesSearch = searchTerm === "" || 
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.pelapor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSite = siteFilter === "all" || report.site === siteFilter;
      const matchesLokasiArea = lokasiAreaFilter === "all" || report.lokasiArea === lokasiAreaFilter;
      
      const stages = getAnalysisStages(report);
      const matchesAiStatus = aiStatusFilter === "all" || 
        (aiStatusFilter === "Menunggu" && stages.globalState === "queued") ||
        (aiStatusFilter === "Diproses" && (stages.globalState === "processing" || stages.globalState === "aggregating")) ||
        (aiStatusFilter === "Selesai" && stages.globalState === "completed") ||
        (aiStatusFilter === "Gagal" && stages.globalState === "failed");
      
      return matchesSearch && matchesSite && matchesLokasiArea && matchesAiStatus;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === "priority") {
        const stateOrder = { processing: 0, aggregating: 0, queued: 1, completed: 2, failed: 3 };
        const stateA = getAnalysisStages(a).globalState;
        const stateB = getAnalysisStages(b).globalState;
        const orderDiff = stateOrder[stateA] - stateOrder[stateB];
        if (orderDiff !== 0) return orderDiff;
      }
      
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [reports, searchTerm, aiStatusFilter, siteFilter, lokasiAreaFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredAndSortedReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Stats
  const queuedCount = reports.filter(r => getAnalysisStages(r).globalState === "queued").length;
  const processingCount = reports.filter(r => ["processing", "aggregating"].includes(getAnalysisStages(r).globalState)).length;
  const completedCount = reports.filter(r => getAnalysisStages(r).globalState === "completed").length;
  const failedCount = reports.filter(r => getAnalysisStages(r).globalState === "failed").length;

  return (
    <div className="bg-card rounded-lg card-shadow animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-info/10">
            <Layers className="w-5 h-5 text-info" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Antrian AI Duplicate Detection</h2>
            <p className="text-sm text-muted-foreground">
              {queuedCount} menunggu · {processingCount} diproses · {completedCount} selesai
              {failedCount > 0 && <span className="text-destructive"> · {failedCount} gagal</span>}
            </p>
          </div>
        </div>

        {/* Analytics Summary */}
        <AnalyticsSummary 
          queued={queuedCount} 
          processing={processingCount} 
          completed={completedCount} 
          failed={failedCount} 
        />
        
        {/* Info Banner */}
        <div className="p-2.5 rounded-md bg-info/10 border border-info/20 flex items-start gap-2">
          <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
          <p className="text-xs text-info">
            AI menganalisis kemiripan menggunakan <strong>Geo</strong> (lokasi), <strong>Lexical</strong> (kata), <strong>Semantic</strong> (makna). Duplicate Score ditampilkan setelah proses selesai.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-shrink-0 w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari ID / Pelapor..." 
              className="pl-9 bg-background h-8 text-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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

          <Select value={lokasiAreaFilter} onValueChange={(v) => { setLokasiAreaFilter(v); setCurrentPage(1); }}>
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
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Menunggu">Menunggu</SelectItem>
              <SelectItem value="Diproses">Diproses</SelectItem>
              <SelectItem value="Selesai">Selesai</SelectItem>
              <SelectItem value="Gagal">Gagal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(v: "timestamp" | "priority") => { setSortOrder(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <ArrowUpDown className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp">Terbaru</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
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
              <th className="text-center text-xs font-medium text-muted-foreground px-2 py-2.5 w-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center cursor-help"><MapPin className="w-3.5 h-3.5" /></div>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Geo: Kedekatan lokasi</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground px-2 py-2.5 w-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center cursor-help"><Type className="w-3.5 h-3.5" /></div>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Lexical: Kesamaan kata</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground px-2 py-2.5 w-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center cursor-help"><Brain className="w-3.5 h-3.5" /></div>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Semantic: Kesamaan makna</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Duplicate Score</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Duplicate Status</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap w-12">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 py-8 text-center text-muted-foreground">
                  Tidak ada laporan ditemukan
                </td>
              </tr>
            ) : (
              paginatedReports.map((report) => {
                const stages = getAnalysisStages(report);
                const isCompleted = stages.globalState === "completed";
                const showViewCluster = isCompleted && (report.duplicateScores?.overall ?? 0) >= 0.75;

                return (
                  <tr 
                    key={report.id} 
                    className={`border-b border-border hover:bg-muted/10 transition-colors ${
                      stages.globalState === 'failed' ? 'bg-destructive/5' : ''
                    }`}
                  >
                    <td className="px-3 py-2.5 font-medium text-foreground text-xs whitespace-nowrap">{report.id}</td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs whitespace-nowrap">{formatTimestamp(report.timestamp)}</td>
                    <td className="px-3 py-2.5 text-foreground text-xs whitespace-nowrap">{report.pelapor}</td>
                    <td className="px-3 py-2.5 text-foreground text-xs whitespace-nowrap">{report.site}</td>
                    <td className="px-3 py-2.5 text-foreground text-xs whitespace-nowrap">{report.lokasiArea || "-"}</td>
                    
                    <td className="px-2 py-2.5">
                      <div className="flex justify-center"><StageIcon status={stages.geo} label="Geo" /></div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex justify-center"><StageIcon status={stages.lexical} label="Lexical" /></div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex justify-center"><StageIcon status={stages.semantic} label="Semantic" /></div>
                    </td>

                    <td className="px-3 py-2.5">
                      <StatusBadge statusLabel={stages.statusLabel} />
                    </td>

                    <td className="px-3 py-2.5">
                      <DuplicateScoreDisplay score={report.duplicateScores?.overall} isCompleted={isCompleted} />
                    </td>

                    <td className="px-3 py-2.5">
                      <DuplicateStatusBadge score={report.duplicateScores?.overall} isCompleted={isCompleted} />
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="flex justify-center">
                        <QueueActionsDropdown 
                          globalState={stages.globalState}
                          reportId={report.id}
                          showViewCluster={showViewCluster}
                          onViewCluster={() => onViewCluster?.(report)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
          <span className="text-xs text-muted-foreground px-2">{currentPage} / {totalPages || 1}</span>
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
