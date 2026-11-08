// Verifies each identified Accuracy/Consistency risk is mitigated.
const Timesheet = require('../src/timesheet');
const mk = () => new Timesheet();

describe('accuracy', () => {
  test.each([[-1], [0], [NaN], [Infinity], ['8'], [null], [undefined]])('rejects duration %p', (d) => {
    expect(() => mk().submitTimesheet('P', d)).toThrow();
  });
  test('rejects string that would concatenate', () => {
    const t = mk(); t.submitTimesheet('P', 5);
    expect(() => t.submitTimesheet('P', '8')).toThrow();
    expect(t.getTotalTimesheetHours('P')).toBe(5);
  });
  test('no floating-point drift', () => {
    const t = mk(); t.submitTimesheet('P', 0.1); t.submitTimesheet('P', 0.2);
    expect(t.getTotalTimesheetHours('P')).toBe(0.3);
  });
  test('rejects >2 decimals', () => expect(() => mk().submitTimesheet('P', 1.001)).toThrow());
  test('caps entry, daily and project totals', () => {
    const t = mk();
    expect(() => t.submitTimesheet('P', 25)).toThrow();
    t.submitTimesheet('A', 20, { date: '2026-01-01' });
    expect(() => t.submitTimesheet('B', 5, { date: '2026-01-01' })).toThrow();
    t.submitTimesheet('B', 5, { date: '2026-01-02' });
    const big = mk();
    for (let i = 0; i < 366; i++) big.submitTimesheet('P', 24);
    expect(() => big.submitTimesheet('P', 1)).toThrow();
  });
  test('rejects bad project names', () => {
    for (const n of [undefined, null, '', '   ', 5]) expect(() => mk().submitTimesheet(n, 1)).toThrow();
  });
  test('rejects invalid dates', () => {
    for (const d of ['2026-02-30', 'x', 20260101]) expect(() => mk().submitTimesheet('P', 1, { date: d })).toThrow();
  });
  test('unknown project totals 0; failed submit changes nothing', () => {
    const t = mk();
    expect(t.getTotalTimesheetHours('nope')).toBe(0);
    expect(() => t.submitTimesheet('P', -1)).toThrow();
    expect(t.getTimesheets()).toEqual([]);
  });
});

describe('consistency', () => {
  test('names are case/whitespace-insensitive', () => {
    const t = mk(); t.submitTimesheet('Alpha', 1); t.submitTimesheet(' alpha ', 2); t.submitTimesheet('ALPHA  ', 3);
    expect(t.getTimesheets()).toEqual([['Alpha', 6]]);
    expect(t.getTotalTimesheetHours('aLpHa')).toBe(6);
  });
  test('internal state is not exposed or mutable', () => {
    const t = mk(); t.submitTimesheet('P', 1);
    expect(t.timesheets).toBeUndefined();
    t.getTimesheets().push(['X', 99]); t.getTimesheets()[0][1] = 99;
    expect(t.getTimesheets()).toEqual([['P', 1]]);
  });
  test('return types are stable', () => {
    const t = mk();
    expect(typeof t.getTotalTimesheetHours('P')).toBe('number');
    expect(Array.isArray(t.getTimesheets())).toBe(true);
  });
  test('retries with the same entryId are idempotent', () => {
    const t = mk(); t.submitTimesheet('P', 2, { entryId: 'e1' }); t.submitTimesheet('P', 2, { entryId: 'e1' });
    expect(t.getTotalTimesheetHours('P')).toBe(2);
  });
  test('output order is independent of submission order', () => {
    const a = mk(), b = mk();
    a.submitTimesheet('B', 1); a.submitTimesheet('A', 2);
    b.submitTimesheet('A', 2); b.submitTimesheet('B', 1);
    expect(a.getTimesheets()).toEqual(b.getTimesheets());
  });
});
