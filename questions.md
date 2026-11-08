Here are 10 clarifying questions on the timesheet user story, covering Accuracy and Consistency.

**Accuracy**

1. **How is time that isn't a whole half hour handled?**
   **Priority: Urgent** - core rule of the half-hour feature; blocks any test.
   Time is tracked in half-hour units, but the story doesn't say what happens to 20 or 50 minutes of work. Is it rounded up, rounded down, rounded to the nearest unit, or rejected? Each choice gives a different history.

2. **What counts as a valid amount of time?**
   **Priority: Urgent** - valid input range is needed for boundary tests.
   Is there a minimum, such as 0.5 hours, or is 0 allowed? Is there a maximum per entry or per day, such as 24 hours? Can a value be negative to correct an earlier entry?

3. **When is time tracked: as the work happens, or entered afterwards?**
   **Priority: Later** - affects design, but entry can be built first.
   "Track time" could mean a start/stop timer or entering hours manually later. This affects how exact the recorded time is and whether past dates can be entered or changed.

4. **What is a "project", and who sets up the list?**
   **Priority: Urgent** - project is a required field; its source must be defined.
   Can users type any project name, or do they pick from a list someone else maintains? Free text allows typos like "Proj A" and "Project A", which would split one project's history in two.

5. **How is the time history calculated and shown?**
   **Priority: Later** - display details can follow once entry works.
   "How much time I have spent" could mean a total per project, a breakdown by day or week, or a list of every entry. Are totals shown in hours (for example 3.5) or as a count of half-hour units (7)?

**Consistency**

6. **What does "complete a timesheet" mean compared with one entry?**
   **Priority: Urgent** - defines what 'complete' means, the main acceptance rule.
   Is a timesheet a single entry, or a period (a day or week) holding many entries? If it's a period, must every entry have a project and an amount of time before it counts as complete?

7. **Where is the half-hour rule enforced?**
   **Priority: Later** - matters once more than one entry path exists.
   Does it apply the same way to manual entries, edits, imports and timers? If the rule only exists in the user interface, data could reach the system another way and break it.

8. **Who exactly is "I", and are there any exceptions?**
   **Priority: Urgent** - privacy requirement stated in the story; exceptions must be known.
   "Only I should be able to see my tracked time" conflicts with common needs like a manager approving timesheets, an admin fixing errors, or a project lead seeing totals for their project. Are any other roles allowed to see the data, and is it hidden from them completely?

9. **Why must a project be entered, and does the rule apply to everything?**
   **Priority: Later** - edge case, not in the story's scope yet.
   Is there a valid non-project category such as leave, training or admin? If not, users may log that time against whatever project is closest, which makes project histories wrong and inconsistent.

10. **How should overlapping or duplicate entries be handled?**
   **Priority: Discard** - not implied by the story; out of scope for now.
    If two entries cover the same half hour, whether for the same project or different ones, should the system reject them, merge them, or allow both? Without a rule, the same work could be counted differently depending on how it was entered.