import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Globe2 } from "lucide-react";

interface FilterBarProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

export function FilterBar({ selectedRegion, onRegionChange }: FilterBarProps) {
  const regions = ["すべて", "アジア", "ヨーロッパ", "中東", "アメリカ", "アフリカ", "オセアニア"];

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2">
      <div className="flex items-center gap-2 text-gray-600">
        <Globe2 className="w-5 h-5" />
        <span className="text-sm whitespace-nowrap">地域:</span>
      </div>
      {regions.map((region) => (
        <Button
          key={region}
          variant={selectedRegion === region ? "default" : "outline"}
          size="sm"
          onClick={() => onRegionChange(region)}
          className="whitespace-nowrap"
        >
          {region}
        </Button>
      ))}
    </div>
  );
}
