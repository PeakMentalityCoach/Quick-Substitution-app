import { PlayerNoteInterpretation } from '../types';

/**
 * Interprets player notes to extract optimization constraints
 * Supports natural language patterns for injuries, restrictions, and time limits
 */
export function interpretPlayerNote(note?: string): PlayerNoteInterpretation {
  if (!note || note.trim() === '') {
    return {
      forbiddenPositions: [],
      ratingPenalty: 0,
      warningMessage: undefined,
    };
  }

  const lowerNote = note.toLowerCase();
  const forbiddenPositions: string[] = [];
  let ratingPenalty = 0;
  let mustSubOutAtMinute: number | undefined;
  let warningMessage: string | undefined;

  // INJURY DETECTION
  // Minor injury: -2 rating penalty
  if (
    /minor (injury|knock|strain|twist)/.test(lowerNote) ||
    /slight (injury|knock|discomfort)/.test(lowerNote)
  ) {
    ratingPenalty = 2;
    warningMessage = 'Minor injury - reduced performance';
  }

  // Moderate injury: -4 rating penalty
  if (
    /moderate (injury|strain|knock)/.test(lowerNote) ||
    /recovering from/.test(lowerNote) ||
    /not (fully )?fit/.test(lowerNote)
  ) {
    ratingPenalty = Math.max(ratingPenalty, 4);
    warningMessage = 'Moderate injury - significant performance reduction';
  }

  // Severe injury: -6 rating penalty
  if (
    /severe (injury|strain|knock)/.test(lowerNote) ||
    /serious injury/.test(lowerNote) ||
    /major (injury|strain)/.test(lowerNote)
  ) {
    ratingPenalty = Math.max(ratingPenalty, 6);
    warningMessage = 'Severe injury - heavily compromised';
  }

  // FATIGUE DETECTION
  if (/fatigued?/.test(lowerNote) || /tired/.test(lowerNote)) {
    ratingPenalty = Math.max(ratingPenalty, 3);
    warningMessage = warningMessage || 'Fatigued - reduced performance';
  }

  if (/exhausted/.test(lowerNote) || /very tired/.test(lowerNote)) {
    ratingPenalty = Math.max(ratingPenalty, 5);
    warningMessage = 'Exhausted - heavily reduced performance';
  }

  // POSITION RESTRICTIONS
  // "No GK" or "Cannot play GK"
  const noPositionMatch = lowerNote.match(/(?:no|cannot play|can't play|avoid)\s+(\w+)/g);
  if (noPositionMatch) {
    noPositionMatch.forEach((match) => {
      const pos = match.replace(/(?:no|cannot play|can't play|avoid)\s+/i, '').toUpperCase();
      forbiddenPositions.push(pos);
    });
  }

  // "Forbidden: CB, CDM"
  const forbiddenMatch = lowerNote.match(/forbidden:?\s*([\w,\s]+)/i);
  if (forbiddenMatch) {
    const positions = forbiddenMatch[1].split(',').map((p) => p.trim().toUpperCase());
    forbiddenPositions.push(...positions);
  }

  // Specific body part injuries restricting positions
  if (/ankle|foot|leg/.test(lowerNote)) {
    // Ankle/leg injuries - avoid positions requiring lots of running
    if (/severe|broken|fractured/.test(lowerNote)) {
      forbiddenPositions.push('LM', 'RM', 'LW', 'RW', 'LB', 'RB');
      warningMessage = 'Leg injury - avoid high-mobility positions';
    }
  }

  if (/shoulder|arm|hand/.test(lowerNote)) {
    // Arm/shoulder injuries - goalkeepers affected
    if (lowerNote.includes('gk') || lowerNote.includes('goalkeeper')) {
      forbiddenPositions.push('GK');
      warningMessage = 'Upper body injury - cannot play goalkeeper';
    }
  }

  if (/head|concussion/.test(lowerNote)) {
    // Head injuries - avoid aerial duels
    forbiddenPositions.push('CB1', 'CB2', 'ST', 'CF');
    warningMessage = 'Head injury - avoid aerial combat positions';
  }

  // TIME RESTRICTIONS
  // "Max 60 minutes", "Sub out at 70", "Only 45 min"
  const timeMatch = lowerNote.match(
    /(?:max|maximum|only|up to)\s*(\d+)\s*(?:min|minutes?)|(?:sub (?:out|off) at)\s*(\d+)/i
  );
  if (timeMatch) {
    const minutes = parseInt(timeMatch[1] || timeMatch[2], 10);
    if (!isNaN(minutes)) {
      mustSubOutAtMinute = minutes;
      warningMessage = `Must substitute out at ${minutes} minutes`;
    }
  }

  // YELLOW/RED CARD WARNINGS
  if (/yellow card/.test(lowerNote)) {
    ratingPenalty = Math.max(ratingPenalty, 1);
    warningMessage = warningMessage || 'On yellow card - play cautiously';
  }

  if (/red card/.test(lowerNote) || /suspended/.test(lowerNote)) {
    ratingPenalty = 10; // Effectively removes player
    warningMessage = 'Suspended - cannot play';
  }

  // Remove duplicates from forbidden positions
  const uniqueForbidden = Array.from(new Set(forbiddenPositions));

  return {
    forbiddenPositions: uniqueForbidden,
    ratingPenalty,
    mustSubOutAtMinute,
    warningMessage,
  };
}

/**
 * Checks if a player note indicates they should be substituted at current minute
 */
export function shouldSubstitutePlayer(
  note: string | undefined,
  currentMinute: number
): boolean {
  const interpretation = interpretPlayerNote(note);
  if (interpretation.mustSubOutAtMinute) {
    return currentMinute >= interpretation.mustSubOutAtMinute;
  }
  return false;
}

/**
 * Gets a visual indicator for note severity
 */
export function getNoteSeverity(note?: string): 'none' | 'warning' | 'critical' {
  const interpretation = interpretPlayerNote(note);

  if (interpretation.ratingPenalty >= 6 || interpretation.forbiddenPositions.length > 5) {
    return 'critical';
  }

  if (
    interpretation.ratingPenalty >= 2 ||
    interpretation.forbiddenPositions.length > 0 ||
    interpretation.mustSubOutAtMinute
  ) {
    return 'warning';
  }

  return 'none';
}
