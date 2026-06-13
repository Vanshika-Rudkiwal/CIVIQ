import { NextRequest, NextResponse } from 'next/server';
import { extractProfile, generateClarificationMessage, explainSchemes, generateWelcomeMessage } from '@/lib/gemini';
import { matchSchemes, getMissingFields } from '@/lib/matcher';
import { StudentProfile } from '@/types/student';

export async function POST(req: NextRequest) {
  try {
    const { message, profile, stage, simplified } = await req.json();

    // Stage 1: Intake — extract profile from user message
    const extracted = await extractProfile(message, profile || {});
    const updatedProfile: StudentProfile = { ...(profile || {}), ...extracted };

    // Stage 2: Clarification — check what's still missing
    const missingFields = getMissingFields(updatedProfile);

    if (missingFields.length > 0) {
      const clarificationMsg = await generateClarificationMessage(
        missingFields,
        updatedProfile,
        simplified
      );
      return NextResponse.json({
        reply: clarificationMsg,
        profile: updatedProfile,
        stage: 'clarification',
        missingFields,
        complete: false,
      });
    }

    // Stages 3–5: Match + Conflict + Effort scoring (all deterministic)
    const matchedSchemes = matchSchemes(updatedProfile);

    // Stage 3+: Gemini explains the results only
    const explanation = await explainSchemes(matchedSchemes, updatedProfile, simplified);

    return NextResponse.json({
      reply: explanation,
      profile: updatedProfile,
      stage: 'match',
      matchedSchemes,
      complete: true,
      missingFields: [],
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
