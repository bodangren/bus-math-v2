import type { SpreadsheetData, SpreadsheetCell } from "./SpreadsheetWrapper";

// Formula validation helper
export const validateFormula = (formula: string): { isValid: boolean; error?: string } => {
  if (!formula.startsWith("=")) {
    return { isValid: false, error: "Formula must start with =" };
  }

  // Basic validation for common Excel functions
  const allowedFunctions = [
    "SUM", "AVERAGE", "MIN", "MAX", "COUNT", "IF", "ROUND",
    "ABS", "SQRT", "POWER", "LOG", "EXP"
  ];

  const functionPattern = /([A-Z]+)\(/g;
  const matches = formula.match(functionPattern);

  if (matches) {
    for (const match of matches) {
      const functionName = match.slice(0, -1); // Remove the opening parenthesis
      if (!allowedFunctions.includes(functionName)) {
        return { 
          isValid: false, 
          error: `Function ${functionName} is not allowed or supported` 
        };
      }
    }
  }

  // Check for balanced parentheses
  let openParens = 0;
  for (const char of formula) {
    if (char === "(") openParens++;
    if (char === ")") openParens--;
    if (openParens < 0) {
      return { isValid: false, error: "Unbalanced parentheses" };
    }
  }

  if (openParens !== 0) {
    return { isValid: false, error: "Unbalanced parentheses" };
  }

  return { isValid: true };
};

// Cell reference validation
export const validateCellReference = (reference: string): boolean => {
  const cellPattern = /^[A-Z]+[0-9]+$/;
  const rangePattern = /^[A-Z]+[0-9]+:[A-Z]+[0-9]+$/;
  
  return cellPattern.test(reference) || rangePattern.test(reference);
};

// Convert cell coordinates to A1 notation
export const coordinatesToA1 = (row: number, col: number): string => {
  let colString = "";
  let colNum = col;
  
  while (colNum >= 0) {
    colString = String.fromCharCode(65 + (colNum % 26)) + colString;
    colNum = Math.floor(colNum / 26) - 1;
  }
  
  return colString + (row + 1);
};

// Convert A1 notation to coordinates
export const a1ToCoordinates = (a1: string): { row: number; col: number } => {
  const match = a1.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) throw new Error("Invalid A1 notation");
  
  const colString = match[1];
  const rowString = match[2];
  
  let col = 0;
  for (let i = 0; i < colString.length; i++) {
    col = col * 26 + (colString.charCodeAt(i) - 64);
  }
  col -= 1; // Convert to 0-based
  
  const row = parseInt(rowString) - 1; // Convert to 0-based
  
  return { row, col };
};

// Create empty spreadsheet data
export const createEmptySpreadsheet = (rows: number, cols: number): SpreadsheetData => {
  const data: SpreadsheetData = [];
  
  for (let r = 0; r < rows; r++) {
    const row: SpreadsheetCell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({ value: "" });
    }
    data.push(row);
  }
  
  return data;
};

// Set cell value at specific coordinates
export const setCellValue = (
  data: SpreadsheetData,
  row: number,
  col: number,
  value: string | number,
  readOnly = false
): SpreadsheetData => {
  const newData = [...data];
  
  // Ensure the row exists
  while (newData.length <= row) {
    newData.push([]);
  }
  
  // Ensure the column exists in this row
  while (newData[row].length <= col) {
    newData[row].push({ value: "" });
  }
  
  newData[row][col] = { value, readOnly };
  
  return newData;
};

// Get cell value at specific coordinates
export const getCellValue = (
  data: SpreadsheetData,
  row: number,
  col: number
): string | number | undefined => {
  if (row >= data.length || row < 0) return undefined;
  if (col >= data[row].length || col < 0) return undefined;
  
  return data[row][col]?.value;
};

// Extract numeric value from cell (handles formulas)
export const getNumericValue = (
  data: SpreadsheetData,
  row: number,
  col: number
): number => {
  const value = getCellValue(data, row, col);
  
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  
  return 0;
};

// Validate spreadsheet data structure
export const validateSpreadsheetData = (data: SpreadsheetData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push("Data must be an array");
    return { isValid: false, errors };
  }
  
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    
    if (!Array.isArray(row)) {
      errors.push(`Row ${rowIndex} must be an array`);
      continue;
    }
    
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cell = row[colIndex];
      
      if (!cell || typeof cell !== "object") {
        errors.push(`Cell at row ${rowIndex}, col ${colIndex} must be an object`);
        continue;
      }
      
      if (cell.value !== undefined && 
          typeof cell.value !== "string" && 
          typeof cell.value !== "number") {
        errors.push(`Cell value at row ${rowIndex}, col ${colIndex} must be string or number`);
      }
      
      // Validate formulas if present
      if (typeof cell.value === "string" && cell.value.startsWith("=")) {
        const validation = validateFormula(cell.value);
        if (!validation.isValid) {
          errors.push(`Invalid formula at row ${rowIndex}, col ${colIndex}: ${validation.error}`);
        }
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// Export spreadsheet data to CSV
export const exportToCSV = (data: SpreadsheetData): string => {
  return data.map(row => 
    row.map(cell => {
      const value = cell?.value || "";
      // Escape commas and quotes in CSV
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",")
  ).join("\n");
};

// Import CSV data to spreadsheet format
export const importFromCSV = (csvString: string): SpreadsheetData => {
  const lines = csvString.split("\n");
  const data: SpreadsheetData = [];
  
  for (const line of lines) {
    if (line.trim() === "") continue;
    
    const cells: SpreadsheetCell[] = [];
    const values: string[] = [];
    let currentValue = "";
    let inQuotes = false;
    
    // Parse CSV with proper quote handling
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote
          currentValue += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(currentValue);
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    
    // Add last value
    values.push(currentValue);
    
    for (const value of values) {
      let cleanValue: string | number = value.trim();
      
      // Remove surrounding quotes if present
      if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
        cleanValue = cleanValue.slice(1, -1).replace(/""/g, '"');
      }
      
      // Try to convert to number
      const numValue = parseFloat(cleanValue);
      if (!isNaN(numValue) && cleanValue !== "") {
        cleanValue = numValue;
      }
      
      cells.push({ value: cleanValue });
    }
    
    data.push(cells);
  }
  
  return data;
};

// Create column labels (A, B, C, ... AA, AB, etc.)
export const generateColumnLabels = (count: number): string[] => {
  const labels: string[] = [];
  
  for (let i = 0; i < count; i++) {
    let colString = "";
    let colNum = i;
    
    while (colNum >= 0) {
      colString = String.fromCharCode(65 + (colNum % 26)) + colString;
      colNum = Math.floor(colNum / 26) - 1;
      if (colNum < 0) break;
    }
    
    labels.push(colString);
  }
  
  return labels;
};

// Create row labels (1, 2, 3, ...)
export const generateRowLabels = (count: number): string[] => {
  const labels: string[] = [];
  
  for (let i = 0; i < count; i++) {
    labels.push((i + 1).toString());
  }
  
  return labels;
};