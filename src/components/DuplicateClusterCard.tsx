import { Layers, Users, Image, MapPin, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClusterInfo, hazardReports } from "@/data/hazardReports";

interface DuplicateClusterCardProps {
  cluster: ClusterInfo;
  onViewDetail: (cluster: ClusterInfo) => void;
}

const DuplicateClusterCard = ({ cluster, onViewDetail }: DuplicateClusterCardProps) => {
  const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
  const imageCount = clusterReports.length;
  const similarityPercent = Math.round(cluster.similarityScore * 100);

  const representativeDesc = clusterReports[0]?.deskripsiTemuan || cluster.name;

  const geoClusterId = `GCL-${cluster.id.replace('CL-', '')}`;
  const lexClusterId = `LCL-${cluster.id.replace('CL-', '')}`;

  return (
    <div 
      className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group"
      onClick={() => onViewDetail(cluster)}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{cluster.id}</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-destructive font-medium">{cluster.reportCount} laporan</span>
                </span>
                <span className="flex items-center gap-1">
                  <Image className="w-3.5 h-3.5" />
                  {imageCount} gambar
                </span>
              </div>
            </div>
          </div>
          <span className={`text-2xl font-bold ${
            similarityPercent >= 75 ? 'text-destructive' :
            similarityPercent >= 50 ? 'text-warning' : 'text-success'
          }`}>
            {similarityPercent}%
          </span>
        </div>

        {/* Representative Description */}
        <div className="mb-4">
          <span className="text-xs font-medium text-primary">Deskripsi Representatif</span>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {representativeDesc}
          </p>
        </div>

        {/* Image Thumbnails Placeholder */}
        {imageCount > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border">
              <Image className="w-5 h-5 text-muted-foreground/50" />
            </div>
            {imageCount > 1 && (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground border border-border">
                +{imageCount - 1}
              </div>
            )}
          </div>
        )}

        {/* Origin Cluster Badges */}
        <div className="mb-2">
          <span className="text-xs text-muted-foreground">Asal Cluster</span>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1 text-xs">
              <MapPin className="w-3 h-3" />
              {geoClusterId}
            </Badge>
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1 text-xs">
              <FileText className="w-3 h-3" />
              {lexClusterId}
            </Badge>
          </div>
        </div>

        {/* Click hint */}
        <div className="text-xs text-muted-foreground text-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          Klik untuk lihat detail laporan
        </div>
      </div>
    </div>
  );
};

export default DuplicateClusterCard;