export enum SolverMode {
  GENERAL = 'General Helper',
  QUADRATIC = 'Quadratic Equation',
  CUBIC = 'Cubic Equation',
  LINEAR_SYSTEM = 'Linear System',
  TRIGONOMETRY = 'Trigonometry',
  CALCULUS = 'Calculus (Deriv/Integ)',
  MATRIX = 'Matrix Solver',
  STATISTICS = 'Statistics',
  NUMBER_BASE = 'Base Converter',
  WORD_PROBLEM = 'Word Problem',
  GRAPHING = 'Graph Plotter'
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface MathResponse {
  latex: string; // The mathematical representation for display
  exactResult: string; // The precise form (fractions, roots, pi)
  decimalResult: string; // The numeric value
  standardForm?: string; // e.g. "2x^2 - 5x + 3 = 0"
  steps: string[]; // Step-by-step instructions
  explanation: string; // Natural language explanation
  graphData?: GraphPoint[];
  graphLabel?: string;
  relatedConcepts?: string[];
  error?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: SolverMode;
  query: string;
  result: MathResponse;
  type: 'text' | 'image' | 'voice' | 'draw';
}

export interface AppState {
  theme: 'light' | 'dark';
  decimalPrecision: number;
  showDecimal: boolean;
  history: HistoryItem[];
}