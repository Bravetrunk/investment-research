/**
 * TypeScript Definitions for investment-research
 */

export interface CashFlow {
  year: number;
  fcf: number;
  pv: number;
}

export interface DCFResult {
  pv_explicit_flows: number;
  pv_terminal: number;
  terminal_share_of_value: number;
  enterprise_value: number;
  equity_value: number;
  fair_value_per_share: number;
  flows: CashFlow[];
}

export interface DCFParams {
  fcfBase: number;
  growth: number;
  discount: number;
  terminalGrowth: number;
  years?: number;
  shares: number;
  netCash?: number;
  trajectory?: number[] | null;
}

export interface ReverseDCFParams {
  currentPrice: number;
  shares: number;
  fcfBase: number;
  discountRate: number;
  terminalGrowthRate: number;
  years?: number;
  netCash?: number;
}

export interface ReverseDCFResult {
  current_price: number;
  implied_fcf_growth_rate: number | null;
  implied_growth_pct: string;
  notes?: string;
}

export interface SOTPSegment {
  name: string;
  metric_type: "revenue" | "ebitda" | "ebit" | "fcf";
  metric_value: number;
  multiple: number;
  multiple_source?: string;
}

export interface SOTPParams {
  segments: SOTPSegment[];
  netCash?: number;
  shares: number;
}

export interface SOTPResult {
  total_segment_value: number;
  net_cash: number;
  equity_value: number;
  fair_value_per_share: number;
  segments: Array<SOTPSegment & { segment_ev: number; share_of_ev: number }>;
}

export interface BeneishParams {
  dsri?: number;
  gmi?: number;
  aqi?: number;
  sgi?: number;
  depi?: number;
  sgai?: number;
  lvgi?: number;
  tata?: number;
}

export interface BeneishResult {
  m_score: number;
  threshold: number;
  is_manipulator: boolean;
  risk_level: "LOW" | "ELEVATED" | "HIGH";
  indices: Record<string, number>;
}

export interface SloanParams {
  netIncome: number;
  cfo: number;
  avgTotalAssets: number;
}

export interface SloanResult {
  accrual_ratio: number;
  accrual_ratio_pct: string;
  quality: "CLEAN" | "CONTAMINATED";
  interpretation: string;
}

export interface FractionalKellyParams {
  baseFv: number;
  bearFv: number;
  currentPrice: number;
  pWin?: number;
  pLoss?: number;
  maxCap?: number;
}

export interface FractionalKellyResult {
  recommended_allocation: number;
  allocation_pct: string;
  quarter_kelly_raw: number;
  rationale: string;
}

export interface PassingDisciplineEvaluation {
  ticker: string;
  verdict: "APPROVED_LONG" | "PASSED";
  passed_discipline: boolean;
  flags: string[];
  rationale: string;
  timestamp: string;
}

export function round(n: number, d?: number): number | null;
export function dcf(params: DCFParams): DCFResult;
export function solveReverseDCF(params: ReverseDCFParams): ReverseDCFResult | null;
export function sotp(params: SOTPParams): SOTPResult;
export function beneish(params: BeneishParams): BeneishResult;
export function sloan(params: SloanParams): SloanResult;
export function fractionalKelly(params: FractionalKellyParams): FractionalKellyResult;
export function compute(model: Record<string, any>): Record<string, any>;
export function verify(model: Record<string, any>): { verdict: "pass" | "fail"; mismatches: string[]; recomputed: any };
export function runCli(argv?: string[]): void;
export function evaluatePassingDiscipline(params: {
  ticker: string;
  netDebtToEbitda?: number | null;
  peRatio?: number | null;
  archetype?: string | null;
  fcfMargin?: number | null;
  hasPricingPower?: boolean;
  notes?: string;
}): PassingDisciplineEvaluation;

export const MASTER_THEMES: Array<{
  id: string;
  title: string;
  bottlenecks: string[];
  benchmark_names: string[];
}>;

export const PASSING_DISCIPLINE_RULES: Record<string, {
  id: string;
  archetype_example: string;
  rationale: string;
  default_verdict: string;
}>;
