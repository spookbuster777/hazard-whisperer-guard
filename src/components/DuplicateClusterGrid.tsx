import { useState } from "react";
import DuplicateClusterCard from "./DuplicateClusterCard";
import DuplicateClusterDetailPanel from "./DuplicateClusterDetailPanel";
import { ClusterInfo, HazardReport } from "@/data/hazardReports";

interface DuplicateClusterGridProps {
  clusters: ClusterInfo[];
  onViewReport?: (report: HazardReport) => void;
}

const DuplicateClusterGrid = ({ clusters, onViewReport }: DuplicateClusterGridProps) => {
  const [viewingCluster, setViewingCluster] = useState<ClusterInfo | null>(null);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clusters.map((cluster) => (
          <DuplicateClusterCard
            key={cluster.id}
            cluster={cluster}
            onViewDetail={handleViewDetail}
          />
        ))}
      </div>

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