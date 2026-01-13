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

      // AI Cluster filters based on selected options
      // Geo cluster filter
      if (filterState.cluster.geo.enabled && filterState.cluster.geo.modes.length > 0) {
        const avgGeoScore = clusterReports.reduce((sum, r) => 
          sum + (r.duplicateScores?.geo || 0), 0) / clusterReports.length;
        
        const matchesGeo = filterState.cluster.geo.modes.some(mode => {
          if (mode === "Same Area (±50m)") return avgGeoScore >= 0.9;
          if (mode === "Nearby Area (50–200m)") return avgGeoScore >= 0.7 && avgGeoScore < 0.9;
          return false;
        });
        if (!matchesGeo) return false;
      }

      // Lexical cluster filter
      if (filterState.cluster.lexical.enabled && filterState.cluster.lexical.thresholds.length > 0) {
        const avgLexicalScore = clusterReports.reduce((sum, r) => 
          sum + (r.duplicateScores?.lexical || 0), 0) / clusterReports.length;
        
        const matchesLexical = filterState.cluster.lexical.thresholds.some(threshold => {
          if (threshold === "Medium Similarity (≥0.7)") return avgLexicalScore >= 0.7;
          if (threshold === "High Similarity (≥0.85)") return avgLexicalScore >= 0.85;
          return false;
        });
        if (!matchesLexical) return false;
      }

      // Semantic cluster filter
      if (filterState.cluster.semantic.enabled && filterState.cluster.semantic.thresholds.length > 0) {
        const avgSemanticScore = clusterReports.reduce((sum, r) => 
          sum + (r.duplicateScores?.semantic || 0), 0) / clusterReports.length;
        
        const matchesSemantic = filterState.cluster.semantic.thresholds.some(threshold => {
          if (threshold === "Semantic Match (≥0.8)") return avgSemanticScore >= 0.8;
          if (threshold === "High Confidence (≥0.9)") return avgSemanticScore >= 0.9;
          return false;
        });
        if (!matchesSemantic) return false;
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
      {/* Hierarchical Filter System with Cards Grid inside */}
      <HierarchicalFilterSystem
        filterState={filterState}
        onFilterChange={setFilterState}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Menampilkan {filteredClusters.length} dari {clusters.length} cluster
        </div>

        {/* Cluster Grid - beside physical context filter */}
        {filteredClusters.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
      </HierarchicalFilterSystem>

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
