import { useState, useMemo, useCallback } from "react";
import { 
  MapPin, 
  X, 
  Search,
  ChevronDown,
  Building2,
  Navigation,
  Globe,
  Type,
  Brain,
  Filter,
  RotateCcw
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

// Physical Context Multi-Select Dropdown
const ContextMultiSelect = ({
  label,
  icon: Icon,
  iconColor,
  options,
  selected,
  onChange,
  disabled = false,
  disabledMessage = ""
}: {
  label: string;
  icon: React.ElementType;
  iconColor: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  disabledMessage?: string;
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

  const displayText = selected.length === 0 
    ? "All" 
    : selected.length === 1 
      ? selected[0] 
      : `${selected.length} selected`;

  const buttonContent = (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      className={cn(
        "w-full justify-between h-9 bg-background border-border",
        !disabled && "hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        selected.length > 0 && !disabled && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", disabled ? "text-muted-foreground" : iconColor)} />
        <span className="text-sm truncate max-w-[120px]">{displayText}</span>
      </div>
      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
    </Button>
  );

  if (disabled) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
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
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
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
                placeholder={`Search ${label.toLowerCase()}...`}
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

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selected.map(item => (
            <Badge 
              key={item} 
              variant="secondary" 
              className="gap-1 text-xs bg-muted/50 text-foreground pr-1"
            >
              {item}
              <button 
                onClick={() => toggleItem(item)}
                className="ml-0.5 p-0.5 hover:bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// Active Filter Summary Component
const ActiveFilterSummary = ({
  filterState,
  onClearAll
}: {
  filterState: HierarchicalFilterState;
  onClearAll: () => void;
}) => {
  const hasActiveFilters = 
    filterState.cluster.geo.codes.length > 0 ||
    filterState.cluster.lexical.codes.length > 0 ||
    filterState.cluster.semantic.codes.length > 0 ||
    filterState.site.length > 0 ||
    filterState.location.length > 0 ||
    filterState.detailLocation.length > 0;

  if (!hasActiveFilters) return null;

  const FilterTag = ({ label, values, colorClass }: { label: string; values: string[]; colorClass: string }) => {
    if (values.length === 0) return null;
    return (
      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm", colorClass)}>
        <span className="font-medium opacity-70">{label}:</span>
        <span className="font-semibold">{values.length > 2 ? `${values.slice(0, 2).join(", ")}...` : values.join(", ")}</span>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Filter className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Active Filters</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs font-medium border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
          onClick={onClearAll}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Clear All
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Physical Context Filters - Displayed first */}
        <FilterTag 
          label="Site" 
          values={filterState.site} 
          colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
        />
        <FilterTag 
          label="Location" 
          values={filterState.location} 
          colorClass="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
        />
        <FilterTag 
          label="Detail" 
          values={filterState.detailLocation} 
          colorClass="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
        />
        
        {/* Cluster Filters - Displayed after physical context */}
        <FilterTag 
          label="Geo" 
          values={filterState.cluster.geo.codes} 
          colorClass="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300"
        />
        <FilterTag 
          label="Lexical" 
          values={filterState.cluster.lexical.codes} 
          colorClass="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
        />
        <FilterTag 
          label="Semantic" 
          values={filterState.cluster.semantic.codes} 
          colorClass="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
        />
      </div>
    </div>
  );
};

const HierarchicalFilterSystem = ({
  filterState,
  onFilterChange,
  searchTerm = "",
  onSearchChange,
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

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Physical Context Filters Panel */}
      <div className="w-60 shrink-0">
        <div className="bg-card border border-border rounded-lg p-4 space-y-4 sticky top-4">
          {/* Panel Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Physical Context</span>
          </div>
          
          {/* Empty state info */}
          {filterState.site.length === 0 && filterState.location.length === 0 && filterState.detailLocation.length === 0 && (
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              Empty = All areas selected
            </p>
          )}

          {/* Site Filter */}
          <ContextMultiSelect
            label="Site"
            icon={Building2}
            iconColor="text-blue-500"
            options={siteOptions}
            selected={filterState.site}
            onChange={handleSiteChange}
          />

          {/* Location Filter */}
          <ContextMultiSelect
            label="Location"
            icon={MapPin}
            iconColor="text-emerald-500"
            options={availableLocations}
            selected={filterState.location}
            onChange={handleLocationChange}
            disabled={isLocationDisabled}
            disabledMessage="Select Site first"
          />

          {/* Detail Location Filter */}
          <ContextMultiSelect
            label="Detail Location"
            icon={Navigation}
            iconColor="text-amber-500"
            options={availableDetailLocations}
            selected={filterState.detailLocation}
            onChange={handleDetailLocationChange}
            disabled={isDetailLocationDisabled}
            disabledMessage="Select Location first"
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
