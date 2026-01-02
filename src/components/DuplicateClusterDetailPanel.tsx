import { X, Layers, Users, FileText, AlertTriangle, HelpCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "./StatusBadge";
import { ClusterInfo, hazardReports, HazardReport } from "@/data/hazardReports";

interface DuplicateClusterDetailPanelProps {
  cluster: ClusterInfo;
  onClose: () => void;
  onViewReport?: (report: HazardReport) => void;
}

const getStatusColor = (status: ClusterInfo['status']) => {
  switch (status) {
    case 'Duplikat Kuat':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'Duplikat Mungkin':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'Bukan Duplikat':
      return 'bg-success/10 text-success border-success/20';
  }
};

const getStatusIcon = (status: ClusterInfo['status']) => {
  switch (status) {
    case 'Duplikat Kuat':
      return <AlertTriangle className="w-4 h-4" />;
    case 'Duplikat Mungkin':
      return <HelpCircle className="w-4 h-4" />;
    case 'Bukan Duplikat':
      return <CheckCircle className="w-4 h-4" />;
  }
};

const getLabelColor = (label: string): string => {
  switch (label) {
    case "TBC":
      return "bg-warning/10 text-warning border-warning/20";
    case "PSPP":
      return "bg-info/10 text-info border-info/20";
    case "GR":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getReportLabel = (report: HazardReport): ('TBC' | 'PSPP' | 'GR')[] => {
  if (report.labels && report.labels.length > 0) {
    return report.labels;
  }
  if (report.jenisHazard === "APD") return ["TBC"];
  if (report.jenisHazard === "Pengoperasian Kendaraan") return ["PSPP"];
  if (report.jenisHazard === "Kondisi Area" || report.jenisHazard === "Perawatan Jalan") return ["GR"];
  return ["TBC"];
};

const DuplicateClusterDetailPanel = ({ cluster, onClose, onViewReport }: DuplicateClusterDetailPanelProps) => {
  const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
  const similarityPercent = Math.round(cluster.similarityScore * 100);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{cluster.id}: {cluster.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={getStatusColor(cluster.status)}>
                  {getStatusIcon(cluster.status)}
                  <span className="ml-1">{cluster.status}</span>
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {cluster.reportCount} laporan
                </span>
                <span className={`text-sm font-bold ${
                  similarityPercent >= 75 ? 'text-destructive' :
                  similarityPercent >= 50 ? 'text-warning' : 'text-success'
                }`}>
                  {similarityPercent}% kemiripan
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content - Table Like HazardTable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Daftar Laporan Duplicate</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Label</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">ID Tracking</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tanggal</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Pelapor</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Lokasi</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Jenis Hazard</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Match</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {clusterReports.map((report, index) => {
                  const labels = getReportLabel(report);
                  const matchPercent = report.duplicateScores 
                    ? Math.round(report.duplicateScores.overall * 100) 
                    : similarityPercent;
                  
                  return (
                    <tr 
                      key={report.id} 
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {labels.map(label => (
                            <span 
                              key={label}
                              className={`text-xs px-2 py-0.5 rounded border font-medium ${getLabelColor(label)}`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{report.id}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{report.tanggal}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{report.pelapor}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{report.lokasiKode}</p>
                          <p className="text-xs text-muted-foreground">{report.lokasi}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{report.jenisHazard}</p>
                          <p className="text-xs text-muted-foreground">{report.subJenisHazard}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={report.evaluationStatus === 'SELESAI' ? 'Selesai' : report.evaluationStatus === 'DALAM_EVALUASI' ? 'Dalam Proses' : 'Menunggu Review'} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs ${
                          matchPercent >= 75 ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          matchPercent >= 50 ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-success/10 text-success border-success/20'
                        }`}>
                          {matchPercent}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
                          onClick={() => onViewReport?.(report)}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Lihat
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {clusterReports.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Tidak ada laporan dalam cluster ini.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {clusterReports.length} laporan dalam cluster
          </p>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateClusterDetailPanel;