import { useState, useMemo } from "react";
import { Search, Filter, X, MapPin, FileText, Layers, ChevronDown } from "lucide-react";
import DuplicateClusterCard from "./DuplicateClusterCard";
import DuplicateClusterDetailPanel from "./DuplicateClusterDetailPanel";
import { ClusterInfo, HazardReport, hazardReports, siteOptions } from "@/data/hazardReports";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { ketidaksesuaianData } from "@/data/ketidaksesuaianData";

interface DuplicateClusterGridProps {
  clusters: ClusterInfo[];
  onViewReport?: (report: HazardReport) => void;
}

// Get unique values from hazard reports for filters
const getUniqueValues = (field: keyof HazardReport): string[] => {
  const values = hazardReports.map(r => r[field]).filter(Boolean) as string[];
  return [...new Set(values)];
};

const DuplicateClusterGrid = ({ clusters, onViewReport }: DuplicateClusterGridProps) => {
  const [viewingCluster, setViewingCluster] = useState<ClusterInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Hierarchical cluster filters
  const [selectedGeoCluster, setSelectedGeoCluster] = useState<string[]>([]);
  const [selectedLexicalCluster, setSelectedLexicalCluster] = useState<string[]>([]);
  const [selectedSemanticCluster, setSelectedSemanticCluster] = useState<string[]>([]);
  
  // Data filters
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedLokasi, setSelectedLokasi] = useState<string[]>([]);
  const [selectedKetidaksesuaian, setSelectedKetidaksesuaian] = useState<string[]>([]);
  const [selectedSubKetidaksesuaian, setSelectedSubKetidaksesuaian] = useState<string[]>([]);

  // Get unique location areas from reports
  const uniqueLokasiAreas = useMemo(() => getUniqueValues('lokasiArea'), []);
  
  // Generate cluster IDs for filters
  const clusterIds = useMemo(() => clusters.map(c => c.id), [clusters]);
  const geoClusterIds = useMemo(() => clusterIds.map(id => `GCL-${id.replace('C-', '')}`), [clusterIds]);
  const lexicalClusterIds = useMemo(() => clusterIds.map(id => `LCL-${id.replace('C-', '')}`), [clusterIds]);
  const semanticClusterIds = useMemo(() => clusterIds.map(id => `SCL-${id.replace('C-', '')}`), [clusterIds]);

  // Filter clusters based on all filters
  const filteredClusters = useMemo(() => {
    return clusters.filter(cluster => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
        const matchesSearch = 
          cluster.id.toLowerCase().includes(searchLower) ||
          cluster.name.toLowerCase().includes(searchLower) ||
          clusterReports.some(r => 
            r.deskripsiTemuan?.toLowerCase().includes(searchLower) ||
            r.site?.toLowerCase().includes(searchLower) ||
            r.lokasiArea?.toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }

      // Geo cluster filter
      if (selectedGeoCluster.length > 0) {
        const geoId = `GCL-${cluster.id.replace('C-', '')}`;
        if (!selectedGeoCluster.includes(geoId)) return false;
      }

      // Lexical cluster filter
      if (selectedLexicalCluster.length > 0) {
        const lexId = `LCL-${cluster.id.replace('C-', '')}`;
        if (!selectedLexicalCluster.includes(lexId)) return false;
      }

      // Semantic cluster filter
      if (selectedSemanticCluster.length > 0) {
        const semId = `SCL-${cluster.id.replace('C-', '')}`;
        if (!selectedSemanticCluster.includes(semId)) return false;
      }

      // Data filters (check representative report)
      const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
      const representativeReport = clusterReports[0];

      if (selectedSites.length > 0) {
        if (!representativeReport?.site || !selectedSites.includes(representativeReport.site)) return false;
      }

      if (selectedLokasi.length > 0) {
        if (!representativeReport?.lokasiArea || !selectedLokasi.includes(representativeReport.lokasiArea)) return false;
      }

      if (selectedKetidaksesuaian.length > 0) {
        if (!representativeReport?.ketidaksesuaian || !selectedKetidaksesuaian.includes(representativeReport.ketidaksesuaian)) return false;
      }

      if (selectedSubKetidaksesuaian.length > 0) {
        if (!representativeReport?.subKetidaksesuaian || !selectedSubKetidaksesuaian.includes(representativeReport.subKetidaksesuaian)) return false;
      }

      return true;
    });
  }, [clusters, searchTerm, selectedGeoCluster, selectedLexicalCluster, selectedSemanticCluster, selectedSites, selectedLokasi, selectedKetidaksesuaian, selectedSubKetidaksesuaian]);

  const handleViewDetail = (cluster: ClusterInfo) => {
    setViewingCluster(cluster);
  };

  const handleClosePanel = () => {
    setViewingCluster(null);
  };

  const handleViewReport = (report: HazardReport) => {
    setViewingCluster(null);
    onViewReport?.(report);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedGeoCluster([]);
    setSelectedLexicalCluster([]);
    setSelectedSemanticCluster([]);
    setSelectedSites([]);
    setSelectedLokasi([]);
    setSelectedKetidaksesuaian([]);
    setSelectedSubKetidaksesuaian([]);
  };

  const activeFilterCount = [
    selectedGeoCluster,
    selectedLexicalCluster,
    selectedSemanticCluster,
    selectedSites,
    selectedLokasi,
    selectedKetidaksesuaian,
    selectedSubKetidaksesuaian
  ].filter(arr => arr.length > 0).length;

  const toggleArrayItem = (arr: string[], item: string, setter: (arr: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari cluster, deskripsi, lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Cluster Type Filters (Hierarchical) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                Geo Cluster
                {selectedGeoCluster.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {selectedGeoCluster.length}
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-popover">
              <DropdownMenuLabel>Geo Cluster</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {geoClusterIds.map(id => (
                <DropdownMenuCheckboxItem
                  key={id}
                  checked={selectedGeoCluster.includes(id)}
                  onCheckedChange={() => toggleArrayItem(selectedGeoCluster, id, setSelectedGeoCluster)}
                >
                  {id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                Lexical Cluster
                {selectedLexicalCluster.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {selectedLexicalCluster.length}
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-popover">
              <DropdownMenuLabel>Lexical Cluster</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {lexicalClusterIds.map(id => (
                <DropdownMenuCheckboxItem
                  key={id}
                  checked={selectedLexicalCluster.includes(id)}
                  onCheckedChange={() => toggleArrayItem(selectedLexicalCluster, id, setSelectedLexicalCluster)}
                >
                  {id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                Semantic Cluster
                {selectedSemanticCluster.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {selectedSemanticCluster.length}
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-popover">
              <DropdownMenuLabel>Semantic Cluster</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {semanticClusterIds.map(id => (
                <DropdownMenuCheckboxItem
                  key={id}
                  checked={selectedSemanticCluster.includes(id)}
                  onCheckedChange={() => toggleArrayItem(selectedSemanticCluster, id, setSelectedSemanticCluster)}
                >
                  {id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* More Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter Lainnya
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-popover">
              {/* Site Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Site
                  {selectedSites.length > 0 && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {selectedSites.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-popover">
                    {siteOptions.map(site => (
                      <DropdownMenuCheckboxItem
                        key={site}
                        checked={selectedSites.includes(site)}
                        onCheckedChange={() => toggleArrayItem(selectedSites, site, setSelectedSites)}
                      >
                        {site}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Lokasi Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Lokasi
                  {selectedLokasi.length > 0 && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {selectedLokasi.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-popover max-h-60 overflow-y-auto">
                    {uniqueLokasiAreas.map(lokasi => (
                      <DropdownMenuCheckboxItem
                        key={lokasi}
                        checked={selectedLokasi.includes(lokasi)}
                        onCheckedChange={() => toggleArrayItem(selectedLokasi, lokasi, setSelectedLokasi)}
                      >
                        {lokasi}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* Ketidaksesuaian Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Ketidaksesuaian
                  {selectedKetidaksesuaian.length > 0 && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {selectedKetidaksesuaian.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-popover max-h-60 overflow-y-auto w-72">
                    {ketidaksesuaianData.map(item => (
                      <DropdownMenuCheckboxItem
                        key={item.ketidaksesuaian}
                        checked={selectedKetidaksesuaian.includes(item.ketidaksesuaian)}
                        onCheckedChange={() => toggleArrayItem(selectedKetidaksesuaian, item.ketidaksesuaian, setSelectedKetidaksesuaian)}
                        className="text-xs"
                      >
                        <span className="line-clamp-2">{item.ketidaksesuaian}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Sub Ketidaksesuaian Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Sub Ketidaksesuaian
                  {selectedSubKetidaksesuaian.length > 0 && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {selectedSubKetidaksesuaian.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-popover max-h-60 overflow-y-auto w-72">
                    {ketidaksesuaianData.flatMap(item => item.sub_ketidaksesuaian).map(sub => (
                      <DropdownMenuCheckboxItem
                        key={sub}
                        checked={selectedSubKetidaksesuaian.includes(sub)}
                        onCheckedChange={() => toggleArrayItem(selectedSubKetidaksesuaian, sub, setSelectedSubKetidaksesuaian)}
                        className="text-xs"
                      >
                        <span className="line-clamp-2">{sub}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {(searchTerm || activeFilterCount > 0) && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-1 text-muted-foreground">
              <X className="w-4 h-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedGeoCluster.map(id => (
              <Badge key={id} variant="secondary" className="gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <MapPin className="w-3 h-3" />
                {id}
                <button onClick={() => toggleArrayItem(selectedGeoCluster, id, setSelectedGeoCluster)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {selectedLexicalCluster.map(id => (
              <Badge key={id} variant="secondary" className="gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <FileText className="w-3 h-3" />
                {id}
                <button onClick={() => toggleArrayItem(selectedLexicalCluster, id, setSelectedLexicalCluster)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {selectedSemanticCluster.map(id => (
              <Badge key={id} variant="secondary" className="gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Layers className="w-3 h-3" />
                {id}
                <button onClick={() => toggleArrayItem(selectedSemanticCluster, id, setSelectedSemanticCluster)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {selectedSites.map(site => (
              <Badge key={site} variant="secondary" className="gap-1">
                {site}
                <button onClick={() => toggleArrayItem(selectedSites, site, setSelectedSites)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {selectedLokasi.map(lokasi => (
              <Badge key={lokasi} variant="secondary" className="gap-1">
                {lokasi}
                <button onClick={() => toggleArrayItem(selectedLokasi, lokasi, setSelectedLokasi)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {selectedKetidaksesuaian.map(k => (
              <Badge key={k} variant="secondary" className="gap-1 max-w-[200px]">
                <span className="truncate">{k}</span>
                <button onClick={() => toggleArrayItem(selectedKetidaksesuaian, k, setSelectedKetidaksesuaian)} className="ml-1 hover:text-destructive shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {selectedSubKetidaksesuaian.map(s => (
              <Badge key={s} variant="secondary" className="gap-1 max-w-[200px]">
                <span className="truncate">{s}</span>
                <button onClick={() => toggleArrayItem(selectedSubKetidaksesuaian, s, setSelectedSubKetidaksesuaian)} className="ml-1 hover:text-destructive shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Menampilkan {filteredClusters.length} dari {clusters.length} cluster
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClusters.map((cluster) => (
          <DuplicateClusterCard
            key={cluster.id}
            cluster={cluster}
            onViewDetail={handleViewDetail}
          />
        ))}
      </div>

      {filteredClusters.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Tidak ada cluster yang cocok dengan filter</p>
          <Button variant="link" onClick={clearAllFilters} className="mt-2">
            Reset semua filter
          </Button>
        </div>
      )}

      {viewingCluster && (
        <DuplicateClusterDetailPanel
          cluster={viewingCluster}
          onClose={handleClosePanel}
          onViewReport={handleViewReport}
        />
      )}
    </>
  );
};

export default DuplicateClusterGrid;
