import { Layers, MapPin, AlertTriangle, Zap, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClusterInfo, hazardReports } from "@/data/hazardReports";
import { Separator } from "@/components/ui/separator";

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
        {/* Header - SCL ID with report count and cluster badges + Similarity */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 group-hover:from-purple-500/30 group-hover:to-purple-500/10 transition-colors">
              <Layers className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{sclId}</h3>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground font-medium">{cluster.reportCount} laporan</span>
              </div>
              {/* Origin Cluster Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] px-1.5 py-0 font-mono">
                  {geoClusterId}
                </Badge>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 text-[10px] px-1.5 py-0 font-mono">
                  {lexClusterId}
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] px-1.5 py-0 font-mono">
                  {sclId}
                </Badge>
              </div>
            </div>
          </div>
          {/* Similarity Score */}
          <div className="text-right">
            <span className={`text-2xl font-bold ${
              similarityPercent >= 85 ? 'text-destructive' :
              similarityPercent >= 75 ? 'text-orange-500' :
              similarityPercent >= 70 ? 'text-yellow-500' : 'text-emerald-500'
            }`}>
              {similarityPercent}%
            </span>
            <p className="text-[10px] text-muted-foreground">Similarity</p>
          </div>
        </div>

        {/* Thin Separator */}
        <Separator className="my-3" />

        {/* Location Info */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-medium text-foreground">{site}</span>
                <span className="text-muted-foreground"> • {lokasi}</span>
                <span className="text-muted-foreground"> • {detailLokasi}</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
              {coords.lat}, {coords.long}
            </span>
          </div>
        </div>

        {/* Ketidaksesuaian Info with Image Placeholder */}
        <div className="flex gap-3 mb-3">
          {/* Image Placeholder */}
          <div className="w-14 h-14 rounded-lg bg-muted/50 border border-border flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
              <div className="text-xs flex-1">
                <p className="font-semibold text-foreground">{ketidaksesuaian}</p>
                <p className="text-muted-foreground">{subKetidaksesuaian}</p>
              </div>
            </div>
            {/* Quick Action Badge */}
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] mt-1">
              {quickAction}
            </Badge>
          </div>
        </div>

        {/* Representative Description - Boxed */}
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {representativeDesc}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DuplicateClusterCard;