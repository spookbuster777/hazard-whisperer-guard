import { useState, useMemo } from "react";
import DuplicateClusterCard from "./DuplicateClusterCard";
import DuplicateClusterDetailPanel from "./DuplicateClusterDetailPanel";
import { ClusterInfo, HazardReport, hazardReports } from "@/data/hazardReports";
import HierarchicalFilterSystem, { 
  HierarchicalFilterState, 
  initialFilterState 
} from "./HierarchicalFilterSystem";

interface DuplicateClusterGridProps {
  clusters: ClusterInfo[];
  onViewReport?: (report: HazardReport) => void;
}

const DuplicateClusterGrid = ({ clusters, onViewReport }: DuplicateClusterGridProps) => {
  const [viewingCluster, setViewingCluster] = useState<ClusterInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<HierarchicalFilterState>(initialFilterState);

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

      // AI Cluster filters (only apply if physical context is selected)
      const isClusterFiltersEnabled = filterState.site.length > 0 && 
        filterState.location.length > 0 && 
        filterState.detailLocation.length > 0;

      if (isClusterFiltersEnabled) {
        // Geo cluster filter - filter by geo similarity score
        if (filterState.cluster.geo.enabled) {
          const avgGeoScore = clusterReports.reduce((sum, r) => 
            sum + (r.duplicateScores?.geo || 0), 0) / clusterReports.length;
          
          if (filterState.cluster.geo.mode === "same_area") {
            // Same area requires high geo score (>= 0.9)
            if (avgGeoScore < 0.9) return false;
          } else {
            // Nearby area requires moderate geo score (>= 0.7)
            if (avgGeoScore < 0.7 || avgGeoScore >= 0.9) return false;
          }
        }

        // Lexical cluster filter - filter by lexical similarity score
        if (filterState.cluster.lexical.enabled) {
          const avgLexicalScore = clusterReports.reduce((sum, r) => 
            sum + (r.duplicateScores?.lexical || 0), 0) / clusterReports.length;
          
          if (avgLexicalScore < filterState.cluster.lexical.threshold) return false;
        }

        // Semantic cluster filter - filter by semantic similarity score
        if (filterState.cluster.semantic.enabled) {
          const avgSemanticScore = clusterReports.reduce((sum, r) => 
            sum + (r.duplicateScores?.semantic || 0), 0) / clusterReports.length;
          
          if (avgSemanticScore < filterState.cluster.semantic.threshold) return false;
        }
      }

      return true;
    });
  }, [clusters, searchTerm, filterState]);

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
        Menampilkan {filteredClusters.length} dari {clusters.length} cluster
      </div>

      {/* Cluster Grid */}
      {filteredClusters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClusters.map(cluster => (
            <DuplicateClusterCard 
              key={cluster.id} 
              cluster={cluster} 
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
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

      {/* Detail Panel */}
      {viewingCluster && (
        <DuplicateClusterDetailPanel
          cluster={viewingCluster}
          onClose={handleClosePanel}
          onViewReport={handleViewReport}
        />
      )}
    </>
  );
};

export default DuplicateClusterGrid;
