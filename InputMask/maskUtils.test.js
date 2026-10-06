const test = require('node:test');
const assert = require('node:assert/strict');
const { applyMask, normalizePhone, formatPhone } = require('./maskUtils.js');

test('applyMask formats a phone number from raw digits', () => {
  assert.equal(applyMask('1234567890', '(###) ###-####', '_'), '(123) 456-7890');
});

test('applyMask strips unsupported chars and preserves custom separators', () => {
  assert.equal(applyMask('12a3-45', '##/##', '_'), '12/34');
});

test('applyMask keeps placeholders for unfilled positions', () => {
  assert.equal(applyMask('', '(###) ###-####', '_'), '(___) ___-____');
  assert.equal(applyMask('12345', '(###) ###-####', '_'), '(123) 45_-____');
});

test('applyMask appends extra digits only when overflow is allowed', () => {
  assert.equal(applyMask('555555555512', '(###) ###-####', '_'), '(555) 555-5555');
  assert.equal(applyMask('555555555512', '(###) ###-####', '_', true), '(555) 555-555512');
});

test('normalizePhone drops letters and the leading 1', () => {
  assert.equal(normalizePhone('1-800-555-1234 x22'), '800555123422');
  assert.equal(normalizePhone('1-800-JUNK'), '800');
});

test('normalizePhone keeps international numbers as +digits', () => {
  assert.equal(normalizePhone('+44 20 7946 0958'), '+442079460958');
  assert.equal(normalizePhone('+1234567890123456789'), '+123456789012345');
});

test('normalizePhone ignores the placeholder and mask literals', () => {
  assert.equal(normalizePhone('(555) 5__-____', '_'), '5555');
});

test('formatPhone masks national numbers and passes international through', () => {
  assert.equal(formatPhone('8005551234', '(###) ###-####', '_'), '(800) 555-1234');
  assert.equal(formatPhone('+442079460958', '(###) ###-####', '_'), '+442079460958');
});
