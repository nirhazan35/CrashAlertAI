function ensureLocalDate(value) {
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return value;

  const rx = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?([+-]\d{2}:?\d{2}|Z)?$/;
  const m = value.match(rx);
  if (!m) throw new Error(`ensureLocalDate: "${value}" is not ISO-8601`);

  const [, y, mo, d, h, mi, s, frac = ''] = m;
  const ms = Math.round(parseFloat(`0${frac}`) * 1000);

  return new Date(+y, +mo - 1, +d, +h, +mi, +s, ms);
}

module.exports = ensureLocalDate;