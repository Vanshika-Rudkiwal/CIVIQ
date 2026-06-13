import { NextRequest, NextResponse } from 'next/server';
import { matchSchemes } from '@/lib/matcher';
import { StudentProfile } from '@/types/student';
import { generateSchemeExplanation } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json() as { profile: StudentProfile };
    const matchedSchemes = matchSchemes(profile);

    // Generate explanations for top 5 schemes
    const explanations: Record<string, string> = {};
    await Promise.all(
      matchedSchemes.slice(0, 5).map(async (m) => {
        explanations[m.scheme.id] = await generateSchemeExplanation(m, profile);
      })
    );

    return NextResponse.json({ matchedSchemes, explanations });
  } catch (error) {
    return NextResponse.json({ error: 'Matching failed' }, { status: 500 });
  }
}
