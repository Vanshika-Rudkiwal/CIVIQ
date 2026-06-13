export type Category = 'general' | 'obc' | 'sc' | 'st' | 'ews' | 'ebc' | 'dnt';
export type Gender = 'male' | 'female' | 'other';
export type AccommodationType = 'hosteller' | 'day-scholar';
export type DisabilityType =
  | 'locomotor'
  | 'visual'
  | 'hearing'
  | 'intellectual'
  | 'multiple'
  | 'none';

export interface StudentProfile {
  uid?: string;
  name?: string;
  email?: string;
  state?: string;
  college?: string;
  course?: string;
  year?: number;
  gender?: Gender;
  category?: Category;
  isPWD?: boolean;
  disabilityType?: DisabilityType;
  disabilityPercentage?: number;
  isMinority?: boolean;
  minorityCommunity?: string;
  familyIncome?: number;
  accommodation?: AccommodationType;
  percentage?: number;
  isSingleGirlChild?: boolean;
  isOrphan?: boolean;
  isArmedForcesWard?: boolean;
  isNorthEast?: boolean;
  cgpa?: number;
  hasGATE?: boolean;
  gateScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const REQUIRED_PROFILE_FIELDS: (keyof StudentProfile)[] = [
  'name',
  'state',
  'course',
  'year',
  'gender',
  'category',
  'isPWD',
  'isMinority',
  'familyIncome',
  'accommodation',
];

export const CLARIFICATION_QUESTIONS: Record<keyof StudentProfile, string> = {
  name: 'What is your full name?',
  state: 'Which state are you from (domicile/home state)?',
  college: 'What is the name of your college?',
  course: 'What course are you pursuing? (e.g., BTech, BSc, BA, MBA)',
  year: 'Which year of your course are you in?',
  gender: 'What is your gender? (male/female/other)',
  category: 'What is your category? (General/OBC/SC/ST/EWS)',
  isPWD: 'Do you have any disability (Person with Disability — PwD status)?',
  disabilityType: 'What type of disability do you have? (locomotor/visual/hearing/intellectual/multiple)',
  disabilityPercentage: 'What is the percentage of your disability as per your PwD certificate?',
  isMinority: 'Do you belong to a minority community? (Muslim/Christian/Sikh/Buddhist/Jain/Zoroastrian)',
  minorityCommunity: 'Which minority community do you belong to?',
  familyIncome: 'What is your approximate annual family income in rupees?',
  accommodation: 'Are you a hosteller or day scholar?',
  percentage: 'What percentage did you score in your 12th standard (Class XII)?',
  isSingleGirlChild: 'Are you the only child of your parents (single girl child)?',
  isOrphan: 'Are you an orphan or ward of an armed forces/CAPF martyr?',
  isArmedForcesWard: 'Are you a ward of an armed forces or Central Armed Police Forces personnel?',
  isNorthEast: 'Are you from a North-East Indian state?',
  cgpa: 'What is your current CGPA?',
  hasGATE: 'Have you qualified GATE?',
  gateScore: 'What is your GATE score?',
  uid: '',
  email: '',
  createdAt: '',
  updatedAt: '',
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  stage?: PipelineStage;
}

export type PipelineStage =
  | 'intake'
  | 'clarification'
  | 'match'
  | 'conflict'
  | 'effort'
  | 'action';
