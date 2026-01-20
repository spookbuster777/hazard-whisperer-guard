import { useState, useMemo, useCallback } from "react";
import { 
  MapPin, 
  X, 
  Search,
  ChevronDown,
  Map,
  Navigation,
  Globe,
  Type,
  Brain,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { siteOptions, lokasiOptions, detailLokasiOptions } from "@/data/hazardReports";
import { cn } from "@/lib/utils";

// Filter State Model
export interface ClusterFilterState {
  geo: { enabled: boolean; codes: string[] };
  lexical: { enabled: boolean; codes: string[] };
  semantic: { enabled: boolean; codes: string[] };
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
  similarityRange?: [number, number];
  onSimilarityRangeChange?: (range: [number, number]) => void;
  children?: React.ReactNode;
}

// Initial filter state
export const initialFilterState: HierarchicalFilterState = {
  site: [],
  location: [],
  detailLocation: [],
  cluster: {
    geo: { enabled: false, codes: [] },
    lexical: { enabled: false, codes: [] },
    semantic: { enabled: false, codes: [] }
  }
};

// Cluster code options (hierarchical)
const geoClusterOptions = ["GCL-001", "GCL-002", "GCL-003", "GCL-004", "GCL-005", "GCL-006"];

// Lexical clusters available for each geo cluster
const lexicalClustersByGeo: Record<string, string[]> = {
  "GCL-001": ["LCL-001", "LCL-002", "LCL-003"],
  "GCL-002": ["LCL-004", "LCL-005"],
  "GCL-003": ["LCL-006", "LCL-007", "LCL-008"],
  "GCL-004": ["LCL-009", "LCL-010"],
  "GCL-005": ["LCL-011", "LCL-012", "LCL-013"],
  "GCL-006": ["LCL-014", "LCL-015"],
};

// Semantic clusters available for each lexical cluster
const semanticClustersByLexical: Record<string, string[]> = {
  "LCL-001": ["SCL-001", "SCL-002"],
  "LCL-002": ["SCL-003"],
  "LCL-003": ["SCL-004", "SCL-005"],
  "LCL-004": ["SCL-006", "SCL-007"],
  "LCL-005": ["SCL-008"],
  "LCL-006": ["SCL-009", "SCL-010"],
  "LCL-007": ["SCL-011"],
  "LCL-008": ["SCL-012", "SCL-013"],
  "LCL-009": ["SCL-014"],
  "LCL-010": ["SCL-015", "SCL-016"],
  "LCL-011": ["SCL-017"],
  "LCL-012": ["SCL-018", "SCL-019"],
  "LCL-013": ["SCL-020"],
  "LCL-014": ["SCL-021", "SCL-022"],
  "LCL-015": ["SCL-023"],
};

// Hierarchical Multi-Select Dropdown Component
const HierarchicalMultiSelect = ({
  label,
  icon: Icon,
  iconColor,
  borderColor,
  bgColor,
  options,
  selected,
  onChange,
  disabled = false,
  disabledMessage = "",
  placeholder
}: {
  label: string;
  icon: React.ElementType;
  iconColor: string;
  borderColor: string;
  bgColor: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  disabledMessage?: string;
  placeholder?: string;
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

  const isActive = selected.length > 0;

  const buttonContent = (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      className={cn(
        "gap-2 h-9 px-3 min-w-[160px]",
        isActive && !disabled && `${borderColor} ${bgColor}`,
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon className={cn("w-4 h-4", disabled ? "text-muted-foreground" : iconColor)} />
      <span className="text-sm font-medium">{label}</span>
      {selected.length > 0 && (
        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
          {selected.length}
        </Badge>
      )}
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
    </Button>
  );

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{disabledMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {buttonContent}
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
              placeholder={placeholder || `Search ${label.toLowerCase()}...`}
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
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 text-muted-foreground"
            onClick={() => onChange([])}
          >
            Clear All
          </Button>
        </div>

        {/* Options */}
        <ScrollArea className="max-h-48">
          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleItem(option)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-left",
                    "hover:bg-muted/50 transition-colors",
                    selected.includes(option) && `${bgColor}`
                  )}
                >
                  <Checkbox
                    checked={selected.includes(option)}
                    className="h-4 w-4"
                  />
                  <span className="truncate font-mono">{option}</span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="p-2 border-t bg-muted/30">
            <div className="flex flex-wrap gap-1">
              {selected.slice(0, 3).map(item => (
                <Badge 
                  key={item} 
                  variant="secondary" 
                  className="gap-1 text-xs font-mono pr-1"
                >
                  {item}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItem(item);
                    }}
                    className="ml-0.5 p-0.5 hover:bg-muted rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selected.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{selected.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// Physical Context Multi-Select Dropdown (Improved UI like reference)
const ContextMultiSelect = ({
  label,
  icon: Icon,
  options,
  selected,
  onChange,
  disabled = false,
  disabledMessage = "",
  placeholder = "Tambah..."
}: {
  label: string;
  icon: React.ElementType;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  disabledMessage?: string;
  placeholder?: string;
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase()) && !selected.includes(opt)
  );

  const toggleItem = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter(s => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const clearAll = () => onChange([]);

  if (disabled) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Input
                  placeholder={placeholder}
                  disabled
                  className="h-9 text-sm bg-muted/30 border-dashed cursor-not-allowed"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-sm">{disabledMessage}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Label with Clear All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
          {selected.length > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-primary/10 text-primary">
              {selected.length}
            </Badge>
          )}
        </div>
        {selected.length > 0 && (
          <button 
            onClick={clearAll}
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Selected chips - displayed above input */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(item => (
            <Badge 
              key={item} 
              variant="secondary" 
              className="gap-1 text-xs bg-primary/10 text-primary border border-primary/20 pr-1 font-normal"
            >
              {item}
              <button 
                onClick={() => toggleItem(item)}
                className="ml-0.5 p-0.5 hover:bg-primary/20 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search/Add Input with Popover - dropdown appears below */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative cursor-pointer">
            <Input
              placeholder={placeholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!open) setOpen(true);
              }}
              onClick={() => setOpen(true)}
              className="h-9 text-sm bg-background border-border hover:border-primary/50 transition-colors"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border shadow-lg z-50" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          {/* Search inside dropdown */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder={`Cari ${label.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
                autoFocus
              />
            </div>
          </div>
          
          {/* Options */}
          <ScrollArea className="max-h-48">
            <div className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {search ? "Tidak ditemukan" : "Semua opsi terpilih"}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      toggleItem(option);
                      setSearch("");
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-left",
                      "hover:bg-muted/50 transition-colors"
                    )}
                  >
                    <Checkbox
                      checked={false}
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
    </div>
  );
};

// Active Filter Summary Component - Only shows Cluster filters with compact badges
const ActiveFilterSummary = ({
  filterState,
  onClearAll
}: {
  filterState: HierarchicalFilterState;
  onClearAll: () => void;
}) => {
  // Only show if cluster filters are active
  const hasActiveClusterFilters = 
    filterState.cluster.geo.codes.length > 0 ||
    filterState.cluster.lexical.codes.length > 0 ||
    filterState.cluster.semantic.codes.length > 0;

  if (!hasActiveClusterFilters) return null;

  const allClusterCodes = [
    ...filterState.cluster.geo.codes,
    ...filterState.cluster.lexical.codes,
    ...filterState.cluster.semantic.codes
  ];

  const getClusterBadgeStyle = (code: string) => {
    if (code.startsWith("GCL")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    if (code.startsWith("LCL")) return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30";
    if (code.startsWith("SCL")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex flex-wrap gap-1.5">
        {allClusterCodes.map(code => (
          <Badge 
            key={code} 
            variant="outline"
            className={cn("text-xs font-mono", getClusterBadgeStyle(code))}
          >
            {code}
          </Badge>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
        onClick={onClearAll}
      >
        <RotateCcw className="w-3 h-3 mr-1" />
        Reset
      </Button>
    </div>
  );
};

const HierarchicalFilterSystem = ({
  filterState,
  onFilterChange,
  searchTerm = "",
  onSearchChange,
  similarityRange = [0, 100],
  onSimilarityRangeChange,
  children
}: HierarchicalFilterSystemProps) => {

  // Get available lexical options based on selected geo clusters
  const availableLexicalOptions = useMemo(() => {
    if (filterState.cluster.geo.codes.length === 0) return [];
    const lexicals = new Set<string>();
    filterState.cluster.geo.codes.forEach(geo => {
      const geoLexicals = lexicalClustersByGeo[geo] || [];
      geoLexicals.forEach(lex => lexicals.add(lex));
    });
    return Array.from(lexicals).sort();
  }, [filterState.cluster.geo.codes]);

  // Get available semantic options based on selected lexical clusters
  const availableSemanticOptions = useMemo(() => {
    if (filterState.cluster.lexical.codes.length === 0) return [];
    const semantics = new Set<string>();
    filterState.cluster.lexical.codes.forEach(lex => {
      const lexSemantics = semanticClustersByLexical[lex] || [];
      lexSemantics.forEach(sem => semantics.add(sem));
    });
    return Array.from(semantics).sort();
  }, [filterState.cluster.lexical.codes]);

  // Get available location options based on selected sites
  const availableLocations = useMemo(() => {
    if (filterState.site.length === 0) {
      const allLocations = new Set<string>();
      Object.values(lokasiOptions).forEach(locs => {
        locs.forEach(loc => allLocations.add(loc));
      });
      return Array.from(allLocations);
    }
    const locations = new Set<string>();
    filterState.site.forEach(site => {
      const siteLocations = lokasiOptions[site] || [];
      siteLocations.forEach(loc => locations.add(loc));
    });
    return Array.from(locations);
  }, [filterState.site]);

  // Get available detail locations based on selected locations
  const availableDetailLocations = useMemo(() => {
    if (filterState.location.length === 0) {
      const allDetails = new Set<string>();
      Object.values(detailLokasiOptions).forEach(details => {
        details.forEach(det => allDetails.add(det));
      });
      return Array.from(allDetails);
    }
    const details = new Set<string>();
    filterState.location.forEach(loc => {
      const locDetails = detailLokasiOptions[loc] || [];
      locDetails.forEach(det => details.add(det));
    });
    return Array.from(details);
  }, [filterState.location]);

  // Handlers - Cluster Filters with hierarchical clearing
  const handleGeoChange = useCallback((codes: string[]) => {
    // Clear lexical and semantic when geo changes
    onFilterChange({
      ...filterState,
      cluster: {
        geo: { enabled: codes.length > 0, codes },
        lexical: { enabled: false, codes: [] },
        semantic: { enabled: false, codes: [] }
      }
    });
  }, [filterState, onFilterChange]);

  const handleLexicalChange = useCallback((codes: string[]) => {
    // Clear semantic when lexical changes
    onFilterChange({
      ...filterState,
      cluster: {
        ...filterState.cluster,
        lexical: { enabled: codes.length > 0, codes },
        semantic: { enabled: false, codes: [] }
      }
    });
  }, [filterState, onFilterChange]);

  const handleSemanticChange = useCallback((codes: string[]) => {
    onFilterChange({
      ...filterState,
      cluster: {
        ...filterState.cluster,
        semantic: { enabled: codes.length > 0, codes }
      }
    });
  }, [filterState, onFilterChange]);

  // Handlers - Physical Context Filters with hierarchical clearing
  const handleSiteChange = useCallback((sites: string[]) => {
    onFilterChange({
      ...filterState,
      site: sites,
      location: [],
      detailLocation: []
    });
  }, [filterState, onFilterChange]);

  const handleLocationChange = useCallback((locations: string[]) => {
    onFilterChange({
      ...filterState,
      location: locations,
      detailLocation: []
    });
  }, [filterState, onFilterChange]);

  const handleDetailLocationChange = useCallback((details: string[]) => {
    onFilterChange({
      ...filterState,
      detailLocation: details
    });
  }, [filterState, onFilterChange]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    onFilterChange(initialFilterState);
    if (onSearchChange) onSearchChange("");
  }, [onFilterChange, onSearchChange]);

  const isLexicalDisabled = filterState.cluster.geo.codes.length === 0;
  const isSemanticDisabled = filterState.cluster.lexical.codes.length === 0;
  const isLocationDisabled = filterState.site.length === 0;
  const isDetailLocationDisabled = filterState.location.length === 0;

  const isSemanticActive = filterState.cluster.semantic.codes.length > 0;

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Location Filters Panel */}
      <div className="w-64 shrink-0">
        <div className="bg-card border border-border rounded-xl p-5 space-y-5 sticky top-4 shadow-sm">
          {/* Panel Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Map className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Lokasi</span>
              <p className="text-xs text-muted-foreground">Kosong = Semua area</p>
            </div>
          </div>

          {/* Site Filter */}
          <ContextMultiSelect
            label="Site"
            icon={MapPin}
            options={siteOptions}
            selected={filterState.site}
            onChange={handleSiteChange}
            placeholder="Tambah site..."
          />

          {/* Location Filter */}
          <ContextMultiSelect
            label="Location"
            icon={MapPin}
            options={availableLocations}
            selected={filterState.location}
            onChange={handleLocationChange}
            disabled={isLocationDisabled}
            disabledMessage="Pilih Site terlebih dahulu"
            placeholder="Tambah location..."
          />

          {/* Detail Location Filter */}
          <ContextMultiSelect
            label="Detail Location"
            icon={Navigation}
            options={availableDetailLocations}
            selected={filterState.detailLocation}
            onChange={handleDetailLocationChange}
            disabled={isDetailLocationDisabled}
            disabledMessage="Pilih Location terlebih dahulu"
            placeholder="Tambah detail..."
          />
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 space-y-4">
        {/* Top Filter Bar - Search + Cluster Filters */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Bar */}
            {onSearchChange && (
              <div className="relative flex-1 min-w-[280px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search clusters, descriptions, locations..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 h-9 bg-background"
                />
              </div>
            )}

            <div className="h-8 w-px bg-border mx-1" />

            {/* Cluster Filter Multi-Select Dropdowns - Hierarchical */}
            <HierarchicalMultiSelect
              label="Geo Cluster"
              icon={Globe}
              iconColor="text-blue-500"
              borderColor="border-blue-500/50"
              bgColor="bg-blue-500/10"
              options={geoClusterOptions}
              selected={filterState.cluster.geo.codes}
              onChange={handleGeoChange}
              placeholder="Select geo cluster..."
            />

            <HierarchicalMultiSelect
              label="Lexical Cluster"
              icon={Type}
              iconColor="text-orange-500"
              borderColor="border-orange-500/50"
              bgColor="bg-orange-500/10"
              options={availableLexicalOptions}
              selected={filterState.cluster.lexical.codes}
              onChange={handleLexicalChange}
              disabled={isLexicalDisabled}
              disabledMessage="Select Geo Cluster first"
              placeholder="Select lexical cluster..."
            />

            <HierarchicalMultiSelect
              label="Semantic Cluster"
              icon={Brain}
              iconColor="text-purple-500"
              borderColor="border-purple-500/50"
              bgColor="bg-purple-500/10"
              options={availableSemanticOptions}
              selected={filterState.cluster.semantic.codes}
              onChange={handleSemanticChange}
              disabled={isSemanticDisabled}
              disabledMessage="Select Lexical Cluster first"
              placeholder="Select semantic cluster..."
            />

            {/* Similarity Range Slider - Only active when Semantic Cluster is selected */}
            {onSimilarityRangeChange && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!isSemanticActive}
                            className={cn(
                              "gap-2 h-9 px-3 min-w-[140px]",
                              !isSemanticActive && "opacity-50 cursor-not-allowed",
                              isSemanticActive && (similarityRange[0] > 0 || similarityRange[1] < 100) && "border-primary/50 bg-primary/10"
                            )}
                          >
                            <SlidersHorizontal className={cn("w-4 h-4", isSemanticActive ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-sm font-medium">Similarity</span>
                            {isSemanticActive && (similarityRange[0] > 0 || similarityRange[1] < 100) && (
                              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                {similarityRange[0]}-{similarityRange[1]}%
                              </Badge>
                            )}
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-72 p-4 bg-popover border shadow-lg z-50" 
                          align="start"
                          sideOffset={4}
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">Similarity Range</span>
                              <span className="text-sm text-muted-foreground font-mono">
                                {similarityRange[0]}% - {similarityRange[1]}%
                              </span>
                            </div>
                            <Slider
                              value={similarityRange}
                              onValueChange={(val) => onSimilarityRangeChange(val as [number, number])}
                              min={0}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => onSimilarityRangeChange([0, 100])}
                            >
                              Reset to All
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </span>
                  </TooltipTrigger>
                  {!isSemanticActive && (
                    <TooltipContent>
                      <p className="text-sm">Pilih Semantic Cluster terlebih dahulu</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Active Filter Summary */}
        <ActiveFilterSummary 
          filterState={filterState} 
          onClearAll={handleClearAll}
        />

        {/* Cards Grid (passed as children) */}
        {children}
      </div>
    </div>
  );
};

export default HierarchicalFilterSystem;
