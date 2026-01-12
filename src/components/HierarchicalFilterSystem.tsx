import { useState, useMemo, useCallback } from "react";
import { 
  MapPin, 
  FileText, 
  Layers, 
  X, 
  Search,
  ChevronDown,
  Building2,
  Navigation,
  Info,
  RotateCcw,
  Globe,
  Type,
  Brain
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { siteOptions, lokasiOptions, detailLokasiOptions } from "@/data/hazardReports";
import { cn } from "@/lib/utils";

// Filter State Model
export interface ClusterFilterState {
  geo: { enabled: boolean; mode: "same_area" | "nearby_area" };
  lexical: { enabled: boolean; threshold: number };
  semantic: { enabled: boolean; threshold: number };
}

export interface HierarchicalFilterState {
  site: string[];
  location: string[];
  detailLocation: string[];
  cluster: ClusterFilterState;
}

interface HierarchicalFilterSystemProps {
  filterState: HierarchicalFilterState;
  onFilterChange: (state: HierarchicalFilterState) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

// Initial filter state
export const initialFilterState: HierarchicalFilterState = {
  site: [],
  location: [],
  detailLocation: [],
  cluster: {
    geo: { enabled: false, mode: "same_area" },
    lexical: { enabled: false, threshold: 0.7 },
    semantic: { enabled: false, threshold: 0.8 }
  }
};

// Searchable Multi-Select Dropdown Component
const SearchableMultiSelect = ({
  label,
  icon: Icon,
  options,
  selected,
  onChange,
  disabled = false,
  disabledMessage,
  iconColor = "text-muted-foreground"
}: {
  label: string;
  icon: React.ElementType;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  disabledMessage?: string;
  iconColor?: string;
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const toggleItem = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter(s => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const content = (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 min-w-[140px] justify-between",
            disabled && "opacity-50 cursor-not-allowed",
            selected.length > 0 && "border-primary/50 bg-primary/5"
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", iconColor)} />
            <span className="text-sm">{label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {selected.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-primary/20 text-primary">
                {selected.length}
              </Badge>
            )}
            <ChevronDown className="w-3 h-3" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-0 bg-popover border shadow-lg z-50" 
        align="start"
        sideOffset={4}
      >
        {/* Search */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder={`Cari ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="px-2 py-1.5 border-b flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => onChange(filteredOptions)}
          >
            Pilih Semua
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 text-muted-foreground"
            onClick={() => onChange([])}
          >
            Hapus Semua
          </Button>
        </div>

        {/* Options */}
        <ScrollArea className="max-h-48">
          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Tidak ada opsi ditemukan
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleItem(option)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-left",
                    "hover:bg-muted/50 transition-colors",
                    selected.includes(option) && "bg-primary/10"
                  )}
                >
                  <Checkbox
                    checked={selected.includes(option)}
                    className="h-4 w-4"
                  />
                  <span className="truncate">{option}</span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );

  if (disabled && disabledMessage) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{content}</div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover border text-foreground">
            <p className="text-xs">{disabledMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

const HierarchicalFilterSystem = ({
  filterState,
  onFilterChange,
  searchTerm = "",
  onSearchChange
}: HierarchicalFilterSystemProps) => {
  
  // Check if cluster filters should be enabled
  const isClusterFiltersEnabled = filterState.site.length > 0 && 
    filterState.location.length > 0 && 
    filterState.detailLocation.length > 0;

  // Get available location options based on selected sites
  const availableLocations = useMemo(() => {
    if (filterState.site.length === 0) return [];
    const locations = new Set<string>();
    filterState.site.forEach(site => {
      const siteLocations = lokasiOptions[site] || [];
      siteLocations.forEach(loc => locations.add(loc));
    });
    return Array.from(locations);
  }, [filterState.site]);

  // Get available detail locations based on selected locations
  const availableDetailLocations = useMemo(() => {
    if (filterState.location.length === 0) return [];
    const details = new Set<string>();
    filterState.location.forEach(loc => {
      const locDetails = detailLokasiOptions[loc] || [];
      locDetails.forEach(det => details.add(det));
    });
    return Array.from(details);
  }, [filterState.location]);

  // Handlers
  const handleSiteChange = useCallback((sites: string[]) => {
    // Reset dependent filters when site changes
    onFilterChange({
      ...filterState,
      site: sites,
      location: [],
      detailLocation: [],
      cluster: initialFilterState.cluster
    });
  }, [filterState, onFilterChange]);

  const handleLocationChange = useCallback((locations: string[]) => {
    // Reset detail location and cluster filters when location changes
    onFilterChange({
      ...filterState,
      location: locations,
      detailLocation: [],
      cluster: initialFilterState.cluster
    });
  }, [filterState, onFilterChange]);

  const handleDetailLocationChange = useCallback((details: string[]) => {
    onFilterChange({
      ...filterState,
      detailLocation: details
    });
  }, [filterState, onFilterChange]);

  const handleClusterChange = useCallback((cluster: ClusterFilterState) => {
    onFilterChange({
      ...filterState,
      cluster
    });
  }, [filterState, onFilterChange]);

  const resetAllFilters = useCallback(() => {
    onFilterChange(initialFilterState);
    onSearchChange?.("");
  }, [onFilterChange, onSearchChange]);

  // Remove specific filter chip
  const removeSiteFilter = (site: string) => {
    const newSites = filterState.site.filter(s => s !== site);
    onFilterChange({
      ...filterState,
      site: newSites,
      location: newSites.length === 0 ? [] : filterState.location,
      detailLocation: newSites.length === 0 ? [] : filterState.detailLocation,
      cluster: newSites.length === 0 ? initialFilterState.cluster : filterState.cluster
    });
  };

  const removeLocationFilter = (loc: string) => {
    const newLocations = filterState.location.filter(l => l !== loc);
    onFilterChange({
      ...filterState,
      location: newLocations,
      detailLocation: newLocations.length === 0 ? [] : filterState.detailLocation,
      cluster: newLocations.length === 0 ? initialFilterState.cluster : filterState.cluster
    });
  };

  const removeDetailLocationFilter = (detail: string) => {
    const newDetails = filterState.detailLocation.filter(d => d !== detail);
    onFilterChange({
      ...filterState,
      detailLocation: newDetails,
      cluster: newDetails.length === 0 ? initialFilterState.cluster : filterState.cluster
    });
  };

  const removeGeoFilter = () => {
    handleClusterChange({
      ...filterState.cluster,
      geo: { enabled: false, mode: "same_area" }
    });
  };

  const removeLexicalFilter = () => {
    handleClusterChange({
      ...filterState.cluster,
      lexical: { enabled: false, threshold: 0.7 }
    });
  };

  const removeSemanticFilter = () => {
    handleClusterChange({
      ...filterState.cluster,
      semantic: { enabled: false, threshold: 0.8 }
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filterState.site.length > 0 || 
    filterState.location.length > 0 || 
    filterState.detailLocation.length > 0 ||
    filterState.cluster.geo.enabled ||
    filterState.cluster.lexical.enabled ||
    filterState.cluster.semantic.enabled ||
    searchTerm.length > 0;

  const disabledTooltip = "Pilih Site, Location, dan Detail Location terlebih dahulu";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {onSearchChange && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari cluster, deskripsi, lokasi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Filter Sections */}
      <div className="space-y-4">
        {/* Section 1: Physical Context */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>Konteks Fisik</span>
            <span className="text-xs text-muted-foreground/70">(Wajib dipilih urut)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Site Filter */}
            <SearchableMultiSelect
              label="Site"
              icon={Building2}
              options={siteOptions}
              selected={filterState.site}
              onChange={handleSiteChange}
              iconColor="text-blue-500"
            />

            {/* Location Filter */}
            <SearchableMultiSelect
              label="Location"
              icon={MapPin}
              options={availableLocations}
              selected={filterState.location}
              onChange={handleLocationChange}
              disabled={filterState.site.length === 0}
              disabledMessage="Pilih Site terlebih dahulu"
              iconColor="text-emerald-500"
            />

            {/* Detail Location Filter */}
            <SearchableMultiSelect
              label="Detail Location"
              icon={Navigation}
              options={availableDetailLocations}
              selected={filterState.detailLocation}
              onChange={handleDetailLocationChange}
              disabled={filterState.location.length === 0}
              disabledMessage="Pilih Location terlebih dahulu"
              iconColor="text-amber-500"
            />
          </div>
        </div>

        <Separator className="my-3" />

        {/* Section 2: AI Cluster Filters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Layers className="w-4 h-4" />
            <span>Filter AI Cluster</span>
            {!isClusterFiltersEnabled && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-amber-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover border text-foreground max-w-[200px]">
                    <p className="text-xs">{disabledTooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className={cn(
            "flex flex-wrap items-start gap-4 p-3 rounded-lg border",
            !isClusterFiltersEnabled && "opacity-50 bg-muted/30"
          )}>
            {/* Geo Cluster Filter */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "space-y-2 p-3 rounded-lg border min-w-[180px]",
                    filterState.cluster.geo.enabled && isClusterFiltersEnabled && "border-blue-500/50 bg-blue-500/5"
                  )}>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="geo-cluster"
                        checked={filterState.cluster.geo.enabled}
                        onCheckedChange={(checked) => {
                          if (!isClusterFiltersEnabled) return;
                          handleClusterChange({
                            ...filterState.cluster,
                            geo: { ...filterState.cluster.geo, enabled: !!checked }
                          });
                        }}
                        disabled={!isClusterFiltersEnabled}
                      />
                      <Label 
                        htmlFor="geo-cluster" 
                        className={cn(
                          "flex items-center gap-1.5 text-sm font-medium cursor-pointer",
                          !isClusterFiltersEnabled && "cursor-not-allowed"
                        )}
                      >
                        <Globe className="w-4 h-4 text-blue-500" />
                        Geo Cluster
                      </Label>
                    </div>
                    
                    {filterState.cluster.geo.enabled && isClusterFiltersEnabled && (
                      <div className="space-y-1.5 pl-6">
                        <button
                          onClick={() => handleClusterChange({
                            ...filterState.cluster,
                            geo: { ...filterState.cluster.geo, mode: "same_area" }
                          })}
                          className={cn(
                            "w-full text-left px-2 py-1 rounded text-xs",
                            filterState.cluster.geo.mode === "same_area" 
                              ? "bg-blue-500/20 text-blue-600" 
                              : "hover:bg-muted/50"
                          )}
                        >
                          Same Area (±50m)
                        </button>
                        <button
                          onClick={() => handleClusterChange({
                            ...filterState.cluster,
                            geo: { ...filterState.cluster.geo, mode: "nearby_area" }
                          })}
                          className={cn(
                            "w-full text-left px-2 py-1 rounded text-xs",
                            filterState.cluster.geo.mode === "nearby_area" 
                              ? "bg-blue-500/20 text-blue-600" 
                              : "hover:bg-muted/50"
                          )}
                        >
                          Nearby Area (50–200m)
                        </button>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                {!isClusterFiltersEnabled && (
                  <TooltipContent side="bottom" className="bg-popover border text-foreground">
                    <p className="text-xs">{disabledTooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* Lexical Cluster Filter */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "space-y-2 p-3 rounded-lg border min-w-[200px]",
                    filterState.cluster.lexical.enabled && isClusterFiltersEnabled && "border-orange-500/50 bg-orange-500/5"
                  )}>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="lexical-cluster"
                        checked={filterState.cluster.lexical.enabled}
                        onCheckedChange={(checked) => {
                          if (!isClusterFiltersEnabled) return;
                          handleClusterChange({
                            ...filterState.cluster,
                            lexical: { ...filterState.cluster.lexical, enabled: !!checked }
                          });
                        }}
                        disabled={!isClusterFiltersEnabled}
                      />
                      <Label 
                        htmlFor="lexical-cluster" 
                        className={cn(
                          "flex items-center gap-1.5 text-sm font-medium cursor-pointer",
                          !isClusterFiltersEnabled && "cursor-not-allowed"
                        )}
                      >
                        <Type className="w-4 h-4 text-orange-500" />
                        Lexical Cluster
                      </Label>
                    </div>
                    
                    {filterState.cluster.lexical.enabled && isClusterFiltersEnabled && (
                      <div className="space-y-2 pl-6">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Threshold:</span>
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                            ≥{filterState.cluster.lexical.threshold.toFixed(2)}
                          </Badge>
                        </div>
                        <Slider
                          value={[filterState.cluster.lexical.threshold]}
                          onValueChange={([value]) => handleClusterChange({
                            ...filterState.cluster,
                            lexical: { ...filterState.cluster.lexical, threshold: value }
                          })}
                          min={0.5}
                          max={1}
                          step={0.05}
                          className="w-full"
                        />
                        <div className="text-[10px] text-muted-foreground">
                          {filterState.cluster.lexical.threshold >= 0.85 
                            ? "High Similarity (≥0.85)" 
                            : "Medium Similarity (≥0.7)"}
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                {!isClusterFiltersEnabled && (
                  <TooltipContent side="bottom" className="bg-popover border text-foreground">
                    <p className="text-xs">{disabledTooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* Semantic Cluster Filter */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "space-y-2 p-3 rounded-lg border min-w-[200px]",
                    filterState.cluster.semantic.enabled && isClusterFiltersEnabled && "border-purple-500/50 bg-purple-500/5"
                  )}>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="semantic-cluster"
                        checked={filterState.cluster.semantic.enabled}
                        onCheckedChange={(checked) => {
                          if (!isClusterFiltersEnabled) return;
                          handleClusterChange({
                            ...filterState.cluster,
                            semantic: { ...filterState.cluster.semantic, enabled: !!checked }
                          });
                        }}
                        disabled={!isClusterFiltersEnabled}
                      />
                      <Label 
                        htmlFor="semantic-cluster" 
                        className={cn(
                          "flex items-center gap-1.5 text-sm font-medium cursor-pointer",
                          !isClusterFiltersEnabled && "cursor-not-allowed"
                        )}
                      >
                        <Brain className="w-4 h-4 text-purple-500" />
                        Semantic Cluster
                      </Label>
                    </div>
                    
                    {filterState.cluster.semantic.enabled && isClusterFiltersEnabled && (
                      <div className="space-y-2 pl-6">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Threshold:</span>
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                            ≥{filterState.cluster.semantic.threshold.toFixed(2)}
                          </Badge>
                        </div>
                        <Slider
                          value={[filterState.cluster.semantic.threshold]}
                          onValueChange={([value]) => handleClusterChange({
                            ...filterState.cluster,
                            semantic: { ...filterState.cluster.semantic, threshold: value }
                          })}
                          min={0.6}
                          max={1}
                          step={0.05}
                          className="w-full"
                        />
                        <div className="text-[10px] text-muted-foreground">
                          {filterState.cluster.semantic.threshold >= 0.9 
                            ? "High Confidence Duplicate (≥0.9)" 
                            : "Semantic Match"}
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                {!isClusterFiltersEnabled && (
                  <TooltipContent side="bottom" className="bg-popover border text-foreground">
                    <p className="text-xs">{disabledTooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Active Filter Chips - Sticky */}
      {hasActiveFilters && (
        <div className="sticky top-0 z-10 py-3 bg-background border-b -mx-4 px-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Filter Aktif:</span>
            
            {/* Site chips */}
            {filterState.site.map(site => (
              <Badge 
                key={`site-${site}`} 
                variant="secondary" 
                className="gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 pr-1"
              >
                <Building2 className="w-3 h-3" />
                Site: {site}
                <button 
                  onClick={() => removeSiteFilter(site)}
                  className="ml-1 p-0.5 hover:bg-blue-500/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            
            {/* Location chips */}
            {filterState.location.map(loc => (
              <Badge 
                key={`loc-${loc}`} 
                variant="secondary" 
                className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 pr-1"
              >
                <MapPin className="w-3 h-3" />
                Location: {loc}
                <button 
                  onClick={() => removeLocationFilter(loc)}
                  className="ml-1 p-0.5 hover:bg-emerald-500/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            
            {/* Detail Location chips */}
            {filterState.detailLocation.map(detail => (
              <Badge 
                key={`detail-${detail}`} 
                variant="secondary" 
                className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 pr-1"
              >
                <Navigation className="w-3 h-3" />
                Detail: {detail}
                <button 
                  onClick={() => removeDetailLocationFilter(detail)}
                  className="ml-1 p-0.5 hover:bg-amber-500/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            
            {/* Geo cluster chip */}
            {filterState.cluster.geo.enabled && (
              <Badge 
                variant="secondary" 
                className="gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 pr-1"
              >
                <Globe className="w-3 h-3" />
                Geo: {filterState.cluster.geo.mode === "same_area" ? "Same Area" : "Nearby Area"}
                <button 
                  onClick={removeGeoFilter}
                  className="ml-1 p-0.5 hover:bg-blue-500/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {/* Lexical cluster chip */}
            {filterState.cluster.lexical.enabled && (
              <Badge 
                variant="secondary" 
                className="gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 pr-1"
              >
                <Type className="w-3 h-3" />
                Lexical ≥{filterState.cluster.lexical.threshold.toFixed(2)}
                <button 
                  onClick={removeLexicalFilter}
                  className="ml-1 p-0.5 hover:bg-orange-500/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {/* Semantic cluster chip */}
            {filterState.cluster.semantic.enabled && (
              <Badge 
                variant="secondary" 
                className="gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 pr-1"
              >
                <Brain className="w-3 h-3" />
                Semantic ≥{filterState.cluster.semantic.threshold.toFixed(2)}
                <button 
                  onClick={removeSemanticFilter}
                  className="ml-1 p-0.5 hover:bg-purple-500/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {/* Reset All Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetAllFilters}
              className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchicalFilterSystem;
