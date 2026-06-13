import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { StudentProfile } from '@/types/student';
import { MatchedScheme } from '@/types/scheme';

const CIVIQ_BLUE = rgb(0.18, 0.32, 0.78);
const CIVIQ_ORANGE = rgb(0.93, 0.53, 0.13);
const DARK = rgb(0.1, 0.1, 0.2);
const GRAY = rgb(0.4, 0.4, 0.5);
const GREEN = rgb(0.1, 0.6, 0.3);
const RED = rgb(0.8, 0.2, 0.2);
const YELLOW = rgb(0.8, 0.6, 0.1);
const WHITE = rgb(1, 1, 1);
const LIGHT_BLUE = rgb(0.93, 0.95, 1.0);

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const charWidth = fontSize * 0.5;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * charWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateActionPlanPDF(
  profile: StudentProfile,
  matchedSchemes: MatchedScheme[],
  explanations: Record<string, string>
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const MARGIN = 48;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

  function addNewPage() {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    return { page, y: PAGE_HEIGHT - MARGIN };
  }

  // ── Cover Page ──────────────────────────────────────────────
  let { page, y } = addNewPage();

  // Header bar
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 80, width: PAGE_WIDTH, height: 80, color: CIVIQ_BLUE });
  page.drawText('CIVIQ', { x: MARGIN, y: PAGE_HEIGHT - 52, size: 32, font: boldFont, color: WHITE });
  page.drawText('Stop Missing. Start Claiming.', { x: MARGIN, y: PAGE_HEIGHT - 70, size: 11, font: regularFont, color: rgb(0.8, 0.85, 1) });

  y = PAGE_HEIGHT - 120;
  page.drawText('Your Personalised Action Plan', { x: MARGIN, y, size: 22, font: boldFont, color: DARK });
  y -= 32;
  page.drawText(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, {
    x: MARGIN, y, size: 11, font: regularFont, color: GRAY,
  });

  // Profile summary box
  y -= 30;
  page.drawRectangle({ x: MARGIN, y: y - 120, width: CONTENT_WIDTH, height: 130, color: LIGHT_BLUE, borderColor: CIVIQ_BLUE, borderWidth: 1 });
  y -= 10;
  page.drawText('Student Profile', { x: MARGIN + 12, y, size: 13, font: boldFont, color: CIVIQ_BLUE });
  y -= 22;

  const profileLines = [
    [`Name`, profile.name || 'Not provided'],
    [`Course`, `${profile.course || '—'}, Year ${profile.year || '—'}`],
    [`State`, profile.state || '—'],
    [`Category`, profile.category?.toUpperCase() || '—'],
    [`Family Income`, profile.familyIncome ? `₹${profile.familyIncome.toLocaleString('en-IN')} per year` : '—'],
    [`PwD Status`, profile.isPWD ? `Yes (${profile.disabilityType || 'disability'})` : 'No'],
  ];

  for (const [label, value] of profileLines) {
    page.drawText(`${label}:`, { x: MARGIN + 12, y, size: 10, font: boldFont, color: DARK });
    page.drawText(value, { x: MARGIN + 120, y, size: 10, font: regularFont, color: DARK });
    y -= 16;
  }

  // Schemes summary
  y -= 20;
  page.drawText(`You qualify for ${matchedSchemes.length} scheme${matchedSchemes.length !== 1 ? 's' : ''}`, {
    x: MARGIN, y, size: 16, font: boldFont, color: CIVIQ_ORANGE,
  });
  y -= 20;
  const totalBenefit = matchedSchemes.reduce((sum, m) => sum + m.scheme.benefitAmount, 0);
  page.drawText(`Total potential benefit: ₹${totalBenefit.toLocaleString('en-IN')} per year`, {
    x: MARGIN, y, size: 12, font: regularFont, color: DARK,
  });

  // Scheme index
  y -= 30;
  page.drawText('Matched Schemes', { x: MARGIN, y, size: 14, font: boldFont, color: DARK });
  y -= 6;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: CIVIQ_BLUE });
  y -= 16;

  for (const m of matchedSchemes.slice(0, 10)) {
    const effortColor = m.scheme.effortScore === 'green' ? GREEN : m.scheme.effortScore === 'yellow' ? YELLOW : RED;
    page.drawText(`${m.rank}. ${m.scheme.name}`, { x: MARGIN, y, size: 10, font: boldFont, color: DARK });
    page.drawText(m.scheme.benefits, { x: MARGIN + 10, y: y - 14, size: 9, font: regularFont, color: GRAY });
    const effortDot = m.scheme.effortScore === 'green' ? '●' : m.scheme.effortScore === 'yellow' ? '●' : '●';
    page.drawText(effortDot, { x: PAGE_WIDTH - MARGIN - 80, y, size: 10, font: boldFont, color: effortColor });
    page.drawText(m.scheme.effortScore.toUpperCase(), { x: PAGE_WIDTH - MARGIN - 68, y, size: 9, font: regularFont, color: effortColor });
    y -= 32;
    if (y < 100) break;
  }

  // ── Per-Scheme Detail Pages ──────────────────────────────────
  for (const matched of matchedSchemes) {
    const result = addNewPage();
    page = result.page;
    y = result.y;

    // Scheme header
    page.drawRectangle({ x: MARGIN - 4, y: y - 44, width: CONTENT_WIDTH + 8, height: 52, color: CIVIQ_BLUE });
    page.drawText(`Scheme ${matched.rank}`, { x: MARGIN + 4, y: y - 14, size: 9, font: regularFont, color: rgb(0.7, 0.8, 1) });
    page.drawText(matched.scheme.name, { x: MARGIN + 4, y: y - 30, size: 13, font: boldFont, color: WHITE });
    y -= 60;

    // Ministry
    page.drawText(`Ministry: ${matched.scheme.ministry}`, { x: MARGIN, y, size: 9, font: regularFont, color: GRAY });
    y -= 20;

    // Benefits box
    page.drawRectangle({ x: MARGIN, y: y - 40, width: CONTENT_WIDTH, height: 48, color: rgb(0.95, 1, 0.95), borderColor: GREEN, borderWidth: 1 });
    page.drawText('Benefits', { x: MARGIN + 8, y: y - 12, size: 10, font: boldFont, color: GREEN });
    const benefitLines = wrapText(matched.scheme.benefits, CONTENT_WIDTH - 16, 10);
    benefitLines.forEach((line, i) => {
      page.drawText(line, { x: MARGIN + 8, y: y - 26 - i * 13, size: 10, font: regularFont, color: DARK });
    });
    y -= 56;

    // Why eligible
    page.drawText('Why You Qualify', { x: MARGIN, y, size: 11, font: boldFont, color: DARK });
    y -= 16;
    for (const reason of matched.eligibilityReasons) {
      page.drawText(`✓  ${reason}`, { x: MARGIN + 8, y, size: 9, font: regularFont, color: rgb(0.1, 0.5, 0.2) });
      y -= 14;
    }
    y -= 8;

    // Conflict warnings
    if (matched.conflictWarnings.length > 0) {
      page.drawRectangle({ x: MARGIN, y: y - matched.conflictWarnings.length * 16 - 12, width: CONTENT_WIDTH, height: matched.conflictWarnings.length * 16 + 20, color: rgb(1, 0.95, 0.9), borderColor: RED, borderWidth: 1 });
      page.drawText('⚠ Conflict Warning', { x: MARGIN + 8, y: y - 12, size: 10, font: boldFont, color: RED });
      matched.conflictWarnings.forEach((w, i) => {
        const lines = wrapText(w, CONTENT_WIDTH - 20, 9);
        lines.forEach(line => {
          page.drawText(line, { x: MARGIN + 12, y: y - 26 - i * 14, size: 9, font: regularFont, color: DARK });
        });
      });
      y -= matched.conflictWarnings.length * 16 + 28;
    }

    // Effort score
    const effortColor = matched.scheme.effortScore === 'green' ? GREEN : matched.scheme.effortScore === 'yellow' ? YELLOW : RED;
    page.drawText(`Effort: ${matched.effortLabel}`, { x: MARGIN, y, size: 10, font: boldFont, color: effortColor });
    y -= 20;

    // Required documents
    page.drawText('Required Documents', { x: MARGIN, y, size: 11, font: boldFont, color: DARK });
    y -= 14;
    matched.scheme.requiredDocuments.forEach(doc => {
      page.drawText(`→  ${doc}`, { x: MARGIN + 8, y, size: 9, font: regularFont, color: DARK });
      y -= 13;
    });
    y -= 8;

    // AI explanation
    if (explanations[matched.scheme.id]) {
      page.drawText('What to Do', { x: MARGIN, y, size: 11, font: boldFont, color: CIVIQ_BLUE });
      y -= 14;
      const explainLines = wrapText(explanations[matched.scheme.id], CONTENT_WIDTH, 10);
      explainLines.forEach(line => {
        if (y < 80) return;
        page.drawText(line, { x: MARGIN, y, size: 10, font: regularFont, color: DARK });
        y -= 14;
      });
      y -= 8;
    }

    // Deadline & link
    page.drawText(`Deadline: ${matched.scheme.deadline}`, { x: MARGIN, y, size: 10, font: boldFont, color: RED });
    y -= 16;
    page.drawText(`Apply at: ${matched.scheme.applicationLink}`, { x: MARGIN, y, size: 9, font: regularFont, color: CIVIQ_BLUE });
  }

  // ── Footer page ──────────────────────────────────────────────
  const fp = addNewPage();
  page = fp.page;
  y = fp.y;

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: 80, color: CIVIQ_BLUE });
  page.drawText('CIVIQ — Stop Missing. Start Claiming.', { x: MARGIN, y: 50, size: 12, font: boldFont, color: WHITE });
  page.drawText('This report is advisory only. Verify eligibility at official portals before applying.', { x: MARGIN, y: 32, size: 9, font: regularFont, color: rgb(0.7, 0.8, 1) });

  page.drawText('Next Steps', { x: MARGIN, y, size: 18, font: boldFont, color: DARK });
  y -= 30;
  const nextSteps = [
    '1. Arrange your documents (Aadhaar, income certificate, caste certificate if applicable)',
    '2. Visit scholarships.gov.in — single portal for most central schemes',
    '3. Register with your Aadhaar-linked mobile number',
    '4. Apply for the GREEN effort-score schemes first — easiest wins',
    '5. Note deadlines — most central schemes close by October/November',
    '6. Do NOT apply for conflicting schemes simultaneously',
  ];
  for (const step of nextSteps) {
    const lines = wrapText(step, CONTENT_WIDTH, 11);
    lines.forEach(line => {
      page.drawText(line, { x: MARGIN, y, size: 11, font: regularFont, color: DARK });
      y -= 18;
    });
    y -= 4;
  }

  return await pdfDoc.save();
}
