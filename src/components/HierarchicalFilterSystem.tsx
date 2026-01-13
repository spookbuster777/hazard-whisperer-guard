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
  Brain
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

// Sidebar Multi-Select Dropdown Component
const SidebarMultiSelect = ({
  label,
  icon: Icon,
  options,
  selected,
  onChange,
  iconColor = "text-muted-foreground"
}: {
  label: string;
  icon: React.ElementType;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
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

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", iconColor)} />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {selected.length === 0 ? "Semua" : ""}
        </span>
      </div>

      {/* Dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between h-9 bg-background border-border hover:bg-muted/50"
          >
            <span className="text-sm text-muted-foreground truncate">
              {selected.length === 0 ? `Pilih ${label.toLowerCase()}...` : `${selected.length} dipilih`}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
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

      {/* Selected Items Display */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
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
          {selected.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-xs px-1.5 text-muted-foreground hover:text-destructive"
              onClick={clearAll}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Cluster Filter Dropdown Component
const ClusterFilterDropdown = ({
  label,
  icon: Icon,
  iconColor,
  borderColor,
  bgColor,
  enabled,
  onEnabledChange,
  children
}: {
  label: string;
  icon: React.ElementType;
  iconColor: string;
  borderColor: string;
  bgColor: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 h-9 px-3",
            enabled && `${borderColor} ${bgColor}`
          )}
        >
          <Icon className={cn("w-4 h-4", iconColor)} />
          <span className="text-sm font-medium">{label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3 bg-popover border shadow-lg z-50" 
        align="start"
        sideOffset={4}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${label}-enabled`}
              checked={enabled}
              onCheckedChange={(checked) => onEnabledChange(!!checked)}
            />
            <Label 
              htmlFor={`${label}-enabled`} 
              className="flex items-center gap-1.5 text-sm font-medium cursor-pointer"
            >
              <Icon className={cn("w-4 h-4", iconColor)} />
              Aktifkan {label}
            </Label>
          </div>
          
          {enabled && children}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const HierarchicalFilterSystem = ({
  filterState,
  onFilterChange,
  searchTerm = "",
  onSearchChange
}: HierarchicalFilterSystemProps) => {

  // Get available location options based on selected sites
  const availableLocations = useMemo(() => {
    if (filterState.site.length === 0) {
      // Return all locations when no site selected
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
      // Return all detail locations when no location selected
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

  // Handlers
  const handleSiteChange = useCallback((sites: string[]) => {
    // Reset dependent filters when site changes
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

  const handleClusterChange = useCallback((cluster: ClusterFilterState) => {
    onFilterChange({
      ...filterState,
      cluster
    });
  }, [filterState, onFilterChange]);

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Physical Context Filters */}
      <div className="w-64 shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Konteks Fisik</span>
          </div>
        </div>
        
        {/* Empty state info */}
        {filterState.site.length === 0 && filterState.location.length === 0 && filterState.detailLocation.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Kosong = Semua area
          </p>
        )}

        {/* Site Filter */}
        <SidebarMultiSelect
          label="Site"
          icon={Building2}
          options={siteOptions}
          selected={filterState.site}
          onChange={handleSiteChange}
          iconColor="text-blue-500"
        />

        {/* Location Filter */}
        <SidebarMultiSelect
          label="Location"
          icon={MapPin}
          options={availableLocations}
          selected={filterState.location}
          onChange={handleLocationChange}
          iconColor="text-emerald-500"
        />

        {/* Detail Location Filter */}
        <SidebarMultiSelect
          label="Detail Location"
          icon={Navigation}
          options={availableDetailLocations}
          selected={filterState.detailLocation}
          onChange={handleDetailLocationChange}
          iconColor="text-amber-500"
        />
      </div>

      {/* Right Content Area */}
      <div className="flex-1 space-y-4">
        {/* Top Filter Bar - Search + Cluster Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Bar */}
          {onSearchChange && (
            <div className="relative flex-1 min-w-[280px] max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari cluster, deskripsi, lokasi..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-9 bg-background"
              />
            </div>
          )}

          {/* Cluster Filter Dropdowns */}
          <ClusterFilterDropdown
            label="Geo Cluster"
            icon={Globe}
            iconColor="text-blue-500"
            borderColor="border-blue-500/50"
            bgColor="bg-blue-500/10"
            enabled={filterState.cluster.geo.enabled}
            onEnabledChange={(enabled) => handleClusterChange({
              ...filterState.cluster,
              geo: { ...filterState.cluster.geo, enabled }
            })}
          >
            <div className="space-y-1.5 pl-6">
              <button
                onClick={() => handleClusterChange({
                  ...filterState.cluster,
                  geo: { ...filterState.cluster.geo, mode: "same_area" }
                })}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded text-xs",
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
                  "w-full text-left px-2 py-1.5 rounded text-xs",
                  filterState.cluster.geo.mode === "nearby_area" 
                    ? "bg-blue-500/20 text-blue-600" 
                    : "hover:bg-muted/50"
                )}
              >
                Nearby Area (50–200m)
              </button>
            </div>
          </ClusterFilterDropdown>

          <ClusterFilterDropdown
            label="Lexical Cluster"
            icon={Type}
            iconColor="text-orange-500"
            borderColor="border-orange-500/50"
            bgColor="bg-orange-500/10"
            enabled={filterState.cluster.lexical.enabled}
            onEnabledChange={(enabled) => handleClusterChange({
              ...filterState.cluster,
              lexical: { ...filterState.cluster.lexical, enabled }
            })}
          >
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
          </ClusterFilterDropdown>

          <ClusterFilterDropdown
            label="Semantic Cluster"
            icon={Brain}
            iconColor="text-purple-500"
            borderColor="border-purple-500/50"
            bgColor="bg-purple-500/10"
            enabled={filterState.cluster.semantic.enabled}
            onEnabledChange={(enabled) => handleClusterChange({
              ...filterState.cluster,
              semantic: { ...filterState.cluster.semantic, enabled }
            })}
          >
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
          </ClusterFilterDropdown>
        </div>
      </div>
    </div>
  );
};

export default HierarchicalFilterSystem;
