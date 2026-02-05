 import { useState, useCallback, useEffect } from "react";
 import { X, Star, User, MapPin, FileText, Brain, Calendar, ChevronDown, ChevronUp, Globe, Type, Users, Image as ImageIcon, ArrowLeft, Copy, Check, AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { hazardReports, HazardReport, reportClusters } from "@/data/hazardReports";
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
 import { Separator } from "@/components/ui/separator";
 import { toast } from "sonner";
 import { Progress } from "@/components/ui/progress";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
 import { Textarea } from "@/components/ui/textarea";
 
 const AUTO_CONFIRM_DURATION = 60;
 
 const generateDistanceScores = () => ({
   imageDistance: Math.floor(Math.random() * 900000000) + 100000000,
   descriptionDistance: Math.floor(Math.random() * 90000000) + 10000000,
   locationDescDistance: Math.floor(Math.random() * 900000000) + 100000000,
 });
 
 type AnnotationStatus = 'pending' | 'duplicate' | 'not_duplicate' | 'auto_confirmed';
 
 interface AnnotationData {
   status: AnnotationStatus;
   notes?: string;
   queuedForLabeling?: boolean;
 }
 
 const CopyIdButton = ({ id }: { id: string }) => {
   const [copied, setCopied] = useState(false);
   
   const handleCopy = useCallback(() => {
     navigator.clipboard.writeText(id);
     setCopied(true);
     toast.success("ID berhasil disalin!");
     setTimeout(() => setCopied(false), 2000);
   }, [id]);
 
   return (
     <button 
       onClick={handleCopy}
       className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-colors"
     >
       <span className="font-mono text-xs font-semibold text-primary">{id}</span>
       {copied ? (
         <Check className="w-3 h-3 text-green-500" />
       ) : (
         <Copy className="w-3 h-3 text-primary" />
       )}
     </button>
   );
 };
 
 const AnalysisSection = ({ 
   report, 
   semanticScore,
   distanceScores
 }: { 
   report: HazardReport; 
   semanticScore: number;
   distanceScores: { imageDistance: number; descriptionDistance: number; locationDescDistance: number };
 }) => {
   const [geoOpen, setGeoOpen] = useState(false);
   const [lexicalOpen, setLexicalOpen] = useState(false);
 
   return (
     <div className="space-y-3">
       <div className="p-3 rounded-lg bg-card border border-border">
         <div className="flex items-center gap-2 mb-3">
           <Brain className="w-4 h-4 text-purple-500" />
           <span className="text-sm font-semibold text-foreground">Analisis Semantik</span>
           <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs ml-auto">
             {semanticScore}%
           </Badge>
         </div>
         
         <div className="space-y-3">
           <div>
             <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
               <span>🧠</span> Interpretasi Makna
             </p>
             <p className="text-xs text-muted-foreground leading-relaxed">
               Analisis makna menunjukkan kesamaan konteks pelanggaran dan kondisi hazard yang dilaporkan.
             </p>
           </div>
 
           <div>
             <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
               <span>✨</span> Visual Terdeteksi
             </p>
             <div className="flex flex-wrap gap-1.5">
               <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs">
                 objek teridentifikasi
               </Badge>
               <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs">
                 kondisi terdeteksi
               </Badge>
             </div>
           </div>
 
           <div className="pt-2 border-t border-border space-y-2">
             <p className="text-xs text-muted-foreground mb-2">Distance Scores</p>
             <div className="space-y-1.5">
               <div className="flex items-center justify-between text-xs">
                 <span className="text-muted-foreground">Distance Score Gambar (kemiripan gambar)</span>
                 <span className="font-mono text-foreground">{distanceScores.imageDistance.toLocaleString()}</span>
               </div>
               <div className="flex items-center justify-between text-xs">
                 <span className="text-muted-foreground">Distance Score Deskripsi (kemiripan deskripsi)</span>
                 <span className="font-mono text-foreground">{distanceScores.descriptionDistance.toLocaleString()}</span>
               </div>
               <div className="flex items-center justify-between text-xs">
                 <span className="text-muted-foreground">Distance Score Keterangan Lokasi</span>
                 <span className="font-mono text-foreground">{distanceScores.locationDescDistance.toLocaleString()}</span>
               </div>
             </div>
           </div>
         </div>
       </div>
 
       <Collapsible open={geoOpen} onOpenChange={setGeoOpen}>
         <div className="rounded-lg border border-border overflow-hidden">
           <CollapsibleTrigger asChild>
             <button className="w-full p-3 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
               <div className="flex items-center gap-2">
                 <Globe className="w-4 h-4 text-blue-500" />
                 <span className="text-sm font-semibold text-foreground">Analisis Geo (Lokasi)</span>
               </div>
               <div className="flex items-center gap-2">
                 <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">
                   100%
                 </Badge>
                 {geoOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
               </div>
             </button>
           </CollapsibleTrigger>
           <CollapsibleContent>
             <div className="p-3 bg-blue-500/5 border-t border-border space-y-3">
               <div>
                 <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                   <MapPin className="w-3 h-3" /> Kecocokan Lokasi
                 </p>
                 <div className="grid grid-cols-2 gap-2 text-xs">
                   <div className="p-2 rounded bg-card border border-border">
                     <p className="text-muted-foreground">Site</p>
                     <p className="font-medium text-foreground">{report.site}</p>
                   </div>
                   <div className="p-2 rounded bg-card border border-border">
                     <p className="text-muted-foreground">Area</p>
                     <p className="font-medium text-foreground">{report.lokasiArea || report.lokasi}</p>
                   </div>
                 </div>
               </div>
             </div>
           </CollapsibleContent>
         </div>
       </Collapsible>
 
       <Collapsible open={lexicalOpen} onOpenChange={setLexicalOpen}>
         <div className="rounded-lg border border-border overflow-hidden">
           <CollapsibleTrigger asChild>
             <button className="w-full p-3 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
               <div className="flex items-center gap-2">
                 <Type className="w-4 h-4 text-orange-500" />
                 <span className="text-sm font-semibold text-foreground">Analisis Lexical (Kata)</span>
               </div>
               <div className="flex items-center gap-2">
                 <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">
                   100%
                 </Badge>
                 {lexicalOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
               </div>
             </button>
           </CollapsibleTrigger>
           <CollapsibleContent>
             <div className="p-3 bg-orange-500/5 border-t border-border space-y-3">
               <div>
                 <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                   <span>🔤</span> Kata Kunci Terdeteksi
                 </p>
                 <div className="flex flex-wrap gap-1.5">
                   {report.jenisHazard && (
                     <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">
                       {report.jenisHazard}
                     </Badge>
                   )}
                   {report.subJenisHazard && (
                     <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">
                       {report.subJenisHazard}
                     </Badge>
                   )}
                 </div>
               </div>
             </div>
           </CollapsibleContent>
         </div>
       </Collapsible>
     </div>
   );
 };
 
 interface HazardDuplicateFloatingPanelProps {
   report: HazardReport;
   onClose: () => void;
 }
 
 const HazardDuplicateFloatingPanel = ({ report, onClose }: HazardDuplicateFloatingPanelProps) => {
   const cluster = reportClusters.find(c => c.id === report.cluster);
 
   const clusterReports = report.cluster
     ? hazardReports.filter(r => r.cluster === report.cluster)
     : [];
 
   const representativeReport = clusterReports.length > 0 ? clusterReports[0] : null;
   const duplicateReports = clusterReports.filter(r => r.id !== representativeReport?.id);
 
   const [selectedComparisonId, setSelectedComparisonId] = useState<string | null>(
     duplicateReports.length > 0 ? duplicateReports[0].id : null
   );
   const selectedComparison = duplicateReports.find(r => r.id === selectedComparisonId) || null;
 
   const [sortBy, setSortBy] = useState<'semantic' | 'geo' | 'lexical'>('semantic');
   const [annotations, setAnnotations] = useState<Record<string, AnnotationData>>({});
   const [timers, setTimers] = useState<Record<string, number>>({});
   const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
   const [annotationNotes, setAnnotationNotes] = useState("");
   const [pendingAnnotation, setPendingAnnotation] = useState<string | null>(null);
 
   useEffect(() => {
     const initialTimers: Record<string, number> = {};
     duplicateReports.forEach(r => {
       if (!annotations[r.id]) {
         initialTimers[r.id] = AUTO_CONFIRM_DURATION;
       }
     });
     setTimers(prev => ({ ...prev, ...initialTimers }));
   }, [duplicateReports.length]);
 
   useEffect(() => {
     const interval = setInterval(() => {
       setTimers(prev => {
         const updated = { ...prev };
         Object.keys(updated).forEach(id => {
           if (!annotations[id] && updated[id] > 0) {
             updated[id] -= 1;
             if (updated[id] === 0) {
               setAnnotations(a => ({
                 ...a,
                 [id]: { status: 'auto_confirmed', notes: 'Auto-confirmed by system' }
               }));
             }
           }
         });
         return updated;
       });
     }, 1000);
     return () => clearInterval(interval);
   }, [annotations]);
 
   const sortedDuplicates = [...duplicateReports].sort((a, b) => {
     const aScore = a.duplicateScores?.[sortBy] || 0;
     const bScore = b.duplicateScores?.[sortBy] || 0;
     return bScore - aScore;
   });
 
   const compDistanceScores = generateDistanceScores();
 
   const handleAnnotate = (reportId: string, status: 'duplicate' | 'not_duplicate') => {
     if (status === 'not_duplicate') {
       setPendingAnnotation(reportId);
       setShowAnnotationDialog(true);
     } else {
       setAnnotations(prev => ({
         ...prev,
         [reportId]: { status: 'duplicate' }
       }));
       toast.success("Ditandai sebagai Duplicate");
     }
   };
 
   const handleSubmitAnnotation = () => {
     if (pendingAnnotation) {
       setAnnotations(prev => ({
         ...prev,
         [pendingAnnotation]: {
           status: 'not_duplicate',
           notes: annotationNotes,
           queuedForLabeling: true
         }
       }));
       toast.success("Ditandai sebagai Bukan Duplicate dan masuk antrian labeling");
       setShowAnnotationDialog(false);
       setAnnotationNotes("");
       setPendingAnnotation(null);
     }
   };
 
   const getAnnotationBadge = (reportId: string) => {
     const annotation = annotations[reportId];
     if (!annotation) return null;
 
     switch (annotation.status) {
       case 'duplicate':
         return <Badge className="bg-green-500 text-white text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Duplicate</Badge>;
       case 'not_duplicate':
         return <Badge className="bg-red-500 text-white text-xs gap-1"><XCircle className="w-3 h-3" />Bukan Duplicate</Badge>;
       case 'auto_confirmed':
         return <Badge className="bg-blue-500 text-white text-xs gap-1"><Clock className="w-3 h-3" />Auto-confirmed</Badge>;
       default:
         return null;
     }
   };
 
   const ReportCard = ({
     r,
     isRepresentative = false,
     showAnalysis = false,
     title = "Laporan",
     distScores
   }: {
     r: HazardReport;
     isRepresentative?: boolean;
     showAnalysis?: boolean;
     title?: string;
     distScores: { imageDistance: number; descriptionDistance: number; locationDescDistance: number };
   }) => {
     const semanticVal = r.duplicateScores ? Math.round(r.duplicateScores.semantic * 100) : 0;
 
     return (
       <div className="space-y-4">
         {isRepresentative && (
           <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 gap-1">
             <Star className="w-3 h-3 fill-current" />
             Representative
           </Badge>
         )}
 
         <div className="flex items-center justify-between gap-2">
           <div className="flex items-center gap-2">
             <FileText className="w-4 h-4 text-muted-foreground" />
             <span className="font-semibold text-foreground">{title}</span>
           </div>
           <CopyIdButton id={r.id} />
         </div>
 
         <div className="flex items-center gap-4 text-sm text-muted-foreground">
           <div className="flex items-center gap-1">
             <Calendar className="w-4 h-4" />
             <span>{r.tanggal}</span>
           </div>
           <div className="flex items-center gap-1">
             <User className="w-4 h-4" />
             <span>{r.pelapor}</span>
           </div>
         </div>
 
         <div className="grid grid-cols-2 gap-3">
           <div>
             <p className="text-xs text-muted-foreground mb-1">Site</p>
             <div className="flex items-center gap-1.5">
               <Globe className="w-3.5 h-3.5 text-muted-foreground" />
               <span className="text-sm font-medium text-foreground">{r.site}</span>
             </div>
           </div>
           <div>
             <p className="text-xs text-muted-foreground mb-1">Lokasi</p>
             <div className="flex items-center gap-1.5">
               <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
               <span className="text-sm font-medium text-foreground">{r.lokasiArea}</span>
             </div>
           </div>
         </div>
 
         <div>
           <p className="text-xs text-muted-foreground mb-1">Asal Cluster</p>
           {r.cluster ? (
             <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1">
               ⊕ {r.cluster}
             </Badge>
           ) : (
             <span className="text-sm text-muted-foreground">-</span>
           )}
         </div>
 
         <div className="p-3 rounded-lg bg-muted/30 border border-border">
           <div className="flex items-center gap-2 mb-2 text-muted-foreground">
             <FileText className="w-4 h-4" />
             <span className="text-sm font-medium">Deskripsi Temuan</span>
           </div>
           <p className="text-sm text-foreground leading-relaxed">
             {r.deskripsiTemuan}
           </p>
         </div>
 
         <div className="p-3 rounded-lg bg-muted/30 border border-border">
           <div className="flex items-center gap-2 mb-2 text-muted-foreground">
             <ImageIcon className="w-4 h-4" />
             <span className="text-sm font-medium">Gambar Temuan (1)</span>
           </div>
           <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center">
             <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
           </div>
         </div>
 
         {showAnalysis && (
           <AnalysisSection 
             report={r} 
             semanticScore={semanticVal} 
             distanceScores={distScores}
           />
         )}
       </div>
     );
   };
 
   const SimilarReportItem = ({ r }: { r: HazardReport }) => {
     const semanticVal = r.duplicateScores ? Math.round(r.duplicateScores.semantic * 100) : 0;
     const geoVal = 100;
     const lexicalVal = 100;
     const isSelected = selectedComparisonId === r.id;
     const annotation = annotations[r.id];
     const timer = timers[r.id] || 0;
     const timerProgress = (timer / AUTO_CONFIRM_DURATION) * 100;
 
     return (
       <div
         className={`p-3 rounded-lg border cursor-pointer transition-all ${
           isSelected
             ? 'border-primary bg-primary/5'
             : 'border-border bg-card hover:border-primary/50'
         }`}
         onClick={() => setSelectedComparisonId(r.id)}
       >
         <div className="flex items-start justify-between gap-2 mb-2">
           <div>
             <p className="text-sm font-semibold text-foreground">{r.id}</p>
             <p className="text-xs text-muted-foreground">{r.tanggal} • {r.pelapor}</p>
           </div>
           <span className="text-lg font-bold text-primary">{semanticVal}%</span>
         </div>
 
         <div className="flex gap-1.5 mb-2">
           <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">
             G:{geoVal}%
           </Badge>
           <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">
             L:{lexicalVal}%
           </Badge>
           <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs">
             S:{semanticVal}%
           </Badge>
         </div>
 
         <div className="flex items-start gap-2 mb-3">
           <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
           <p className="text-xs text-muted-foreground line-clamp-2">{r.deskripsiTemuan}</p>
         </div>
 
         {annotation ? (
           <div className="mb-2">{getAnnotationBadge(r.id)}</div>
         ) : (
           <div className="mb-3">
             <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
               <div className="flex items-center gap-1">
                 <Clock className="w-3 h-3" />
                 <span>Auto-confirm dalam:</span>
               </div>
               <span className="font-mono">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
             </div>
             <Progress value={timerProgress} className="h-1.5" />
           </div>
         )}
 
         {!annotation && (
           <div className="flex gap-2">
             <Button
               size="sm"
               variant="outline"
               className="flex-1 bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20 text-xs"
               onClick={(e) => { e.stopPropagation(); handleAnnotate(r.id, 'duplicate'); }}
             >
               <CheckCircle2 className="w-3 h-3 mr-1" />
               Duplicate
             </Button>
             <Button
               size="sm"
               variant="outline"
               className="flex-1 bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20 text-xs"
               onClick={(e) => { e.stopPropagation(); handleAnnotate(r.id, 'not_duplicate'); }}
             >
               <XCircle className="w-3 h-3 mr-1" />
               Bukan Duplicate
             </Button>
           </div>
         )}
       </div>
     );
   };
 
   return (
     <div className="fixed inset-0 z-50 flex justify-end">
       <div
         className="absolute inset-0 bg-background/60 backdrop-blur-sm"
         onClick={onClose}
       />
 
       <div className="relative w-full max-w-6xl h-full bg-card shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
         <div className="p-4 border-b border-border bg-muted/30">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                 <Brain className="w-5 h-5 text-purple-500" />
               </div>
               <div>
                 <h3 className="font-bold text-foreground text-lg">Semantic Review</h3>
                 <p className="text-sm text-muted-foreground">
                   Mode Perbandingan Makna • {duplicateReports.length} laporan mirip
                 </p>
               </div>
             </div>
             <Button variant="ghost" size="icon" onClick={onClose}>
               <X className="w-4 h-4" />
             </Button>
           </div>
         </div>
 
         <div className="flex-1 flex overflow-hidden">
           <ScrollArea className="w-1/3 border-r border-border">
             <div className="p-4">
               {representativeReport && (
                 <ReportCard
                   r={representativeReport}
                   isRepresentative
                   title="Laporan Utama"
                   showAnalysis={false}
                   distScores={generateDistanceScores()}
                 />
               )}
             </div>
           </ScrollArea>
 
           <ScrollArea className="w-1/3 border-r border-border bg-muted/5">
             <div className="p-4">
               <button
                 className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                 onClick={onClose}
               >
                 <ArrowLeft className="w-4 h-4" />
                 Kembali ke List
               </button>
 
               {selectedComparison ? (
                 <ReportCard
                   r={selectedComparison}
                   title="Laporan Pembanding"
                   showAnalysis
                   distScores={compDistanceScores}
                 />
               ) : (
                 <div className="flex flex-col items-center justify-center py-12 text-center">
                   <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
                   <p className="text-muted-foreground">Pilih laporan dari daftar di kanan</p>
                 </div>
               )}
             </div>
           </ScrollArea>
 
           <ScrollArea className="w-1/3">
             <div className="p-4">
               <div className="flex items-center justify-between mb-4">
                 <h4 className="font-semibold text-foreground text-sm">
                   Laporan Mirip (berdasarkan makna)
                 </h4>
               </div>
 
               <Select value={sortBy} onValueChange={(v: 'semantic' | 'geo' | 'lexical') => setSortBy(v)}>
                 <SelectTrigger className="w-full mb-4">
                   <SelectValue placeholder="Urutkan" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="semantic">Semantic Tertinggi</SelectItem>
                   <SelectItem value="geo">Geo Tertinggi</SelectItem>
                   <SelectItem value="lexical">Lexical Tertinggi</SelectItem>
                 </SelectContent>
               </Select>
 
               <div className="space-y-3">
                 {sortedDuplicates.length > 0 ? (
                   sortedDuplicates.map(r => (
                     <SimilarReportItem key={r.id} r={r} />
                   ))
                 ) : (
                   <div className="text-center py-8 text-muted-foreground">
                     <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                     <p className="text-sm">Tidak ada laporan mirip</p>
                   </div>
                 )}
               </div>
             </div>
           </ScrollArea>
         </div>
 
         <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <Users className="w-4 h-4" />
             <span>Cluster dibuat oleh AI • {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
           </div>
           <Button variant="outline" onClick={onClose}>
             Tutup
           </Button>
         </div>
       </div>
 
       <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Catatan Anotasi - Bukan Duplicate</DialogTitle>
           </DialogHeader>
           <div className="py-4">
             <p className="text-sm text-muted-foreground mb-3">
               Jelaskan mengapa laporan ini bukan duplicate. Laporan akan masuk ke antrian TBC/PSPP.GR untuk labeling.
             </p>
             <Textarea
               placeholder="Tulis alasan mengapa ini bukan duplicate..."
               value={annotationNotes}
               onChange={(e) => setAnnotationNotes(e.target.value)}
               rows={4}
             />
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setShowAnnotationDialog(false)}>
               Batal
             </Button>
             <Button onClick={handleSubmitAnnotation} disabled={!annotationNotes.trim()}>
               Simpan & Kirim ke Labeling
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default HazardDuplicateFloatingPanel;