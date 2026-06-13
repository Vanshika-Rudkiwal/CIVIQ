'use client';
import { useState } from 'react';
import { MatchedScheme } from '@/types/scheme';
import { StudentProfile } from '@/types/student';

export default function SchemeCard({ matched, profile }: { matched: MatchedScheme; profile: StudentProfile }) {
  const [expanded, setExpanded] = useState(false);

  const effortBg = matched.scheme.effortScore === 'green'
    ? 'bg-green-50 border-green-200 text-green-700'
    : matched.scheme.effortScore === 'yellow'
    ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
    : 'bg-red-50 border-red-200 text-red-700';

  return (
    <article
      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      aria-label={`Scheme: ${matched.scheme.name}`}
    >
      {/* Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold text-[#2d52c8] bg-blue-50 px-2 py-0.5 rounded-full">
              #{matched.rank}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${effortBg}`}>
              {matched.effortLabel}
            </span>
            {matched.scheme.pwdOnly && (
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                ♿ PwD Only
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-base leading-snug">{matched.scheme.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{matched.scheme.ministry}</p>
        </div>
        <div className="text-right shrink-0">
          {matched.scheme.benefitAmount > 0 && (
            <div className="font-black text-green-600 text-lg">
              ₹{matched.scheme.benefitAmount.toLocaleString('en-IN')}
            </div>
          )}
          <div className="text-xs text-gray-400">per year</div>
        </div>
      </div>

      {/* Benefits bar */}
      <div className="mx-5 mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
        <span className="text-xs font-bold text-green-700">Benefits: </span>
        <span className="text-xs text-green-800">{matched.scheme.benefits}</span>
      </div>

      {/* Why eligible */}
      <div className="mx-5 mb-4">
        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Why You Qualify</div>
        <ul className="space-y-1">
          {matched.eligibilityReasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5 shrink-0">✓</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Conflict warnings */}
      {matched.conflictWarnings.length > 0 && (
        <div className="mx-5 mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {matched.conflictWarnings.map((w, i) => (
            <p key={i} className="text-xs text-red-700 font-medium">{w}</p>
          ))}
        </div>
      )}

      {/* Expandable section */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full px-5 py-3 text-sm font-semibold text-[#2d52c8] hover:bg-blue-50 transition-colors flex items-center justify-between"
          aria-expanded={expanded}
        >
          <span>{expanded ? 'Hide details' : 'View documents & apply'}</span>
          <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
        </button>

        {expanded && (
          <div className="px-5 pb-5 space-y-4">
            {/* Deadline */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-500 font-bold">⏰ Deadline:</span>
              <span className="text-gray-700">{matched.scheme.deadline}</span>
            </div>

            {/* Documents */}
            <div>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Required Documents</div>
              <ul className="space-y-1">
                {matched.scheme.requiredDocuments.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#2d52c8] shrink-0">→</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Application mode */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Application mode:</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                matched.scheme.applicationMode === 'online'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {matched.scheme.applicationMode.toUpperCase()}
              </span>
            </div>

            {/* Apply button */}
            <a
              href={matched.scheme.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 bg-[#2d52c8] text-white font-bold rounded-xl hover:bg-[#1a3399] transition-colors"
            >
              Apply at Official Portal →
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
