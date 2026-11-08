class Timesheet {
  // Hours per project, keyed by project name.
  timesheets = new Map();

  // Minimal on purpose: no validation yet; later tests will drive it.
  submitTimesheet(projectName, duration) {
    this.timesheets.set(projectName, duration);
    return true;
  }

  getTimesheets() {
    return [...this.timesheets];
  }
}

module.exports = Timesheet;
