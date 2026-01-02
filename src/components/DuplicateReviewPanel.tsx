import { X, FileText, User, Calendar, MapPin, ExternalLink, Image, Layers, ChevronDown, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HazardReport, hazardReports, reportClusters } from "@/data/hazardReports";

interface DuplicateReviewPanelProps {
  report: HazardReport;
  onClose: () => void;
}

const formatDate = (timestamp?: string) => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleString("id-ID", { 
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit", 
    minute: "2-digit" 
  }).replace(" pukul ", " pukul ");
};

const getScoreColor = (score: number) => {
  if (score >= 0.75) return "bg-destructive/10 text-destructive";
  if (score >= 0.5) return "bg-warning/10 text-warning";
  return "bg-success/10 text-success";
};

const DuplicateReviewPanel = ({ report, onClose }: DuplicateReviewPanelProps) => {
  // Find cluster info for this report
  const cluster = report.cluster ? reportClusters.find(c => c.id === report.cluster) : null;
  
  // Find similar reports in the same cluster
  const similarReports = cluster 
    ? hazardReports.filter(r => r.cluster === cluster.id && r.id !== report.id)
    : [];

  const clusterMemberCount = similarReports.length + 1;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-card border-l border-border shadow-xl animate-slide-in overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">{report.id}</h2>
              <p className="text-sm text-muted-foreground">Duplicate Review Panel</p>
            </div>
            <div className="flex items-center gap-3">
              {cluster && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  {cluster.id} • {clusterMemberCount} anggota
                  <button className="ml-1 hover:text-primary/70">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Main Report */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="w-4 h-4" />
                <h3 className="font-semibold">Laporan Utama</h3>
              </div>

              {/* Reporter & Date */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{report.pelapor}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(report.timestamp)}</span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="font-medium">{report.site}</Badge>
                <span className="text-muted-foreground">{report.lokasiArea}</span>
              </div>
              <p className="text-sm text-muted-foreground">{report.detailLokasi || report.lokasi}</p>

              {/* Ketidaksesuaian */}
              <div className="space-y-1">
                <span className="text-xs text-primary font-medium">Ketidaksesuaian</span>
                <p className="text-sm font-medium text-foreground">{report.ketidaksesuaian || report.jenisHazard}</p>
                <p className="text-xs text-muted-foreground">{report.subKetidaksesuaian || report.subJenisHazard}</p>
              </div>

              {/* Quick Action */}
              {report.quickAction && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Quick Action</span>
                  <Badge variant="outline" className="font-medium">{report.quickAction}</Badge>
                </div>
              )}

              {/* Deskripsi */}
              <div className="space-y-1">
                <span className="text-xs text-primary font-medium">Deskripsi Temuan</span>
                <div className="p-3 bg-muted/30 rounded-lg border-l-4 border-primary/50">
                  <p className="text-sm text-foreground">{report.deskripsiTemuan}</p>
                </div>
              </div>

              {/* Keterangan Lokasi */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Keterangan Lokasi</span>
                <p className="text-sm text-foreground">{report.detailLokasi || "-"}</p>
              </div>

              {/* Foto Laporan */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  Foto Laporan
                </span>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
                  <Image className="w-12 h-12 text-muted-foreground/30" />
                </div>
              </div>

              {/* AI Analysis Accordion */}
              {report.duplicateScores && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">✦</span>
                    <span className="font-medium text-foreground">Detail Analisis AI</span>
                  </div>

                  <Accordion type="single" collapsible className="space-y-2">
                    <AccordionItem value="geo" className="border border-border rounded-lg px-3">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Navigation className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Geo Analysis</span>
                          <Badge className={`${getScoreColor(report.duplicateScores.geo)} text-xs`}>
                            {(report.duplicateScores.geo * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground pb-3">
                        Analisis kedekatan lokasi geografis berdasarkan koordinat dan radius.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="lexical" className="border border-border rounded-lg px-3">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Lexical Analysis</span>
                          <Badge className={`${getScoreColor(report.duplicateScores.lexical)} text-xs`}>
                            {(report.duplicateScores.lexical * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground pb-3">
                        Kesamaan kata dan frasa dalam deskripsi temuan.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="semantic" className="border border-border rounded-lg px-3">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Layers className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Semantic Analysis</span>
                          <Badge className={`${getScoreColor(report.duplicateScores.semantic)} text-xs`}>
                            {(report.duplicateScores.semantic * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground pb-3">
                        Kesamaan makna menggunakan AI embedding model.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </div>

            {/* Right Column - Duplicate Candidates */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Layers className="w-4 h-4" />
                <h3 className="font-semibold">Kemungkinan Duplikat</h3>
                <Badge variant="outline" className="ml-1">{similarReports.length}</Badge>
              </div>

              {cluster && (
                <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cluster ID</span>
                    <span className="text-primary font-medium">{cluster.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Anggota</span>
                    <span className="font-medium">{clusterMemberCount} laporan</span>
                  </div>
                </div>
              )}

              {/* Similar Reports List */}
              <div className="space-y-3">
                {similarReports.length > 0 ? (
                  similarReports.map((similarReport) => (
                    <div 
                      key={similarReport.id}
                      className="p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-primary">{similarReport.id}</span>
                          <p className="text-xs text-muted-foreground">{similarReport.pelapor}</p>
                        </div>
                        {similarReport.duplicateScores && (
                          <Badge className={`${getScoreColor(similarReport.duplicateScores.overall)} text-xs`}>
                            {(similarReport.duplicateScores.overall * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{similarReport.site}</Badge>
                        <span className="text-xs text-muted-foreground">{similarReport.lokasiArea}</span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {similarReport.deskripsiTemuan}
                      </p>

                      {/* Score breakdown */}
                      {similarReport.duplicateScores && (
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            <span className={getScoreColor(similarReport.duplicateScores.geo).replace('bg-', 'text-').split(' ')[1]}>
                              {(similarReport.duplicateScores.geo * 100).toFixed(0)}%
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span className={getScoreColor(similarReport.duplicateScores.lexical).replace('bg-', 'text-').split(' ')[1]}>
                              {(similarReport.duplicateScores.lexical * 100).toFixed(0)}%
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            <span className={getScoreColor(similarReport.duplicateScores.semantic).replace('bg-', 'text-').split(' ')[1]}>
                              {(similarReport.duplicateScores.semantic * 100).toFixed(0)}%
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground bg-muted/20 rounded-lg">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Tidak ada laporan duplikat yang terdeteksi</p>
                  </div>
                )}
              </div>

              {similarReports.length > 0 && (
                <Button variant="outline" className="w-full">
                  Lihat Detail
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateReviewPanel;