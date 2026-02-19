"use client";

import { useState, useMemo, useEffect } from "react";
import Spreadsheet from "react-spreadsheet";
import type { Matrix, CellBase } from "react-spreadsheet";
import { generateColumnLabels, generateRowLabels } from "./SpreadsheetHelpers";

export interface SpreadsheetCell extends CellBase {
  value: string | number;
  readOnly?: boolean;
  className?: string;
}

export type SpreadsheetData = Matrix<SpreadsheetCell>;

export interface SpreadsheetWrapperProps {
  initialData?: SpreadsheetData;
  columnLabels?: string[];
  rowLabels?: string[];
  onChange?: (data: SpreadsheetData) => void;
  readOnly?: boolean;
  className?: string;
  showColumnLabels?: boolean;
  showRowLabels?: boolean;
}

export const SpreadsheetWrapper = ({
  initialData = [
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
  ],
  columnLabels,
  rowLabels,
  onChange,
  readOnly = false,
  className = "",
  showColumnLabels = true,
  showRowLabels = true,
}: SpreadsheetWrapperProps) => {
  const [data, setData] = useState<SpreadsheetData>(initialData);

  // Sync internal data when initialData changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Generate standard Excel-like labels if not provided
  const finalColumnLabels = useMemo(() => {
    if (!showColumnLabels) return [];
    if (columnLabels) return columnLabels;
    const maxCols = Math.max(...data.map(row => row.length), 10);
    return generateColumnLabels(maxCols);
  }, [columnLabels, data, showColumnLabels]);

  const finalRowLabels = useMemo(() => {
    if (!showRowLabels) return [];
    if (rowLabels) return rowLabels;
    return generateRowLabels(Math.max(data.length, 10));
  }, [rowLabels, data.length, showRowLabels]);

  const handleChange = (newData: SpreadsheetData) => {
    if (!readOnly) {
      setData(newData);
      onChange?.(newData);
    }
  };

  return (
    <div className={`spreadsheet-wrapper ${className}`}>
      <Spreadsheet
        data={data}
        onChange={readOnly ? undefined : handleChange}
        columnLabels={finalColumnLabels}
        rowLabels={finalRowLabels}
        darkMode={false}
      />
    </div>
  );
};

export default SpreadsheetWrapper;
