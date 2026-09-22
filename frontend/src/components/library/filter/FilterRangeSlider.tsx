import React from 'react';

interface FilterRangeSliderProps {
  min: number;
  max: number;
  currentValue: number;
  onChange: (value: number) => void;
  formatValue: (value: number) => string;
  sliderClassName?: string;
}

export function FilterRangeSlider({
  min,
  max,
  currentValue,
  onChange,
  formatValue,
  sliderClassName = "filter-range-slider"
}: FilterRangeSliderProps) {
  return (
    <div className="px-1">
      <input
        type="range"
        min={min}
        max={max}
        value={currentValue}
        onChange={(e) => onChange(Number.parseInt(e.target.value))}
        className={`${sliderClassName} w-full h-2`}
      />
      <div className="flex justify-between mt-2">
        <span className="font-roboto text-xs text-text-secondary">{formatValue(min)}</span>
        <span className="font-roboto text-xs text-text-secondary">{formatValue(currentValue)}</span>
      </div>
    </div>
  );
}
