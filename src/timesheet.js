class Timesheet {
  // Hours per project, keyed by project name.
  timesheets = new Map();

  // Minimal on purpose: no validation yet; later tests will drive it.
  submitTimesheet(projectName, duration) {
    if (this.timesheets.has(projectName)) {
      this.timesheets.set(projectName, this.timesheets.get(projectName) + duration);
    } else {
      this.timesheets.set(projectName, duration);
    }
    return true;
  }

  getTimesheets() {
    return [...this.timesheets];
  }

  getTotalTimesheetHours(projectName) {
    return this.timesheets.get(projectName);
  }
}

module.exports = Timesheet;
