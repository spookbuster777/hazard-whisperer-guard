import { useState, useMemo } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, RotateCcw, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HazardReport, siteOptions, lokasiOptions } from "@/data/hazardReports";
import DuplicateReviewPanel from "./DuplicateReviewPanel";

interface DuplicateHazardListProps {
  reports: HazardReport[];
}

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

const DuplicateHazardList = ({ reports }: DuplicateHazardListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  
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
    setSiteFilter("all");
    setLokasiAreaFilter("all");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    siteFilter !== "all" ||
    lokasiAreaFilter !== "all";

  const filteredAndSortedReports = useMemo(() => {
    const filtered = reports.filter(report => {
      const matchesSearch = searchTerm === "" || 
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSite = siteFilter === "all" || report.site === siteFilter;
      const matchesLokasiArea = lokasiAreaFilter === "all" || report.lokasiArea === lokasiAreaFilter;
      
      return matchesSearch && matchesSite && matchesLokasiArea;
    });

    return filtered.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  }, [reports, searchTerm, siteFilter, lokasiAreaFilter, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredAndSortedReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const handleRowClick = (report: HazardReport) => {
    setSelectedReport(report);
  };

  return (
    <>
      <div className="bg-card rounded-lg card-shadow animate-fade-in">
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
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Timestamp</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Pelapor</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Site</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Lokasi</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    Tidak ada laporan ditemukan
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => (
                  <tr 
                    key={report.id} 
                    className="border-b border-border hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(report)}
                  >
                    <td className="px-3 py-2 font-medium text-primary text-xs whitespace-nowrap">{report.id}</td>
                    <td className="px-3 py-2 text-muted-foreground text-xs whitespace-nowrap">{formatTimestamp(report.timestamp)}</td>
                    <td className="px-3 py-2 text-foreground text-xs whitespace-nowrap">{report.pelapor}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-xs font-medium">
                        {report.site}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-foreground text-xs whitespace-nowrap">{report.lokasiArea || "-"}</td>
                    <td className="px-3 py-2 text-muted-foreground text-xs max-w-[300px] truncate">
                      {report.deskripsiTemuan || "-"}
                    </td>
                  </tr>
                ))
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

      {/* Detail Panel */}
      {selectedReport && (
        <DuplicateReviewPanel 
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </>
  );
};

export default DuplicateHazardList;