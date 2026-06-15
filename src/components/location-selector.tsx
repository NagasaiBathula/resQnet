import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { INDIA_LOCATIONS } from "@/data/india-locations";
import { Label } from "@/components/ui/label";

export interface LocationSelectorProps {
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  disabled?: boolean;
  stateLabel?: string;
  districtLabel?: string;
}

export function LocationSelector({
  selectedState,
  onStateChange,
  selectedDistrict,
  onDistrictChange,
  disabled = false,
  stateLabel = "State",
  districtLabel = "District",
}: LocationSelectorProps) {
  const [stateOpen, setStateOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);

  // Update district options when selected state changes
  useEffect(() => {
    if (selectedState) {
      const stateObj = INDIA_LOCATIONS.find(
        (loc) => loc.state.toLowerCase() === selectedState.toLowerCase()
      );
      setDistricts(stateObj ? stateObj.districts : []);
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  const handleStateSelect = (stateVal: string) => {
    onStateChange(stateVal);
    onDistrictChange(""); // Reset district when state changes
    setStateOpen(false);
  };

  const handleDistrictSelect = (districtVal: string) => {
    onDistrictChange(districtVal);
    setDistrictOpen(false);
  };

  const clearState = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStateChange("");
    onDistrictChange("");
    setStateOpen(false);
  };

  const clearDistrict = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDistrictChange("");
    setDistrictOpen(false);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* State Selection */}
      <div className="space-y-1.5 flex flex-col">
        <Label className="text-xs font-semibold text-muted-foreground">{stateLabel}</Label>
        <Popover open={stateOpen} onOpenChange={setStateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={stateOpen}
              disabled={disabled}
              className={cn(
                "h-11 justify-between text-left font-normal rounded-xl bg-card border-border/80 shadow-elegant px-3.5",
                !selectedState && "text-muted-foreground"
              )}
            >
              <span className="truncate">
                {selectedState
                  ? INDIA_LOCATIONS.find((loc) => loc.state.toLowerCase() === selectedState.toLowerCase())?.state || selectedState
                  : "Select state..."}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {selectedState && !disabled && (
                  <X className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" onClick={clearState} />
                )}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 rounded-xl glass-strong border shadow-elegant" align="start">
            <Command>
              <CommandInput placeholder="Search state..." className="h-9" />
              <CommandList>
                <CommandEmpty>No state found.</CommandEmpty>
                <CommandGroup>
                  {INDIA_LOCATIONS.map((loc) => (
                    <CommandItem
                      key={loc.state}
                      value={loc.state}
                      onSelect={() => handleStateSelect(loc.state)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedState.toLowerCase() === loc.state.toLowerCase() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {loc.state}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* District Selection */}
      <div className="space-y-1.5 flex flex-col">
        <Label className="text-xs font-semibold text-muted-foreground">{districtLabel}</Label>
        <Popover open={districtOpen} onOpenChange={setDistrictOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={districtOpen}
              disabled={disabled || !selectedState}
              className={cn(
                "h-11 justify-between text-left font-normal rounded-xl bg-card border-border/80 shadow-elegant px-3.5",
                !selectedDistrict && "text-muted-foreground",
                !selectedState && "opacity-60 cursor-not-allowed bg-muted/20"
              )}
            >
              <span className="truncate">
                {selectedDistrict ? selectedDistrict : "Select district..."}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {selectedDistrict && !disabled && (
                  <X className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" onClick={clearDistrict} />
                )}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 rounded-xl glass-strong border shadow-elegant" align="start">
            <Command>
              <CommandInput placeholder="Search district..." className="h-9" />
              <CommandList>
                <CommandEmpty>No district found.</CommandEmpty>
                <CommandGroup>
                  {districts.map((d) => (
                    <CommandItem
                      key={d}
                      value={d}
                      onSelect={() => handleDistrictSelect(d)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedDistrict.toLowerCase() === d.toLowerCase() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {d}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
