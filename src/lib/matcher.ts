import { StudentProfile } from '@/types/student';
import { Scheme, MatchedScheme, EFFORT_LABELS, EFFORT_COLORS } from '@/types/scheme';
import schemesData from '@/data/schemes.json';

const schemes = schemesData as Scheme[];

function normalizeCourse(course: string): string {
  const c = course.toLowerCase().replace(/[.\s-]/g, '');
  if (c.includes('btech') || c.includes('be') || c.includes('beng')) return 'btech';
  if (c.includes('bsc') || c.includes('bscience')) return 'bsc';
  if (c.includes('ba') || c.includes('arts')) return 'ba';
  if (c.includes('bcom') || c.includes('bcommerce')) return 'bcom';
  if (c.includes('mbbs') || c.includes('medicine')) return 'mbbs';
  if (c.includes('bca')) return 'bca';
  if (c.includes('mtech') || c.includes('me') || c.includes('meng')) return 'mtech';
  if (c.includes('msc')) return 'msc';
  if (c.includes('ma') || c.includes('marts')) return 'ma';
  if (c.includes('mcom')) return 'mcom';
  if (c.includes('mba')) return 'mba';
  if (c.includes('phd') || c.includes('doctorate')) return 'phd';
  if (c.includes('mphil')) return 'mphil';
  if (c.includes('diploma')) return 'diploma';
  if (c.includes('llb') || c.includes('law')) return 'llb';
  if (c.includes('bpharm') || c.includes('pharmacy')) return 'bpharm';
  if (c.includes('ms') && !c.includes('msc')) return 'ms';
  return c;
}

function checkEligibility(scheme: Scheme, profile: StudentProfile): string[] {
  const reasons: string[] = [];

  // Category check
  if (profile.category) {
    const cat = profile.category.toLowerCase();
    if (!scheme.category.includes(cat) && !scheme.category.includes('general')) {
      return []; // Not eligible
    }
    if (scheme.category.includes(cat) && cat !== 'general') {
      reasons.push(`Your ${cat.toUpperCase()} category matches`);
    }
  }

  // PWD-only schemes
  if (scheme.pwdOnly && !profile.isPWD) return [];
  if (scheme.pwdOnly && profile.isPWD) {
    reasons.push('You qualify as a Person with Disability (PwD)');
  }

  // PWD not eligible
  if (!scheme.pwdEligible && profile.isPWD) return [];

  // Gender check
  if (scheme.genderEligibility !== 'all') {
    if (profile.gender !== scheme.genderEligibility) return [];
    reasons.push(`Open to ${scheme.genderEligibility} students`);
  }

  // Income check
  if (profile.familyIncome !== undefined && scheme.incomeLimit < 99999999) {
    if (profile.familyIncome > scheme.incomeLimit) return [];
    reasons.push(`Your family income (₹${profile.familyIncome.toLocaleString()}) is within the ₹${scheme.incomeLimit.toLocaleString()} limit`);
  }

  // Minority check
  if (scheme.minority && !profile.isMinority) return [];
  if (scheme.minority && profile.isMinority) {
    reasons.push(`Your minority community status (${profile.minorityCommunity || 'declared'}) qualifies`);
  }

  // Single girl child
  if (scheme.singleGirlChild && !profile.isSingleGirlChild) return [];
  if (scheme.singleGirlChild && profile.isSingleGirlChild) {
    reasons.push('Single girl child status qualifies');
  }

  // Course check
  if (profile.course) {
    const normalizedCourse = normalizeCourse(profile.course);
    if (!scheme.courseEligibility.includes(normalizedCourse)) return [];
    reasons.push(`Your course (${profile.course}) is eligible`);
  }

  // Year check
  if (profile.year !== undefined) {
    if (!scheme.yearEligibility.includes(profile.year)) return [];
    reasons.push(`Year ${profile.year} students are eligible`);
  }

  // Percentage check
  if (profile.percentage !== undefined && scheme.minPercentage > 0) {
    if (profile.percentage < scheme.minPercentage) return [];
    reasons.push(`Your ${profile.percentage}% score meets the ${scheme.minPercentage}% minimum`);
  }

  // State check
  if (scheme.stateEligibility !== 'all' && Array.isArray(scheme.stateEligibility)) {
    if (profile.state) {
      const normalizedState = profile.state.toLowerCase().replace(/\s/g, '-');
      if (!scheme.stateEligibility.includes(normalizedState)) return [];
      reasons.push(`Available for students from ${profile.state}`);
    }
  }

  // North East check
  const neStates = ['assam', 'meghalaya', 'manipur', 'mizoram', 'nagaland', 'tripura', 'arunachal pradesh', 'sikkim'];
  if (scheme.id === 'ishan-uday') {
    const stateNorm = profile.state?.toLowerCase() || '';
    if (!neStates.some(s => stateNorm.includes(s))) return [];
    reasons.push('North-East state domicile qualifies');
  }

  // GATE check
  if (scheme.id === 'gate-stipend') {
    if (!profile.hasGATE) return [];
    reasons.push('GATE qualification confirmed');
  }

  if (reasons.length === 0) {
    reasons.push('Meets general eligibility criteria');
  }

  return reasons;
}

// Conflict detection — pure deterministic logic, zero AI
function detectConflicts(matchedSchemes: MatchedScheme[]): MatchedScheme[] {
  const matchedIds = new Set(matchedSchemes.map(m => m.scheme.id));

  return matchedSchemes.map(matched => {
    const conflicts: string[] = [];
    matched.scheme.conflictsWith.forEach(conflictId => {
      if (matchedIds.has(conflictId)) {
        const conflicting = matchedSchemes.find(m => m.scheme.id === conflictId);
        if (conflicting) {
          conflicts.push(
            `⚠️ Cannot claim with "${conflicting.scheme.shortName}" simultaneously — choose one`
          );
        }
      }
    });
    return { ...matched, conflictWarnings: conflicts };
  });
}

export function matchSchemes(profile: StudentProfile): MatchedScheme[] {
  const matched: MatchedScheme[] = [];

  for (const scheme of schemes) {
    const reasons = checkEligibility(scheme, profile);
    if (reasons.length > 0) {
      matched.push({
        scheme,
        eligibilityReasons: reasons,
        conflictWarnings: [],
        effortLabel: EFFORT_LABELS[scheme.effortScore],
        effortColor: EFFORT_COLORS[scheme.effortScore],
        rank: matched.length + 1,
      });
    }
  }

  // Sort by benefit amount descending, then effort score
  matched.sort((a, b) => {
    const effortOrder = { green: 0, yellow: 1, red: 2 };
    if (b.scheme.benefitAmount !== a.scheme.benefitAmount) {
      return b.scheme.benefitAmount - a.scheme.benefitAmount;
    }
    return effortOrder[a.scheme.effortScore] - effortOrder[b.scheme.effortScore];
  });

  // Assign ranks
  matched.forEach((m, i) => { m.rank = i + 1; });

  // Run conflict detection
  return detectConflicts(matched);
}

export function getMissingFields(profile: StudentProfile): (keyof StudentProfile)[] {
  const required: (keyof StudentProfile)[] = [
    'name', 'state', 'course', 'year', 'gender',
    'category', 'isPWD', 'isMinority', 'familyIncome', 'accommodation',
  ];
  return required.filter(field => profile[field] === undefined || profile[field] === null || profile[field] === '');
}
