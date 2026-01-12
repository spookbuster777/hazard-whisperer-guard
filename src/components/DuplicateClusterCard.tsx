import { Layers, MapPin, AlertTriangle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClusterInfo, hazardReports } from "@/data/hazardReports";

interface DuplicateClusterCardProps {
  cluster: ClusterInfo;
  onViewDetail: (cluster: ClusterInfo) => void;
}

const DuplicateClusterCard = ({ cluster, onViewDetail }: DuplicateClusterCardProps) => {
  const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
  const similarityPercent = Math.round(cluster.similarityScore * 100);

  // Get representative report (first one)
  const representativeReport = clusterReports[0];
  const representativeDesc = representativeReport?.deskripsiTemuan || cluster.name;

  // Extract location info from representative report
  const site = representativeReport?.site || "-";
  const lokasi = representativeReport?.lokasiArea || representativeReport?.lokasi || "-";
  const detailLokasi = representativeReport?.detailLokasi || "-";
  
  // Mock lat/long based on cluster
  const mockCoords: Record<string, { lat: string; long: string }> = {
    "C-001": { lat: "-3.7893", long: "114.7631" },
    "C-002": { lat: "-3.7912", long: "114.7645" },
    "C-003": { lat: "-3.7856", long: "114.7589" },
    "C-004": { lat: "-3.7934", long: "114.7678" },
    "C-005": { lat: "-3.7901", long: "114.7612" },
  };
  const coords = mockCoords[cluster.id] || { lat: "-3.7900", long: "114.7620" };

  // Extract ketidaksesuaian info
  const ketidaksesuaian = representativeReport?.ketidaksesuaian || "-";
  const subKetidaksesuaian = representativeReport?.subKetidaksesuaian || "-";
  const quickAction = representativeReport?.quickAction || "-";

  // Generate cluster origin IDs - SCL as main ID now
  const numId = cluster.id.replace('C-', '');
  const sclId = `SCL-${numId}`;
  const geoClusterId = `GCL-${numId}`;
  const lexClusterId = `LCL-${numId}`;

  return (
    <div 
      className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group"
      onClick={() => onViewDetail(cluster)}
    >
      <div className="p-4">
        {/* Header - SCL ID with report count and cluster badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 group-hover:from-purple-500/30 group-hover:to-purple-500/10 transition-colors">
              <Layers className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-500 transition-colors">{sclId}</h3>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-destructive font-medium">{cluster.reportCount} laporan</span>
              </div>
              {/* Origin Cluster Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] px-1.5 py-0">
                  {geoClusterId}
                </Badge>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 text-[10px] px-1.5 py-0">
                  {lexClusterId}
                </Badge>
              </div>
            </div>
          </div>
          {/* Similarity Score */}
          <div className="text-right">
            <span className={`text-2xl font-bold ${
              similarityPercent >= 85 ? 'text-destructive' :
              similarityPercent >= 75 ? 'text-warning' :
              similarityPercent >= 70 ? 'text-yellow-500' : 'text-success'
            }`}>
              {similarityPercent}%
            </span>
            <p className="text-[10px] text-muted-foreground">Similarity</p>
          </div>
        </div>

        {/* Location Info */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-medium text-foreground">{site}</span>
                <span className="text-muted-foreground"> • {lokasi}</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {coords.lat}, {coords.long}
            </span>
          </div>
          <p className="text-xs text-muted-foreground ml-5 mt-0.5">{detailLokasi}</p>
        </div>

        {/* Ketidaksesuaian Info */}
        <div className="mb-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
            <div className="text-xs flex-1">
              <p className="font-semibold text-foreground">{ketidaksesuaian}</p>
              <p className="text-muted-foreground mt-0.5">{subKetidaksesuaian}</p>
            </div>
          </div>
        </div>

        {/* Quick Action Badge */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
              {quickAction}
            </Badge>
          </div>
        </div>

        {/* Representative Description */}
        <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 line-clamp-2">
          {representativeDesc}
        </p>
      </div>
    </div>
  );
};

export default DuplicateClusterCard;
