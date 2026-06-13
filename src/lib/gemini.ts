import { StudentProfile, CLARIFICATION_QUESTIONS } from '@/types/student';
import { MatchedScheme } from '@/types/scheme';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Stage 1: Extract profile from natural language
export async function extractProfile(userMessage: string, existingProfile: Partial<StudentProfile>): Promise<Partial<StudentProfile>> {
  const prompt = `You are a profile extractor for a government scheme advisor. Extract structured student data from the user message.

Existing profile: ${JSON.stringify(existingProfile)}

User message: "${userMessage}"

Extract ONLY what the user explicitly mentioned. Return a JSON object with these possible fields:
- name (string)
- state (string, e.g. "Delhi", "Maharashtra")
- college (string)
- course (string, e.g. "BTech", "BSc", "BA")
- year (number, 1-6)
- gender ("male" | "female" | "other")
- category ("general" | "obc" | "sc" | "st" | "ews")
- isPWD (boolean)
- disabilityType ("locomotor" | "visual" | "hearing" | "intellectual" | "multiple" | "none")
- disabilityPercentage (number, 0-100)
- isMinority (boolean)
- minorityCommunity (string)
- familyIncome (number in rupees — convert "3 lakh" to 300000, "3.5 lakh" to 350000)
- accommodation ("hosteller" | "day-scholar")
- percentage (number, 12th class %)
- isSingleGirlChild (boolean)
- isOrphan (boolean)
- isArmedForcesWard (boolean)
- cgpa (number)
- hasGATE (boolean)

Rules:
- Only include fields explicitly mentioned
- For income: "3 lakh" = 300000, "3.5 lakh" = 350000, "50000" = 50000
- For PWD: "locomotor disability", "physical disability" → isPWD: true, disabilityType: "locomotor"
- Return ONLY valid JSON, no explanation, no markdown

JSON:`;

  try {
    const result = await callGemini(prompt);
    const cleaned = result.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

// Stage 2: Generate clarification question for a missing field
export async function generateClarificationMessage(
  missingFields: (keyof StudentProfile)[],
  profile: Partial<StudentProfile>,
  simplified: boolean = false
): Promise<string> {
  if (missingFields.length === 0) return '';

  const field = missingFields[0];
  const question = CLARIFICATION_QUESTIONS[field] || `Please tell me your ${field}`;

  if (simplified) {
    return `I need one more thing: ${question}`;
  }

  const prompt = `You are CIVIQ, a friendly government scheme advisor for Indian college students. 
You already know: ${JSON.stringify(profile)}
You need to ask about: ${field}
Default question: "${question}"

Write a warm, conversational follow-up (1-2 sentences max). Be student-friendly. Don't use jargon.
If asking about PWD/disability, be sensitive and respectful.
Response:`;

  try {
    return await callGemini(prompt);
  } catch {
    return question;
  }
}

// Stage 3: Generate plain-language explanation of matched schemes
export async function explainSchemes(
  matchedSchemes: MatchedScheme[],
  profile: StudentProfile,
  simplified: boolean = false
): Promise<string> {
  if (matchedSchemes.length === 0) {
    return "I couldn't find any schemes matching your current profile. This could be due to income limits or course eligibility. Try updating your profile or check the National Scholarship Portal directly.";
  }

  const schemesSummary = matchedSchemes.slice(0, 5).map(m => ({
    name: m.scheme.shortName,
    benefits: m.scheme.benefits,
    reasons: m.eligibilityReasons.slice(0, 2),
    conflicts: m.conflictWarnings,
  }));

  const prompt = `You are CIVIQ, a government scheme advisor. A student qualifies for these schemes:
${JSON.stringify(schemesSummary)}

Student profile: ${profile.course}, Year ${profile.year}, ${profile.state}, ${profile.category?.toUpperCase()}, Income: ₹${profile.familyIncome?.toLocaleString()}${profile.isPWD ? ', PwD' : ''}

${simplified ? 'Use very simple language. Short sentences. No complex words.' : ''}

Write a friendly 3-4 sentence summary:
1. How many schemes they qualify for
2. The top benefit (highest amount)
3. Any important conflict warning
4. Encourage them to download the action plan

Do NOT say which scheme is better or worse. Do NOT make eligibility decisions. Keep it encouraging.
Response:`;

  try {
    return await callGemini(prompt);
  } catch {
    return `Great news! You qualify for ${matchedSchemes.length} government schemes. Your top match is "${matchedSchemes[0].scheme.name}" with benefits worth ${matchedSchemes[0].scheme.benefits}. Download your personalised action plan to get started!`;
  }
}

// Stage 6: Generate PDF content explanation per scheme
export async function generateSchemeExplanation(
  matched: MatchedScheme,
  profile: StudentProfile
): Promise<string> {
  const prompt = `You are CIVIQ. Explain in 3-4 simple sentences why this student qualifies for this scheme and how to apply.

Scheme: ${matched.scheme.name}
Benefits: ${matched.scheme.benefits}
Why eligible: ${matched.eligibilityReasons.join(', ')}
Documents needed: ${matched.scheme.requiredDocuments.join(', ')}
Apply at: ${matched.scheme.applicationLink}
Deadline: ${matched.scheme.deadline}

Student: ${profile.course} student from ${profile.state}

Write actionable, student-friendly guidance. No jargon. Be specific about what to do first.
Response:`;

  try {
    return await callGemini(prompt);
  } catch {
    return `You qualify for ${matched.scheme.name} based on your profile. Benefits include: ${matched.scheme.benefits}. Apply online at ${matched.scheme.applicationLink} before ${matched.scheme.deadline}.`;
  }
}

export async function generateWelcomeMessage(profile: StudentProfile): Promise<string> {
  const prompt = `You are CIVIQ. A returning student just logged in. Their saved profile:
Name: ${profile.name}, Course: ${profile.course}, Year: ${profile.year}, State: ${profile.state}

Write a warm 1-2 sentence welcome back message and ask if anything has changed in their profile (new year, income change, etc.)
Response:`;

  try {
    return await callGemini(prompt);
  } catch {
    return `Welcome back, ${profile.name || 'there'}! I have your saved profile. Has anything changed — like your year of study or family income?`;
  }
}
