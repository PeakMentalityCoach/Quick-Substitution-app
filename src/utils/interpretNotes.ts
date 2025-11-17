import type { NotesInterpretation, NoteModifier, Position } from '../types';

const POSITION_KEYWORDS: Record<Position, string[]> = {
  'GK': ['goalkeeper', 'keeper', 'gk', 'goalie'],
  'LB': ['left back', 'lb', 'leftback'],
  'RB': ['right back', 'rb', 'rightback'],
  'CB': ['center back', 'cb', 'centreback', 'centre back'],
  'LCB': ['left center back', 'lcb'],
  'RCB': ['right center back', 'rcb'],
  'LWB': ['left wing back', 'lwb'],
  'RWB': ['right wing back', 'rwb'],
  'LDM': ['left defensive mid', 'ldm'],
  'CDM': ['defensive mid', 'cdm', 'holding mid', 'dm'],
  'RDM': ['right defensive mid', 'rdm'],
  'LCM': ['left center mid', 'lcm'],
  'CM': ['center mid', 'cm', 'central mid'],
  'RCM': ['right center mid', 'rcm'],
  'LAM': ['left attacking mid', 'lam'],
  'CAM': ['attacking mid', 'cam', 'number 10', 'no.10'],
  'RAM': ['right attacking mid', 'ram'],
  'LW': ['left wing', 'lw', 'left winger'],
  'RW': ['right wing', 'rw', 'right winger'],
  'LF': ['left forward', 'lf'],
  'CF': ['center forward', 'cf'],
  'RF': ['right forward', 'rf'],
  'ST': ['striker', 'st', 'forward', 'center forward']
};

const BOOST_KEYWORDS = [
  'excellent', 'great', 'strong', 'best', 'perfect', 'ideal',
  'fantastic', 'superb', 'outstanding', 'exceptional', 'preferred'
];

const PENALTY_KEYWORDS = [
  'weak', 'poor', 'bad', 'avoid', 'struggle', 'not good',
  'uncomfortable', 'inexperienced', 'lacks', 'limited'
];

const RESTRICTION_KEYWORDS = [
  'never', 'cannot', 'should not', 'must not', 'do not play',
  'injured', 'unavailable', 'suspended'
];

export function interpretPlayerNotes(playerId: string, notes: string): NotesInterpretation {
  const modifiers: NoteModifier[] = [];
  const warnings: string[] = [];

  if (!notes || notes.trim().length === 0) {
    return { playerId, modifiers, warnings };
  }

  const lowerNotes = notes.toLowerCase();

  // Check for restrictions first
  for (const keyword of RESTRICTION_KEYWORDS) {
    if (lowerNotes.includes(keyword)) {
      modifiers.push({
        type: 'restriction',
        value: -100, // Complete restriction
        reason: `Restricted: "${keyword}" found in notes`
      });
      warnings.push(`Player has restriction keyword: "${keyword}"`);
    }
  }

  // Check for position-specific modifiers
  for (const [position, keywords] of Object.entries(POSITION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerNotes.includes(keyword)) {
        // Check context around the keyword
        const index = lowerNotes.indexOf(keyword);
        const contextStart = Math.max(0, index - 50);
        const contextEnd = Math.min(lowerNotes.length, index + keyword.length + 50);
        const context = lowerNotes.substring(contextStart, contextEnd);

        // Determine if it's a boost or penalty
        let isBoost = false;
        let isPenalty = false;

        for (const boostWord of BOOST_KEYWORDS) {
          if (context.includes(boostWord)) {
            isBoost = true;
            modifiers.push({
              type: 'boost',
              position: position as Position,
              value: 15, // Boost value
              reason: `Boost for ${position}: "${boostWord}" mentioned`
            });
            break;
          }
        }

        for (const penaltyWord of PENALTY_KEYWORDS) {
          if (context.includes(penaltyWord)) {
            isPenalty = true;
            modifiers.push({
              type: 'penalty',
              position: position as Position,
              value: -15, // Penalty value
              reason: `Penalty for ${position}: "${penaltyWord}" mentioned`
            });
            break;
          }
        }

        // If position is mentioned without context, it's a preference
        if (!isBoost && !isPenalty) {
          modifiers.push({
            type: 'preference',
            position: position as Position,
            value: 5, // Small boost for preference
            reason: `Can play ${position}`
          });
        }
      }
    }
  }

  // Check for general positive/negative sentiment
  const positiveWords = ['confident', 'skilled', 'experienced', 'versatile', 'reliable'];
  const negativeWords = ['tired', 'fatigued', 'rusty', 'unfit', 'recovering'];

  for (const word of positiveWords) {
    if (lowerNotes.includes(word)) {
      modifiers.push({
        type: 'boost',
        value: 5,
        reason: `General boost: "${word}" mentioned`
      });
    }
  }

  for (const word of negativeWords) {
    if (lowerNotes.includes(word)) {
      modifiers.push({
        type: 'penalty',
        value: -5,
        reason: `General penalty: "${word}" mentioned`
      });
    }
  }

  return { playerId, modifiers, warnings };
}

export function applyNoteModifiers(
  baseScore: number,
  modifiers: NoteModifier[],
  position?: Position
): number {
  let adjustedScore = baseScore;

  for (const modifier of modifiers) {
    // If modifier is position-specific and doesn't match, skip it
    if (modifier.position && position && modifier.position !== position) {
      continue;
    }

    // Apply restriction
    if (modifier.type === 'restriction') {
      return 0; // Return 0 score for restricted positions
    }

    // Apply boosts and penalties
    adjustedScore += modifier.value;
  }

  // Ensure score doesn't go below 0
  return Math.max(0, adjustedScore);
}

export function getModifierSummary(modifiers: NoteModifier[], position?: Position): string {
  const relevantModifiers = position
    ? modifiers.filter(m => !m.position || m.position === position)
    : modifiers;

  if (relevantModifiers.length === 0) {
    return 'No modifiers';
  }

  const boosts = relevantModifiers.filter(m => m.type === 'boost').length;
  const penalties = relevantModifiers.filter(m => m.type === 'penalty').length;
  const restrictions = relevantModifiers.filter(m => m.type === 'restriction').length;

  const parts: string[] = [];
  if (restrictions > 0) parts.push(`${restrictions} restriction(s)`);
  if (boosts > 0) parts.push(`${boosts} boost(s)`);
  if (penalties > 0) parts.push(`${penalties} penalty(-ies)`);

  return parts.join(', ');
}
