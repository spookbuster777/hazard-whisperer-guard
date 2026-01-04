import { Layers, MapPin, FileText, Navigation, AlertTriangle, Zap, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClusterInfo, hazardReports } from "@/data/hazardReports";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // Mock lat/long based on cluster (in real app, this would come from report data)
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

  // Generate cluster origin IDs
  const geoClusterId = `GCL-${cluster.id.replace('C-', '')}`;
  const lexClusterId = `LCL-${cluster.id.replace('C-', '')}`;
  const semClusterId = `SCL-${cluster.id.replace('C-', '')}`;

  return (
    <div 
      className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group"
      onClick={() => onViewDetail(cluster)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{cluster.id}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="text-destructive font-medium">{cluster.reportCount} laporan</span>
              </div>
            </div>
          </div>
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

        {/* Representative Image */}
        <div className="mb-3">
          <div className="w-full h-28 rounded-lg bg-muted flex items-center justify-center border border-border overflow-hidden">
            <div className="flex flex-col items-center text-muted-foreground/50">
              <Layers className="w-8 h-8 mb-1" />
              <span className="text-[10px]">Gambar Representatif</span>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="mb-3 space-y-1.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-medium text-foreground">{site}</span>
              <span className="text-muted-foreground"> • {lokasi}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 pl-5">
            <p className="text-xs text-muted-foreground line-clamp-1">{detailLokasi}</p>
          </div>
          <div className="flex items-center gap-2 pl-5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                    <Navigation className="w-2.5 h-2.5" />
                    <span>{coords.lat}, {coords.long}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Latitude: {coords.lat}, Longitude: {coords.long}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Ketidaksesuaian Info */}
        <div className="mb-3 space-y-1.5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
            <div className="text-xs flex-1">
              <p className="font-medium text-foreground line-clamp-1">{ketidaksesuaian}</p>
              <p className="text-muted-foreground line-clamp-1 mt-0.5">{subKetidaksesuaian}</p>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-success shrink-0" />
            <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px]">
              {quickAction}
            </Badge>
          </div>
        </div>

        {/* Representative Description */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {representativeDesc}
          </p>
        </div>

        {/* Origin Cluster Badges */}
        <div className="mb-3">
          <span className="text-[10px] text-muted-foreground mb-1.5 block">Asal Cluster</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 text-[10px]">
              <MapPin className="w-2.5 h-2.5" />
              {geoClusterId}
            </Badge>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 gap-1 text-[10px]">
              <FileText className="w-2.5 h-2.5" />
              {lexClusterId}
            </Badge>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-1 text-[10px]">
              <Layers className="w-2.5 h-2.5" />
              {semClusterId}
            </Badge>
          </div>
        </div>

        {/* View Detail Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(cluster);
          }}
        >
          <Eye className="w-3.5 h-3.5" />
          Lihat Detail Cluster
        </Button>
      </div>
    </div>
  );
};

export default DuplicateClusterCard;
