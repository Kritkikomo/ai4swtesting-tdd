const MAX_ENTRY_HOURS = 24; // one entry can't exceed a day
const MAX_TOTAL_HOURS = 24 * 366; // per-project sanity ceiling
const SCALE = 100; // hours are stored as integer hundredths to avoid float drift

class Timesheet {
  // Private so callers can't bypass validation.
  #projects = new Map(); // key -> { name, units }  (units = hundredths of an hour)
  #daily = new Map(); // "employee|date" -> units (only when a date is given)
  #seen = new Set(); // entryIds already applied (idempotency)

  // Same project regardless of case / surrounding or repeated whitespace.
  static #normalize(name) {
    if (typeof name !== 'string') throw new TypeError('projectName must be a string');
    const display = name.trim().replace(/\s+/g, ' ');
    if (!display) throw new RangeError('projectName must not be empty');
    return { key: display.toLowerCase(), display };
  }

  // Reject non-numbers/NaN/Infinity/<=0/>24, and more than 2 decimal places.
  static #toUnits(duration) {
    if (typeof duration !== 'number' || !Number.isFinite(duration)) {
      throw new TypeError('duration must be a finite number');
    }
    if (duration <= 0 || duration > MAX_ENTRY_HOURS) {
      throw new RangeError(`duration must be > 0 and <= ${MAX_ENTRY_HOURS} hours`);
    }
    const units = Math.round(duration * SCALE);
    if (Math.abs(duration * SCALE - units) > 1e-6) {
      throw new RangeError('duration supports at most 2 decimal places');
    }
    return units;
  }

  /**
   * @param {string} projectName
   * @param {number} duration hours, (0, 24], max 2 decimals
   * @param {{date?: string, employee?: string, entryId?: string}} [options]
   *   date (YYYY-MM-DD) + employee enable a 24h/day cap; entryId makes retries idempotent.
   * @returns {true} throws on invalid input instead of returning a false success
   */
  submitTimesheet(projectName, duration, { date, employee = 'default', entryId } = {}) {
    // Validate everything first so a failure never leaves partial state.
    const { key, display } = Timesheet.#normalize(projectName);
    const units = Timesheet.#toUnits(duration);

    let dayKey;
    if (date !== undefined) {
      const d = new Date(`${date}T00:00:00Z`);
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
          Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) {
        throw new RangeError('date must be a valid YYYY-MM-DD');
      }
      dayKey = `${employee}|${date}`;
      if ((this.#daily.get(dayKey) ?? 0) + units > MAX_ENTRY_HOURS * SCALE) {
        throw new RangeError(`more than ${MAX_ENTRY_HOURS} hours on ${date}`);
      }
    }

    if (entryId !== undefined && this.#seen.has(entryId)) return true; // retry: already applied

    const current = this.#projects.get(key);
    const total = (current?.units ?? 0) + units;
    if (total > MAX_TOTAL_HOURS * SCALE) {
      throw new RangeError(`project total would exceed ${MAX_TOTAL_HOURS} hours`);
    }

    // Commit (synchronous, so it is atomic in JS's single-threaded model).
    this.#projects.set(key, { name: current?.name ?? display, units: total });
    if (dayKey) this.#daily.set(dayKey, (this.#daily.get(dayKey) ?? 0) + units);
    if (entryId !== undefined) this.#seen.add(entryId);
    return true;
  }

  // Always a fresh array of [name, hours], sorted by name for stable output.
  getTimesheets() {
    return [...this.#projects.values()]
      .map(({ name, units }) => [name, units / SCALE])
      .sort((a, b) => a[0].localeCompare(b[0]));
  }

  // Always a number: 0 for a project with no entries.
  getTotalTimesheetHours(projectName) {
    const { key } = Timesheet.#normalize(projectName);
    return (this.#projects.get(key)?.units ?? 0) / SCALE;
  }
}

module.exports = Timesheet;
