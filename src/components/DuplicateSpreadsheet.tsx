import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Search, ChevronDown, ArrowUp, ArrowDown, ArrowUpDown, Eye,
  LayoutGrid, Layers, RotateCcw, Globe, Type, Brain, MapPin,
  Navigation, SlidersHorizontal, RefreshCw, X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import {
  ClusterInfo, HazardReport, hazardReports, reportClusters,
  siteOptions, lokasiOptions, detailLokasiOptions
} from "@/data/hazardReports";
import DuplicateClusterDetailPanel from "./DuplicateClusterDetailPanel";
import HazardDuplicateFloatingPanel from "./HazardDuplicateFloatingPanel";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
type SubTab = "cluster" | "hazard";
type SortDir = "asc" | "desc" | null;
type DuplicateStatus = "all" | "potential_duplicate" | "duplicate" | "duplicate_by_system";

interface SortState {
  column: string;
  direction: SortDir;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const getDuplicateStatus = (report: HazardReport): DuplicateStatus => {
  const score = report.duplicateScores?.overall || 0;
  if (score >= 0.95 && Math.random() > 0.7) return "duplicate_by_system";
  if (score >= 0.85) return "duplicate";
  return "potential_duplicate";
};

const statusLabel: Record<string, { text: string; cls: string }> = {
  duplicate: { text: "Duplicate", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  potential_duplicate: { text: "Potential", cls: "bg-warning/10 text-warning border-warning/30" },
  duplicate_by_system: { text: "By System", cls: "bg-info/10 text-info border-info/30" },
};

const clusterStatusLabel: Record<string, { text: string; cls: string }> = {
  "Duplikat Kuat": { text: "Duplikat Kuat", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  "Duplikat Mungkin": { text: "Duplikat Mungkin", cls: "bg-warning/10 text-warning border-warning/30" },
  "Bukan Duplikat": { text: "Bukan Duplikat", cls: "bg-success/10 text-success border-success/30" },
};

const duplicateReports = hazardReports.filter(r => r.cluster);

// Geo/Lex/Sem cluster options
const geoClusterOptions = ["GCL-001", "GCL-002", "GCL-003", "GCL-004", "GCL-005", "GCL-006"];
const lexicalClustersByGeo: Record<string, string[]> = {
  "GCL-001": ["LCL-001", "LCL-002", "LCL-003"],
  "GCL-002": ["LCL-004", "LCL-005"],
  "GCL-003": ["LCL-006", "LCL-007", "LCL-008"],
  "GCL-004": ["LCL-009", "LCL-010"],
  "GCL-005": ["LCL-011", "LCL-012", "LCL-013"],
  "GCL-006": ["LCL-014", "LCL-015"],
};
const semanticClustersByLexical: Record<string, string[]> = {
  "LCL-001": ["SCL-001", "SCL-002"], "LCL-002": ["SCL-003"], "LCL-003": ["SCL-004", "SCL-005"],
  "LCL-004": ["SCL-006", "SCL-007"], "LCL-005": ["SCL-008"], "LCL-006": ["SCL-009", "SCL-010"],
  "LCL-007": ["SCL-011"], "LCL-008": ["SCL-012", "SCL-013"], "LCL-009": ["SCL-014"],
  "LCL-010": ["SCL-015", "SCL-016"], "LCL-011": ["SCL-017"], "LCL-012": ["SCL-018", "SCL-019"],
  "LCL-013": ["SCL-020"], "LCL-014": ["SCL-021", "SCL-022"], "LCL-015": ["SCL-023"],
};

// ── Filter Dropdown ────────────────────────────────────────────────────────────
const FilterDropdown = ({
  label, icon: Icon, options, selected, onChange, disabled = false, disabledMsg = ""
}: {
  label: string; icon: React.ElementType; options: string[]; selected: string[];
  onChange: (v: string[]) => void; disabled?: boolean; disabledMsg?: string;
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const toggle = (item: string) => {
    onChange(selected.includes(item) ? selected.filter(s => s !== item) : [...selected, item]);
  };
  const active = selected.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline" size="sm" disabled={disabled}
          className={cn(
            "h-7 px-2 text-[11px] gap-1 font-medium border-border",
            active && "border-primary/40 bg-primary/5 text-primary",
            disabled && "opacity-50"
          )}
        >
          <Icon className="w-3 h-3" />
          {label}
          {active && <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">{selected.length}</Badge>}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-56 p-0" align="start" sideOffset={4}>
          <div className="p-1.5 border-b">
            <Input placeholder={`Search ${label.toLowerCase()}…`} value={search} onChange={e => setSearch(e.target.value)} className="h-7 text-xs" />
          </div>
          <div className="px-1 py-0.5 border-b flex justify-between">
            <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => onChange(filtered)}>All</Button>
            <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5 text-muted-foreground" onClick={() => onChange([])}>Clear</Button>
          </div>
          <ScrollArea className="max-h-40">
            <div className="p-1">
              {filtered.map(o => (
                <button key={o} onClick={() => toggle(o)}
                  className={cn("w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs hover:bg-muted/50", selected.includes(o) && "bg-primary/5")}
                >
                  <Checkbox checked={selected.includes(o)} className="h-3.5 w-3.5" />
                  <span className="truncate">{o}</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="text-center text-xs text-muted-foreground py-3">No results</p>}
            </div>
          </ScrollArea>
        </PopoverContent>
      )}
    </Popover>
  );
};

// ── Resizable Column Header ────────────────────────────────────────────────────
const ResizableHeader = ({
  label, width, onResize, sortDir, onSort, sticky = false, left = 0
}: {
  label: string; width: number; onResize: (w: number) => void;
  sortDir: SortDir; onSort: () => void; sticky?: boolean; left?: number;
}) => {
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startX.current = e.clientX;
    startW.current = width;
    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX.current;
      onResize(Math.max(60, startW.current + delta));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <th
      className={cn(
        "relative h-8 px-2 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none border-b border-r border-border bg-muted/40 whitespace-nowrap",
        sticky && "sticky z-20 bg-muted/80 backdrop-blur-sm"
      )}
      style={{ width, minWidth: width, maxWidth: width, ...(sticky ? { left } : {}) }}
    >
      <button onClick={onSort} className="flex items-center gap-1 w-full hover:text-foreground transition-colors">
        <span className="truncate">{label}</span>
        {sortDir === "asc" && <ArrowUp className="w-3 h-3 text-primary flex-shrink-0" />}
        {sortDir === "desc" && <ArrowDown className="w-3 h-3 text-primary flex-shrink-0" />}
        {!sortDir && <ArrowUpDown className="w-2.5 h-2.5 opacity-30 flex-shrink-0" />}
      </button>
      <div
        onMouseDown={onMouseDown}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/40 transition-colors"
      />
    </th>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
interface DuplicateSpreadsheetProps {
  onViewReport?: (report: HazardReport) => void;
}

const DuplicateSpreadsheet = ({ onViewReport }: DuplicateSpreadsheetProps) => {
  const [subTab, setSubTab] = useState<SubTab>("cluster");
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<SortState>({ column: "", direction: null });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [focusedRow, setFocusedRow] = useState<number>(-1);
  const [statusFilter, setStatusFilter] = useState<DuplicateStatus>("all");
  const [viewingCluster, setViewingCluster] = useState<ClusterInfo | null>(null);
  const [viewingReport, setViewingReport] = useState<HazardReport | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [siteFilter, setSiteFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [detailLocationFilter, setDetailLocationFilter] = useState<string[]>([]);
  const [geoFilter, setGeoFilter] = useState<string[]>([]);
  const [lexicalFilter, setLexicalFilter] = useState<string[]>([]);
  const [semanticFilter, setSemanticFilter] = useState<string[]>([]);
  const [similarityRange, setSimilarityRange] = useState<[number, number]>([0, 100]);

  // Column widths
  const defaultClusterWidths = { id: 90, name: 220, reportCount: 80, similarity: 100, status: 130, site: 100, location: 130, description: 250, action: 60 };
  const defaultHazardWidths = { id: 110, timestamp: 100, site: 90, location: 120, description: 240, status: 130, cluster: 150, similarity: 90, action: 60 };
  const [clusterWidths, setClusterWidths] = useState(defaultClusterWidths);
  const [hazardWidths, setHazardWidths] = useState(defaultHazardWidths);

  // Available options
  const availableLocations = useMemo(() => {
    if (siteFilter.length === 0) return Object.values(lokasiOptions).flat();
    return siteFilter.flatMap(s => lokasiOptions[s] || []);
  }, [siteFilter]);

  const availableDetailLocations = useMemo(() => {
    if (locationFilter.length === 0) return Object.values(detailLokasiOptions).flat();
    return locationFilter.flatMap(l => detailLokasiOptions[l] || []);
  }, [locationFilter]);

  const availableLexical = useMemo(() => {
    if (geoFilter.length === 0) return [];
    return geoFilter.flatMap(g => lexicalClustersByGeo[g] || []);
  }, [geoFilter]);

  const availableSemantic = useMemo(() => {
    if (lexicalFilter.length === 0) return [];
    return lexicalFilter.flatMap(l => semanticClustersByLexical[l] || []);
  }, [lexicalFilter]);

  const hasActiveFilters = siteFilter.length > 0 || locationFilter.length > 0 || detailLocationFilter.length > 0 ||
    geoFilter.length > 0 || lexicalFilter.length > 0 || semanticFilter.length > 0 ||
    similarityRange[0] > 0 || similarityRange[1] < 100 || statusFilter !== "all";

  const resetAll = () => {
    setSiteFilter([]); setLocationFilter([]); setDetailLocationFilter([]);
    setGeoFilter([]); setLexicalFilter([]); setSemanticFilter([]);
    setSimilarityRange([0, 100]); setStatusFilter("all"); setSearchTerm("");
  };

  // ── Sorting ────────────────────────────────────────────────────────────────
  const toggleSort = (col: string) => {
    setSort(prev => {
      if (prev.column !== col) return { column: col, direction: "asc" };
      if (prev.direction === "asc") return { column: col, direction: "desc" };
      return { column: "", direction: null };
    });
  };

  const getSortDir = (col: string): SortDir => sort.column === col ? sort.direction : null;

  // ── Row Selection ──────────────────────────────────────────────────────────
  const handleRowClick = useCallback((id: string, idx: number, e: React.MouseEvent) => {
    if (e.shiftKey && focusedRow >= 0) {
      const ids = subTab === "cluster"
        ? filteredClusters.map(c => c.id)
        : filteredHazards.map(r => r.id);
      const start = Math.min(focusedRow, idx);
      const end = Math.max(focusedRow, idx);
      const newSet = new Set(selectedRows);
      for (let i = start; i <= end; i++) newSet.add(ids[i]);
      setSelectedRows(newSet);
    } else {
      setSelectedRows(prev => {
        const n = new Set(prev);
        if (n.has(id)) n.delete(id); else n.add(id);
        return n;
      });
    }
    setFocusedRow(idx);
  }, [focusedRow, selectedRows, subTab]);

  // Arrow key navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!tableRef.current?.contains(document.activeElement) && document.activeElement !== tableRef.current) return;
      const total = subTab === "cluster" ? filteredClusters.length : filteredHazards.length;
      if (e.key === "ArrowDown") { e.preventDefault(); setFocusedRow(prev => Math.min(prev + 1, total - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setFocusedRow(prev => Math.max(prev - 1, 0)); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [subTab]);

  // ── Filter Data ────────────────────────────────────────────────────────────
  const filteredClusters = useMemo(() => {
    let data = [...reportClusters];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      data = data.filter(c => c.id.toLowerCase().includes(s) || c.name.toLowerCase().includes(s));
    }
    if (siteFilter.length > 0) {
      data = data.filter(c => {
        const rep = hazardReports.find(r => r.cluster === c.id);
        return rep?.site && siteFilter.includes(rep.site);
      });
    }
    // Sort
    if (sort.column && sort.direction) {
      const dir = sort.direction === "asc" ? 1 : -1;
      data.sort((a, b) => {
        switch (sort.column) {
          case "id": return a.id.localeCompare(b.id) * dir;
          case "name": return a.name.localeCompare(b.name) * dir;
          case "reportCount": return (a.reportCount - b.reportCount) * dir;
          case "similarity": return (a.similarityScore - b.similarityScore) * dir;
          case "status": return a.status.localeCompare(b.status) * dir;
          default: return 0;
        }
      });
    }
    return data;
  }, [searchTerm, siteFilter, sort]);

  const filteredHazards = useMemo(() => {
    let data = [...duplicateReports];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      data = data.filter(r =>
        r.id.toLowerCase().includes(s) || r.deskripsiTemuan?.toLowerCase().includes(s) ||
        r.site?.toLowerCase().includes(s) || r.lokasiArea?.toLowerCase().includes(s)
      );
    }
    if (statusFilter !== "all") data = data.filter(r => getDuplicateStatus(r) === statusFilter);
    if (siteFilter.length > 0) data = data.filter(r => r.site && siteFilter.includes(r.site));
    if (locationFilter.length > 0) data = data.filter(r => r.lokasiArea && locationFilter.includes(r.lokasiArea));
    if (detailLocationFilter.length > 0) data = data.filter(r => r.detailLokasi && detailLocationFilter.includes(r.detailLokasi));

    // Similarity filter
    data = data.filter(r => {
      const g = r.duplicateScores?.geo || 0;
      const l = r.duplicateScores?.lexical || 0;
      const s = r.duplicateScores?.semantic || 0;
      const avg = Math.round(((g + l + s) / 3) * 100);
      return avg >= similarityRange[0] && avg <= similarityRange[1];
    });

    // Sort
    if (sort.column && sort.direction) {
      const dir = sort.direction === "asc" ? 1 : -1;
      data.sort((a, b) => {
        switch (sort.column) {
          case "id": return a.id.localeCompare(b.id) * dir;
          case "timestamp": return (a.timestamp || "").localeCompare(b.timestamp || "") * dir;
          case "site": return (a.site || "").localeCompare(b.site || "") * dir;
          case "location": return (a.lokasiArea || "").localeCompare(b.lokasiArea || "") * dir;
          case "description": return (a.deskripsiTemuan || "").localeCompare(b.deskripsiTemuan || "") * dir;
          case "similarity": {
            const sa = ((a.duplicateScores?.geo || 0) + (a.duplicateScores?.lexical || 0) + (a.duplicateScores?.semantic || 0)) / 3;
            const sb = ((b.duplicateScores?.geo || 0) + (b.duplicateScores?.lexical || 0) + (b.duplicateScores?.semantic || 0)) / 3;
            return (sa - sb) * dir;
          }
          default: return 0;
        }
      });
    }
    return data;
  }, [searchTerm, statusFilter, siteFilter, locationFilter, detailLocationFilter, similarityRange, sort]);

  const totalRows = subTab === "cluster" ? filteredClusters.length : filteredHazards.length;

  // Sticky column cumulative widths
  const stickyCluster = [
    { col: "id", left: 0, w: clusterWidths.id },
    { col: "name", left: clusterWidths.id, w: clusterWidths.name },
  ];
  const stickyHazard = [
    { col: "id", left: 0, w: hazardWidths.id },
    { col: "timestamp", left: hazardWidths.id, w: hazardWidths.timestamp },
    { col: "site", left: hazardWidths.id + hazardWidths.timestamp, w: hazardWidths.site },
    { col: "location", left: hazardWidths.id + hazardWidths.timestamp + hazardWidths.site, w: hazardWidths.location },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* ── Toolbar Row 1: Mode Tabs ──────────────────────────────────────── */}
        <div className="border-b border-border px-3 pt-2 flex items-center gap-1">
          <button
            onClick={() => { setSubTab("cluster"); setSelectedRows(new Set()); setSort({ column: "", direction: null }); }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors",
              subTab === "cluster"
                ? "bg-card text-primary border-border -mb-px"
                : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
            Duplicate Cluster
            <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">{reportClusters.length}</Badge>
          </button>
          <button
            onClick={() => { setSubTab("hazard"); setSelectedRows(new Set()); setSort({ column: "", direction: null }); }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors",
              subTab === "hazard"
                ? "bg-card text-primary border-border -mb-px"
                : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
            Hazard Duplicate
            <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">{duplicateReports.length}</Badge>
          </button>
        </div>

        {/* ── Toolbar Row 2: Search + Filters ──────────────────────────────── */}
        <div className="border-b border-border px-3 py-2 flex items-center gap-1.5 flex-wrap">
          {/* Search */}
          <div className="relative min-w-[220px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search clusters, descriptions, locations…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-7 pl-8 text-xs bg-background"
            />
          </div>

          <div className="h-5 w-px bg-border" />

          {/* Filters */}
          <FilterDropdown label="Site" icon={MapPin} options={siteOptions} selected={siteFilter} onChange={v => { setSiteFilter(v); setLocationFilter([]); setDetailLocationFilter([]); }} />
          <FilterDropdown label="Location" icon={MapPin} options={availableLocations} selected={locationFilter} onChange={v => { setLocationFilter(v); setDetailLocationFilter([]); }} disabled={siteFilter.length === 0} disabledMsg="Select Site first" />
          <FilterDropdown label="Detail Loc" icon={Navigation} options={availableDetailLocations} selected={detailLocationFilter} onChange={setDetailLocationFilter} disabled={locationFilter.length === 0} />

          <div className="h-5 w-px bg-border" />

          <FilterDropdown label="Geo" icon={Globe} options={geoClusterOptions} selected={geoFilter} onChange={v => { setGeoFilter(v); setLexicalFilter([]); setSemanticFilter([]); }} />
          <FilterDropdown label="Lexical" icon={Type} options={availableLexical} selected={lexicalFilter} onChange={v => { setLexicalFilter(v); setSemanticFilter([]); }} disabled={geoFilter.length === 0} />
          <FilterDropdown label="Semantic" icon={Brain} options={availableSemantic} selected={semanticFilter} onChange={setSemanticFilter} disabled={lexicalFilter.length === 0} />

          <div className="h-5 w-px bg-border" />

          {/* Similarity */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-7 px-2 text-[11px] gap-1",
                (similarityRange[0] > 0 || similarityRange[1] < 100) && "border-primary/40 bg-primary/5 text-primary"
              )}>
                <SlidersHorizontal className="w-3 h-3" />
                Similarity
                {(similarityRange[0] > 0 || similarityRange[1] < 100) && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">{similarityRange[0]}-{similarityRange[1]}%</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Range</span>
                  <span className="text-muted-foreground font-mono">{similarityRange[0]}% – {similarityRange[1]}%</span>
                </div>
                <Slider value={similarityRange} onValueChange={v => setSimilarityRange(v as [number, number])} min={0} max={100} step={5} />
              </div>
            </PopoverContent>
          </Popover>

          {/* Status */}
          <FilterDropdown
            label="Status"
            icon={Layers}
            options={["potential_duplicate", "duplicate", "duplicate_by_system"]}
            selected={statusFilter === "all" ? [] : [statusFilter]}
            onChange={v => setStatusFilter(v.length > 0 ? v[v.length - 1] as DuplicateStatus : "all")}
          />

          {/* Reset */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1" onClick={resetAll}>
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
          )}
        </div>

        {/* ── Spreadsheet Grid ─────────────────────────────────────────────── */}
        <div ref={tableRef} tabIndex={0} className="flex-1 overflow-auto outline-none focus:ring-0" style={{ maxHeight: "calc(100vh - 280px)" }}>
          <table className="w-max min-w-full border-collapse">
            {subTab === "cluster" ? (
              <>
                {/* Cluster Header */}
                <thead className="sticky top-0 z-10">
                  <tr>
                    <ResizableHeader label="Cluster ID" width={clusterWidths.id} onResize={w => setClusterWidths(p => ({ ...p, id: w }))} sortDir={getSortDir("id")} onSort={() => toggleSort("id")} sticky left={0} />
                    <ResizableHeader label="Nama Cluster" width={clusterWidths.name} onResize={w => setClusterWidths(p => ({ ...p, name: w }))} sortDir={getSortDir("name")} onSort={() => toggleSort("name")} sticky left={clusterWidths.id} />
                    <ResizableHeader label="Jumlah" width={clusterWidths.reportCount} onResize={w => setClusterWidths(p => ({ ...p, reportCount: w }))} sortDir={getSortDir("reportCount")} onSort={() => toggleSort("reportCount")} />
                    <ResizableHeader label="Similarity" width={clusterWidths.similarity} onResize={w => setClusterWidths(p => ({ ...p, similarity: w }))} sortDir={getSortDir("similarity")} onSort={() => toggleSort("similarity")} />
                    <ResizableHeader label="Status" width={clusterWidths.status} onResize={w => setClusterWidths(p => ({ ...p, status: w }))} sortDir={getSortDir("status")} onSort={() => toggleSort("status")} />
                    <ResizableHeader label="Site" width={clusterWidths.site} onResize={w => setClusterWidths(p => ({ ...p, site: w }))} sortDir={getSortDir("site")} onSort={() => toggleSort("site")} />
                    <ResizableHeader label="Lokasi" width={clusterWidths.location} onResize={w => setClusterWidths(p => ({ ...p, location: w }))} sortDir={getSortDir("location")} onSort={() => toggleSort("location")} />
                    <ResizableHeader label="Deskripsi" width={clusterWidths.description} onResize={w => setClusterWidths(p => ({ ...p, description: w }))} sortDir={getSortDir("description")} onSort={() => toggleSort("description")} />
                    <ResizableHeader label="Aksi" width={clusterWidths.action} onResize={w => setClusterWidths(p => ({ ...p, action: w }))} sortDir={null} onSort={() => {}} />
                  </tr>
                </thead>
                <tbody>
                  {filteredClusters.map((cluster, idx) => {
                    const rep = hazardReports.find(r => r.cluster === cluster.id);
                    const isSelected = selectedRows.has(cluster.id);
                    const isFocused = focusedRow === idx;
                    const score = Math.round(cluster.similarityScore * 100);
                    const st = clusterStatusLabel[cluster.status] || clusterStatusLabel["Bukan Duplikat"];

                    return (
                      <tr
                        key={cluster.id}
                        onClick={e => handleRowClick(cluster.id, idx, e)}
                        className={cn(
                          "border-b border-border transition-colors cursor-pointer",
                          isSelected && "bg-primary/5",
                          isFocused && !isSelected && "bg-muted/40",
                          !isSelected && !isFocused && "hover:bg-muted/30"
                        )}
                      >
                        <td className="sticky left-0 z-10 px-2 py-1.5 text-xs font-mono text-primary bg-inherit border-r border-border" style={{ width: clusterWidths.id, minWidth: clusterWidths.id }}>
                          {cluster.id}
                        </td>
                        <td className="sticky z-10 px-2 py-1.5 text-xs font-medium text-foreground bg-inherit border-r border-border truncate" style={{ left: clusterWidths.id, width: clusterWidths.name, minWidth: clusterWidths.name, maxWidth: clusterWidths.name }}>
                          {cluster.name}
                        </td>
                        <td className="px-2 py-1.5 text-xs text-center text-foreground border-r border-border" style={{ width: clusterWidths.reportCount }}>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{cluster.reportCount}</Badge>
                        </td>
                        <td className="px-2 py-1.5 border-r border-border" style={{ width: clusterWidths.similarity }}>
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className={cn("h-full rounded-full", score >= 80 ? "bg-destructive" : score >= 60 ? "bg-warning" : "bg-success")} style={{ width: `${score}%` }} />
                            </div>
                            <span className="text-[11px] font-semibold tabular-nums w-8 text-right">{score}%</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 border-r border-border" style={{ width: clusterWidths.status }}>
                          <Badge variant="outline" className={cn("text-[10px] py-0", st.cls)}>{st.text}</Badge>
                        </td>
                        <td className="px-2 py-1.5 text-xs text-foreground border-r border-border" style={{ width: clusterWidths.site }}>{rep?.site || "—"}</td>
                        <td className="px-2 py-1.5 text-xs text-foreground border-r border-border truncate" style={{ width: clusterWidths.location, maxWidth: clusterWidths.location }}>{rep?.lokasiArea || "—"}</td>
                        <td className="px-2 py-1.5 text-xs text-muted-foreground border-r border-border truncate" style={{ width: clusterWidths.description, maxWidth: clusterWidths.description }}>{rep?.deskripsiTemuan || "—"}</td>
                        <td className="px-2 py-1.5 text-center border-r border-border" style={{ width: clusterWidths.action }}>
                          <button
                            onClick={e => { e.stopPropagation(); setViewingCluster(cluster); }}
                            className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            ) : (
              <>
                {/* Hazard Header */}
                <thead className="sticky top-0 z-10">
                  <tr>
                    <ResizableHeader label="ID" width={hazardWidths.id} onResize={w => setHazardWidths(p => ({ ...p, id: w }))} sortDir={getSortDir("id")} onSort={() => toggleSort("id")} sticky left={0} />
                    <ResizableHeader label="Timestamp" width={hazardWidths.timestamp} onResize={w => setHazardWidths(p => ({ ...p, timestamp: w }))} sortDir={getSortDir("timestamp")} onSort={() => toggleSort("timestamp")} sticky left={hazardWidths.id} />
                    <ResizableHeader label="Site" width={hazardWidths.site} onResize={w => setHazardWidths(p => ({ ...p, site: w }))} sortDir={getSortDir("site")} onSort={() => toggleSort("site")} sticky left={hazardWidths.id + hazardWidths.timestamp} />
                    <ResizableHeader label="Lokasi" width={hazardWidths.location} onResize={w => setHazardWidths(p => ({ ...p, location: w }))} sortDir={getSortDir("location")} onSort={() => toggleSort("location")} sticky left={hazardWidths.id + hazardWidths.timestamp + hazardWidths.site} />
                    <ResizableHeader label="Deskripsi" width={hazardWidths.description} onResize={w => setHazardWidths(p => ({ ...p, description: w }))} sortDir={getSortDir("description")} onSort={() => toggleSort("description")} />
                    <ResizableHeader label="Status" width={hazardWidths.status} onResize={w => setHazardWidths(p => ({ ...p, status: w }))} sortDir={getSortDir("status")} onSort={() => toggleSort("status")} />
                    <ResizableHeader label="Cluster" width={hazardWidths.cluster} onResize={w => setHazardWidths(p => ({ ...p, cluster: w }))} sortDir={getSortDir("cluster")} onSort={() => toggleSort("cluster")} />
                    <ResizableHeader label="Similarity" width={hazardWidths.similarity} onResize={w => setHazardWidths(p => ({ ...p, similarity: w }))} sortDir={getSortDir("similarity")} onSort={() => toggleSort("similarity")} />
                    <ResizableHeader label="Aksi" width={hazardWidths.action} onResize={w => setHazardWidths(p => ({ ...p, action: w }))} sortDir={null} onSort={() => {}} />
                  </tr>
                </thead>
                <tbody>
                  {filteredHazards.map((report, idx) => {
                    const isSelected = selectedRows.has(report.id);
                    const isFocused = focusedRow === idx;
                    const geoScore = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : 0;
                    const lexScore = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : 0;
                    const semScore = report.duplicateScores ? Math.round(report.duplicateScores.semantic * 100) : 0;
                    const avgScore = Math.round((geoScore + lexScore + semScore) / 3);
                    const status = getDuplicateStatus(report);
                    const sl = statusLabel[status] || statusLabel.potential_duplicate;
                    const clusterNum = report.cluster?.replace("C-", "") || "001";

                    const stickyBg = isSelected ? "bg-primary/5" : isFocused ? "bg-muted/40" : "bg-card";

                    return (
                      <tr
                        key={report.id}
                        onClick={e => handleRowClick(report.id, idx, e)}
                        className={cn(
                          "border-b border-border transition-colors cursor-pointer",
                          isSelected && "bg-primary/5",
                          isFocused && !isSelected && "bg-muted/40",
                          !isSelected && !isFocused && "hover:bg-muted/30"
                        )}
                      >
                        <td className={cn("sticky left-0 z-10 px-2 py-1.5 text-[11px] font-mono text-muted-foreground border-r border-border", stickyBg)} style={{ width: hazardWidths.id, minWidth: hazardWidths.id }}>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{report.id.slice(-8)}</span>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs font-mono">{report.id}</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className={cn("sticky z-10 px-2 py-1.5 text-[11px] text-muted-foreground border-r border-border", stickyBg)} style={{ left: hazardWidths.id, width: hazardWidths.timestamp, minWidth: hazardWidths.timestamp }}>
                          {report.tanggal}
                        </td>
                        <td className={cn("sticky z-10 px-2 py-1.5 text-[11px] text-foreground border-r border-border", stickyBg)} style={{ left: hazardWidths.id + hazardWidths.timestamp, width: hazardWidths.site, minWidth: hazardWidths.site }}>
                          {report.site}
                        </td>
                        <td className={cn("sticky z-10 px-2 py-1.5 text-[11px] text-foreground border-r border-border truncate", stickyBg)} style={{ left: hazardWidths.id + hazardWidths.timestamp + hazardWidths.site, width: hazardWidths.location, minWidth: hazardWidths.location, maxWidth: hazardWidths.location }}>
                          {report.lokasiArea || report.lokasi}
                        </td>
                        <td className="px-2 py-1.5 text-[11px] text-muted-foreground border-r border-border truncate" style={{ width: hazardWidths.description, maxWidth: hazardWidths.description }}>
                          {report.deskripsiTemuan}
                        </td>
                        <td className="px-2 py-1.5 border-r border-border" style={{ width: hazardWidths.status }}>
                          <Badge variant="outline" className={cn("text-[10px] py-0", sl.cls)}>
                            {status === "duplicate_by_system" && <RefreshCw className="w-2.5 h-2.5 mr-0.5" />}
                            {sl.text}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5 border-r border-border" style={{ width: hazardWidths.cluster }}>
                          <div className="flex gap-0.5 flex-wrap">
                            <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-600">GCL-{clusterNum}</span>
                            <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-orange-500/10 text-orange-600">LCL-{clusterNum}</span>
                            <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-purple-500/10 text-purple-600">SCL-{clusterNum}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 border-r border-border" style={{ width: hazardWidths.similarity }}>
                          <div className="flex items-center gap-1">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className={cn("h-full rounded-full", avgScore >= 80 ? "bg-destructive" : avgScore >= 60 ? "bg-warning" : "bg-success")} style={{ width: `${avgScore}%` }} />
                            </div>
                            <span className="text-[11px] font-semibold tabular-nums w-7 text-right">{avgScore}%</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-center border-r border-border" style={{ width: hazardWidths.action }}>
                          <button
                            onClick={e => { e.stopPropagation(); setViewingReport(report); }}
                            className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            )}
          </table>

          {totalRows === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Layers className="w-8 h-8 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada data yang cocok dengan filter</p>
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="border-t border-border px-3 py-1.5 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {hasActiveFilters && <RotateCcw className="w-3 h-3 text-primary cursor-pointer hover:text-primary/80" onClick={resetAll} />}
          </div>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            Showing <strong className="text-foreground">{totalRows}</strong> rows
            {hasActiveFilters && <> · Filtered: <strong className="text-foreground">{totalRows}</strong></>}
            {" "}· Selected: <strong className="text-foreground">{selectedRows.size}</strong>
          </span>
        </div>
      </div>

      {/* ── Detail Panels ──────────────────────────────────────────────────── */}
      {viewingCluster && (
        <DuplicateClusterDetailPanel
          cluster={viewingCluster}
          onClose={() => setViewingCluster(null)}
          onViewReport={onViewReport}
          allClusters={reportClusters}
          onNavigateCluster={c => setViewingCluster(c)}
        />
      )}
      {viewingReport && (
        <HazardDuplicateFloatingPanel
          report={viewingReport}
          onClose={() => setViewingReport(null)}
        />
      )}
    </>
  );
};

export default DuplicateSpreadsheet;
