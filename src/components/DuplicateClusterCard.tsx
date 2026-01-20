import { Layers, MapPin, AlertTriangle, Zap, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClusterInfo, hazardReports } from "@/data/hazardReports";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
      className="bg-card rounded-2xl border border-border/70 shadow-md hover:shadow-xl transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 cursor-pointer group overflow-hidden"
      onClick={() => onViewDetail(cluster)}
    >
      {/* Top accent bar */}
      <div className={cn(
        "h-1 w-full",
        similarityPercent >= 85 ? 'bg-gradient-to-r from-destructive to-destructive/50' :
        similarityPercent >= 75 ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
        similarityPercent >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
      )} />
      
      <div className="p-4">
        {/* Header - SCL ID with report count and cluster badges + Similarity */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 group-hover:from-purple-500/30 group-hover:to-purple-500/10 transition-all duration-300 shadow-inner">
              <Layers className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{sclId}</h3>
                <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted/50 rounded-full">{cluster.reportCount} laporan</span>
              </div>
              {/* Origin Cluster Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] px-2 py-0.5 font-mono shadow-sm">
                  {geoClusterId}
                </Badge>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 text-[10px] px-2 py-0.5 font-mono shadow-sm">
                  {lexClusterId}
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] px-2 py-0.5 font-mono shadow-sm">
                  {sclId}
                </Badge>
              </div>
            </div>
          </div>
          {/* Similarity Score */}
          <div className="text-right bg-muted/30 rounded-xl px-3 py-2">
            <span className={cn(
              "text-2xl font-bold",
              similarityPercent >= 85 ? 'text-destructive' :
              similarityPercent >= 75 ? 'text-orange-500' :
              similarityPercent >= 70 ? 'text-yellow-600' : 'text-emerald-500'
            )}>
              {similarityPercent}%
            </span>
            <p className="text-[10px] text-muted-foreground font-medium">Similarity</p>
          </div>
        </div>

        {/* Thin Separator */}
        <Separator className="my-3 bg-border/50" />

        {/* Location Info */}
        <div className="mb-4 p-2.5 bg-muted/30 rounded-lg border border-border/30">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary/70 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-foreground">{site}</span>
                <span className="text-muted-foreground"> • {lokasi}</span>
                <span className="text-muted-foreground"> • {detailLokasi}</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono bg-background/50 px-1.5 py-0.5 rounded">
              {coords.lat}, {coords.long}
            </span>
          </div>
        </div>

        {/* Ketidaksesuaian Info with Image Placeholder */}
        <div className="flex gap-3 mb-4">
          {/* Image Placeholder */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 border border-border/50 flex items-center justify-center shrink-0 shadow-inner">
            <ImageIcon className="w-7 h-7 text-muted-foreground/40" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
              <div className="text-xs flex-1">
                <p className="font-semibold text-foreground leading-tight">{ketidaksesuaian}</p>
                <p className="text-muted-foreground mt-0.5">{subKetidaksesuaian}</p>
              </div>
            </div>
            {/* Quick Action Badge */}
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] shadow-sm">
              {quickAction}
            </Badge>
          </div>
        </div>

        {/* Representative Description - Boxed */}
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-muted/40 to-muted/20 px-3 py-2.5">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {representativeDesc}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DuplicateClusterCard;