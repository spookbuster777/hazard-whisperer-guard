import { useState, useMemo } from "react";
import { ArrowLeft, Bot, FileText, Layers, ClipboardCheck, List } from "lucide-react";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSidebar";
import AIQueueTable from "@/components/AIQueueTable";
import AIDuplicateQueueTable from "@/components/AIDuplicateQueueTable";
import DuplicateHazardList from "@/components/DuplicateHazardList";
import DuplicateClusterGrid from "@/components/DuplicateClusterGrid";
import EvaluatorTable from "@/components/EvaluatorTable";
import ReportDetail from "@/components/ReportDetail";
import ReportListPanel from "@/components/ReportListPanel";
import AIPipelineSummary from "@/components/AIPipelineSummary";
import EvaluatorSummary from "@/components/EvaluatorSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hazardReports, aiQueueReports, aiDuplicateQueueReports, dashboardStats, HazardReport, reportClusters } from "@/data/hazardReports";

const Index = () => {
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [mainTab, setMainTab] = useState("evaluasi");
  const [evaluasiSubTab, setEvaluasiSubTab] = useState("reports");
  const [duplicateSubTab, setDuplicateSubTab] = useState("list");

  // Filter only post-AI reports (AI_SELESAI)
  const evaluatorReports = useMemo(() => 
    hazardReports.filter(r => r.aiStatus === "AI_SELESAI"),
    []
  );

  // All AI queue reports for the AI Labeling tab
  const queueReports = useMemo(() => aiQueueReports, []);

  // Stats for AI Pipeline
  const aiPipelineStats = useMemo(() => ({
    menungguAnalisisAI: queueReports.filter(r => r.aiStatus === "MENUNGGU_ANALISIS_AI").length,
    sedangDiprosesAI: queueReports.filter(r => r.aiStatus === "SEDANG_ANALISIS_AI").length,
    aiSelesai: evaluatorReports.length, // Reports that completed AI analysis today
    aiGagal: queueReports.filter(r => r.aiStatus === "AI_GAGAL").length,
  }), [queueReports, evaluatorReports]);

  // Stats for Evaluator
  const evaluatorStats = useMemo(() => ({
    totalLaporan: evaluatorReports.length,
    siapDievaluasi: evaluatorReports.filter(r => r.evaluationStatus === "BELUM_DIEVALUASI").length,
    dalamEvaluasi: evaluatorReports.filter(r => r.evaluationStatus === "DALAM_EVALUASI").length,
    selesai: evaluatorReports.filter(r => r.evaluationStatus === "SELESAI").length,
    perluReviewUlang: evaluatorReports.filter(r => r.evaluationStatus === "PERLU_REVIEW_ULANG").length,
  }), [evaluatorReports]);

  const handleViewDetail = (report: HazardReport) => {
    const index = evaluatorReports.findIndex(r => r.id === report.id);
    setCurrentReportIndex(index);
    setSelectedReport(report);
  };

  const handleBack = () => {
    setSelectedReport(null);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentReportIndex - 1 : currentReportIndex + 1;
    if (newIndex >= 0 && newIndex < evaluatorReports.length) {
      setCurrentReportIndex(newIndex);
      setSelectedReport(evaluatorReports[newIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="BEATS Hazard Reporting System" 
          subtitle="Evaluator Dashboard v2.0" 
        />
        
        {selectedReport ? (
          <div className="flex-1 flex overflow-hidden">
            <ReportListPanel 
              reports={evaluatorReports}
              selectedReportId={selectedReport.id}
              onSelectReport={handleViewDetail}
            />
            <div className="flex-1 overflow-y-auto">
              <ReportDetail 
                report={selectedReport}
                onBack={handleBack}
                currentIndex={currentReportIndex + 1}
                totalReports={evaluatorReports.length}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        ) : (
          <main className="p-4 sm:p-6 flex-1 overflow-auto">
            <div className="max-w-[1600px] mx-auto">
              {/* Dashboard Title */}
              <div className="flex items-center gap-2 mb-6">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                <h1 className="text-xl font-bold text-foreground">Evaluator Dashboard</h1>
              </div>

              {/* Main Tabs: Evaluasi & AI Labeling */}
              <Tabs value={mainTab} onValueChange={setMainTab}>
                <TabsList className="bg-muted/50 mb-6">
                  <TabsTrigger value="evaluasi" className="gap-2 px-6">
                    <ClipboardCheck className="w-4 h-4" />
                    Evaluasi
                    <span className="ml-1 px-1.5 py-0.5 bg-success/20 text-success rounded text-xs font-medium">
                      {evaluatorReports.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="ai-labeling" className="gap-2 px-6">
                    <Bot className="w-4 h-4" />
                    AI Labeling
                    <span className="ml-1 px-1.5 py-0.5 bg-warning/20 text-warning rounded text-xs font-medium">
                      {queueReports.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="ai-duplicate" className="gap-2 px-6">
                    <Layers className="w-4 h-4" />
                    AI Duplicate
                    <span className="ml-1 px-1.5 py-0.5 bg-info/20 text-info rounded text-xs font-medium">
                      {aiDuplicateQueueReports.length}
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* Evaluasi Tab Content */}
                <TabsContent value="evaluasi" className="space-y-6">
                  {/* Evaluator Summary */}
                  <EvaluatorSummary stats={evaluatorStats} />

                  {/* Sub-tabs for Evaluasi */}
                  <Tabs value={evaluasiSubTab} onValueChange={setEvaluasiSubTab}>
                    <TabsList className="bg-muted/30">
                      <TabsTrigger value="reports" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Daftar Laporan
                        <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs font-medium">
                          {evaluatorReports.length}
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="duplicate" className="gap-2">
                        <Layers className="w-4 h-4" />
                        Duplicate Hazard
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="reports" className="mt-4">
                      <EvaluatorTable 
                        reports={evaluatorReports} 
                        onViewDetail={handleViewDetail} 
                      />
                    </TabsContent>

                    <TabsContent value="duplicate" className="mt-4">
                      {/* Sub-tabs for Duplicate Hazard */}
                      <Tabs value={duplicateSubTab} onValueChange={setDuplicateSubTab}>
                        <TabsList className="bg-card border border-border shadow-sm rounded-lg p-1">
                          <TabsTrigger 
                            value="list" 
                            className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-4 py-2"
                          >
                            <List className="w-4 h-4" />
                            List Hazard
                            <span className="ml-1 px-2 py-0.5 bg-muted text-muted-foreground data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-full text-xs font-semibold">
                              {aiDuplicateQueueReports.length}
                            </span>
                          </TabsTrigger>
                          <TabsTrigger 
                            value="cluster" 
                            className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-4 py-2"
                          >
                            <Layers className="w-4 h-4" />
                            Duplicate Cluster
                            <span className="ml-1 px-2 py-0.5 bg-muted text-muted-foreground data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-full text-xs font-semibold">
                              {reportClusters.length}
                            </span>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="list" className="mt-4">
                          <DuplicateHazardList reports={aiDuplicateQueueReports} />
                        </TabsContent>

                        <TabsContent value="cluster" className="mt-4">
                          <DuplicateClusterGrid clusters={reportClusters} />
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                {/* AI Labeling Tab Content */}
                <TabsContent value="ai-labeling" className="space-y-6">
                  {/* AI Pipeline Summary */}
                  <AIPipelineSummary stats={aiPipelineStats} />

                  {/* AI Queue */}
                  <AIQueueTable reports={queueReports} />
                </TabsContent>

                {/* AI Duplicate Tab Content */}
                <TabsContent value="ai-duplicate" className="space-y-6">
                  <AIDuplicateQueueTable reports={aiDuplicateQueueReports} />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default Index;
