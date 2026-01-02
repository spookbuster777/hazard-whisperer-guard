import { X, Users, Star, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClusterInfo, hazardReports, HazardReport } from "@/data/hazardReports";

interface DuplicateClusterDetailPanelProps {
  cluster: ClusterInfo;
  onClose: () => void;
  onViewReport?: (report: HazardReport) => void;
}

const DuplicateClusterDetailPanel = ({ cluster, onClose, onViewReport }: DuplicateClusterDetailPanelProps) => {
  const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
  const similarityPercent = Math.round(cluster.similarityScore * 100);
  
  // Calculate average scores for the cluster
  const geoScore = Math.round(cluster.components.locationRadius * 100);
  const lexicalScore = Math.round((cluster.components.locationName + cluster.components.detailLocation + cluster.components.nonCompliance + cluster.components.subNonCompliance) / 4 * 100);
  const semanticScore = Math.round((cluster.components.locationDescription + cluster.components.imageContext + cluster.components.findingDescription) / 3 * 100);

  // First report is the representative
  const representativeId = clusterReports[0]?.id;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="relative w-full max-w-md bg-card border-l border-border shadow-xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Cluster {cluster.id}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <Users className="w-4 h-4" />
                  <span>{cluster.reportCount} laporan</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className={`text-2xl font-bold ${
                  similarityPercent >= 75 ? 'text-primary' :
                  similarityPercent >= 50 ? 'text-warning' : 'text-success'
                }`}>
                  {similarityPercent}%
                </span>
                <p className="text-xs text-muted-foreground">Final Score</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Score Badges */}
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              Geo: {geoScore}%
            </Badge>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              Lexical: {lexicalScore}%
            </Badge>
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
              Semantic: {semanticScore}%
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Reports List */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Laporan dalam Cluster</h4>
            <div className="space-y-3">
              {clusterReports.map((report) => {
                const isRepresentative = report.id === representativeId;
                const matchPercent = report.duplicateScores 
                  ? Math.round(report.duplicateScores.overall * 100) 
                  : similarityPercent;
                const reportGeo = report.duplicateScores ? Math.round(report.duplicateScores.geo * 100) : geoScore;
                const reportLex = report.duplicateScores ? Math.round(report.duplicateScores.lexical * 100) : lexicalScore;
                const reportSem = report.duplicateScores ? Math.round(report.duplicateScores.semantic * 100) : semanticScore;

                return (
                  <div
                    key={report.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                      isRepresentative 
                        ? 'bg-primary/5 border-primary/30' 
                        : 'bg-card border-border hover:bg-muted/30'
                    }`}
                    onClick={() => onViewReport?.(report)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{report.id}</span>
                        {isRepresentative && (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1 text-xs py-0">
                            <Star className="w-3 h-3" />
                            Representative
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={matchPercent} className="w-16 h-2" />
                        <span className="text-sm font-medium text-foreground w-10 text-right">{matchPercent}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-primary">Geo: {reportGeo}%</span>
                      <span className="text-warning">Lex: {reportLex}%</span>
                      <span className="text-muted-foreground">Sem: {reportSem}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Suggestion */}
          <div className="p-3 rounded-lg border border-info/30 bg-info/5 mb-6">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="bg-info/10 text-info border-info/30 shrink-0">
                Saran AI
              </Badge>
              <p className="text-sm text-muted-foreground">
                {similarityPercent >= 75 
                  ? "Semua tahap analisis menunjukkan laporan ini adalah duplicate dengan confidence tinggi"
                  : similarityPercent >= 50
                  ? "Beberapa laporan mungkin duplicate, perlu validasi manual untuk memastikan"
                  : "Kemiripan rendah, kemungkinan bukan duplicate"
                }
              </p>
            </div>
          </div>

          {/* Audit Log */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Audit Log</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Admin Safety</span>
                    <span className="text-muted-foreground"> • 25 Des 20:00</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Reviewed cluster</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">System</span>
                    <span className="text-muted-foreground"> • 24 Des 15:30</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Cluster created by AI analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateClusterDetailPanel;