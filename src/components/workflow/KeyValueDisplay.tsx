
import { Card, CardContent } from "@/components/ui/card";
import { DisplayValue } from "./DisplayValue";
import { useState, useEffect } from "react";

interface KeyValueDisplayProps {
  data: Record<string, any>;
  title?: string;
  isInput?: boolean;
  onChange?: (data: Record<string, any>) => void;
}

// Helper function to format key names (remove underscores and capitalize)
const formatKeyName = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const KeyValueDisplay = ({ data, title, isInput = false, onChange }: KeyValueDisplayProps) => {
  const [localData, setLocalData] = useState<Record<string, any>>(data || {});

  useEffect(() => {
    setLocalData(data || {});
  }, [data]);

  const handleValueChange = (key: string, value: any) => {
    const updatedData = { ...localData, [key]: value };
    setLocalData(updatedData);
    
    if (onChange) {
      onChange(updatedData);
    }
  };

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  // Special case: if there's only one key called "ret" or similar, just display the value
  const keys = Object.keys(data);
  if (keys.length === 1) {
    const singleKey = keys[0];
    const singleValue = data[singleKey];
    
    return (
      <Card>
        {title && (
          <div className="px-4 py-2 border-b bg-muted/50 font-medium text-sm">
            {title}
          </div>
        )}
        <CardContent className="p-4">
          <DisplayValue 
            value={singleValue} 
            isInput={isInput}
            onChange={(newValue) => handleValueChange(singleKey, newValue)}
            path={singleKey}
          />
        </CardContent>
      </Card>
    );
  }

  // Regular key-value display for multiple keys with vertical layout
  return (
    <Card>
      {title && (
        <div className="px-4 py-2 border-b bg-muted/50 font-medium text-sm">
          {title}
        </div>
      )}
      <CardContent className="p-4 space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <label className="font-medium text-sm text-muted-foreground block">
              {formatKeyName(key)}:
            </label>
            <div className="ml-0">
              <DisplayValue 
                value={value} 
                isInput={isInput}
                onChange={(newValue) => handleValueChange(key, newValue)}
                path={key}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
