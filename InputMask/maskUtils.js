function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPatternType(token) {
  if (['#', '0', '9'].includes(token)) return 'digit';
  if (token === 'A') return 'alphanumeric';
  if (token === 'L') return 'alpha';
  if (token === 'X') return 'any';
  return null;
}

function matchesToken(character, pattern) {
  if (!character) return false;
  switch (pattern) {
    case 'digit':
      return /^\d$/.test(character);
    case 'alpha':
      return /^[A-Za-z]$/.test(character);
    case 'alphanumeric':
      return /^[A-Za-z0-9]$/.test(character);
    case 'any':
      return true;
    default:
      return false;
  }
}

function normalizeRawValue(value, mask, placeholderChar) {
  if (!mask) return String(value || '');

  const allowed = new Set(['#', '0', 'A', 'L', 'X', '9']);
  const literals = new Set(Array.from(mask).filter((char) => !allowed.has(char)));
  return Array.from(String(value || ''))
    .filter((char) => !literals.has(char) && char !== placeholderChar)
    .join('');
}

function applyMask(value, mask, placeholderChar = '_', allowOverflow = false) {
  const resolvedMask = String(mask || '').trim();
  if (!resolvedMask) return String(value || '');

  const raw = normalizeRawValue(String(value || ''), resolvedMask, placeholderChar);
  const result = [];
  let index = 0;
  let lastPattern = null;

  for (const token of Array.from(resolvedMask)) {
    const pattern = getPatternType(token);
    if (!pattern) {
      result.push(token);
      continue;
    }
    lastPattern = pattern;

    if (index < raw.length) {
      const current = raw[index];
      if (matchesToken(current, pattern)) {
        result.push(current);
        index += 1;
        continue;
      }

      while (index < raw.length && !matchesToken(raw[index], pattern)) {
        index += 1;
      }

      if (index < raw.length) {
        result.push(raw[index]);
        index += 1;
      } else {
        result.push(placeholderChar);
      }
    } else {
      result.push(placeholderChar);
    }
  }

  if (allowOverflow && lastPattern) {
    for (; index < raw.length; index += 1) {
      if (matchesToken(raw[index], lastPattern)) result.push(raw[index]);
    }
  }

  return result.join('');
}

const MAX_INTERNATIONAL_DIGITS = 15; // E.164 limit

// Returns digits for national numbers, or '+digits' (E.164) when the text contains a '+'.
function normalizePhone(text, placeholderChar = '_') {
  let value = String(text || '');
  if (placeholderChar) value = value.split(placeholderChar).join('');

  const digits = value.replace(/\D/g, '');
  if (value.includes('+')) return `+${digits.slice(0, MAX_INTERNATIONAL_DIGITS)}`;

  // NANP area codes never start with 1, so a leading 1 is the country/trunk prefix.
  return digits.startsWith('1') ? digits.slice(1) : digits;
}

function formatPhone(raw, mask, placeholderChar = '_', allowOverflow = false) {
  const value = String(raw || '');
  if (value.startsWith('+')) return value;
  return applyMask(value, mask, placeholderChar, allowOverflow);
}

module.exports = {
  normalizeRawValue,
  applyMask,
  normalizePhone,
  formatPhone,
  getPatternType,
  matchesToken,
};
