import { useState } from "react";
import DuplicateClusterCard from "./DuplicateClusterCard";
import ClusterPanel from "./ClusterPanel";
import { ClusterInfo, HazardReport } from "@/data/hazardReports";

interface DuplicateClusterGridProps {
  clusters: ClusterInfo[];
}

const DuplicateClusterGrid = ({ clusters }: DuplicateClusterGridProps) => {
  const [viewingCluster, setViewingCluster] = useState<ClusterInfo | null>(null);

  const handleViewDetail = (cluster: ClusterInfo) => {
    setViewingCluster(cluster);
  };

  const handleClosePanel = () => {
    setViewingCluster(null);
  };

  const handleSelectReport = (reportId: string) => {
    // For now, just close the panel - could be extended to navigate to report detail
    setViewingCluster(null);
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
        <ClusterPanel
          cluster={viewingCluster}
          onClose={handleClosePanel}
          onSelectReport={handleSelectReport}
        />
      )}
    </>
  );
};

export default DuplicateClusterGrid;