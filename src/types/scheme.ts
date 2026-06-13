export type EffortScore = 'green' | 'yellow' | 'red';

export interface Scheme {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: string[];
  stateEligibility: string | string[];
  incomeLimit: number;
  pwdEligible: boolean;
  pwdOnly?: boolean;
  genderEligibility: 'all' | 'male' | 'female';
  minority?: boolean;
  singleGirlChild?: boolean;
  courseEligibility: string[];
  yearEligibility: number[];
  minPercentage: number;
  benefits: string;
  benefitAmount: number;
  requiredDocuments: string[];
  applicationLink: string;
  applicationMode: 'online' | 'offline' | 'both';
  effortScore: EffortScore;
  conflictsWith: string[];
  deadline: string;
  ministry: string;
  tags: string[];
}

export interface MatchedScheme {
  scheme: Scheme;
  eligibilityReasons: string[];
  conflictWarnings: string[];
  effortLabel: string;
  effortColor: string;
  rank: number;
}

export const EFFORT_LABELS: Record<EffortScore, string> = {
  green: '🟢 Easy — Online certificate only',
  yellow: '🟡 Moderate — Some physical documents needed',
  red: '🔴 High effort — Physical affidavit or exam required',
};

export const EFFORT_COLORS: Record<EffortScore, string> = {
  green: 'text-green-700 bg-green-50 border-green-200',
  yellow: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  red: 'text-red-700 bg-red-50 border-red-200',
};
