import { useState, useMemo } from "react";
import DuplicateClusterCard from "./DuplicateClusterCard";
import DuplicateClusterDetailPanel from "./DuplicateClusterDetailPanel";
import { ClusterInfo, HazardReport, hazardReports } from "@/data/hazardReports";
import HierarchicalFilterSystem, { 
  HierarchicalFilterState, 
  initialFilterState 
} from "./HierarchicalFilterSystem";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DuplicateClusterGridProps {
  clusters: ClusterInfo[];
  onViewReport?: (report: HazardReport) => void;
}

const ITEMS_PER_PAGE = 9;

const DuplicateClusterGrid = ({ clusters, onViewReport }: DuplicateClusterGridProps) => {
  const [viewingCluster, setViewingCluster] = useState<ClusterInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<HierarchicalFilterState>(initialFilterState);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter clusters based on all filters
  const filteredClusters = useMemo(() => {
    return clusters.filter(cluster => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
        const matchesSearch = 
          cluster.id.toLowerCase().includes(searchLower) ||
          cluster.name.toLowerCase().includes(searchLower) ||
          clusterReports.some(r => 
            r.deskripsiTemuan?.toLowerCase().includes(searchLower) ||
            r.site?.toLowerCase().includes(searchLower) ||
            r.lokasiArea?.toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }

      // Physical context filters (check representative report)
      const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
      const representativeReport = clusterReports[0];

      // Site filter
      if (filterState.site.length > 0) {
        if (!representativeReport?.site || !filterState.site.includes(representativeReport.site)) return false;
      }

      // Location filter
      if (filterState.location.length > 0) {
        if (!representativeReport?.lokasiArea || !filterState.location.includes(representativeReport.lokasiArea)) return false;
      }

      // Detail location filter
      if (filterState.detailLocation.length > 0) {
        if (!representativeReport?.detailLokasi || !filterState.detailLocation.includes(representativeReport.detailLokasi)) return false;
      }

      // AI Cluster filters - now using cluster codes (GCL-xxx, LCL-xxx, SCL-xxx)
      // Geo cluster filter
      if (filterState.cluster.geo.enabled && filterState.cluster.geo.codes.length > 0) {
        const avgGeoScore = clusterReports.reduce((sum, r) => 
          sum + (r.duplicateScores?.geo || 0), 0) / clusterReports.length;
        if (avgGeoScore < 0.5) return false;
      }

      // Lexical cluster filter
      if (filterState.cluster.lexical.enabled && filterState.cluster.lexical.codes.length > 0) {
        const avgLexicalScore = clusterReports.reduce((sum, r) => 
          sum + (r.duplicateScores?.lexical || 0), 0) / clusterReports.length;
        if (avgLexicalScore < 0.5) return false;
      }

      // Semantic cluster filter
      if (filterState.cluster.semantic.enabled && filterState.cluster.semantic.codes.length > 0) {
        const avgSemanticScore = clusterReports.reduce((sum, r) => 
          sum + (r.duplicateScores?.semantic || 0), 0) / clusterReports.length;
        if (avgSemanticScore < 0.5) return false;
      }

      return true;
    });
  }, [clusters, searchTerm, filterState]);

  // Pagination
  const totalPages = Math.ceil(filteredClusters.length / ITEMS_PER_PAGE);
  const paginatedClusters = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClusters.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClusters, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterState]);

  const handleViewDetail = (cluster: ClusterInfo) => {
    setViewingCluster(cluster);
  };

  const handleClosePanel = () => {
    setViewingCluster(null);
  };

  const handleViewReport = (report: HazardReport) => {
    setViewingCluster(null);
    onViewReport?.(report);
  };

  const handleNavigateCluster = (cluster: ClusterInfo) => {
    setViewingCluster(cluster);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <>
      {/* Hierarchical Filter System with Cards Grid inside */}
      <HierarchicalFilterSystem
        filterState={filterState}
        onFilterChange={setFilterState}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Menampilkan {paginatedClusters.length} dari {filteredClusters.length} cluster
          {filteredClusters.length !== clusters.length && ` (total ${clusters.length})`}
        </div>

        {/* Cluster Grid */}
        {paginatedClusters.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedClusters.map(cluster => (
                <DuplicateClusterCard 
                  key={cluster.id} 
                  cluster={cluster} 
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map((page, idx) => (
                      <PaginationItem key={idx}>
                        {page === '...' ? (
                          <span className="px-3 py-2 text-muted-foreground">...</span>
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(page as number)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-2">
              Tidak ada cluster yang cocok dengan filter
            </div>
            <p className="text-sm text-muted-foreground/70">
              Coba ubah atau reset filter untuk melihat lebih banyak hasil
            </p>
          </div>
        )}
      </HierarchicalFilterSystem>

      {/* Detail Panel */}
      {viewingCluster && (
        <DuplicateClusterDetailPanel
          cluster={viewingCluster}
          allClusters={filteredClusters}
          onClose={handleClosePanel}
          onViewReport={handleViewReport}
          onNavigateCluster={handleNavigateCluster}
        />
      )}
    </>
  );
};

export default DuplicateClusterGrid;