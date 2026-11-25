# Ralph Loop Execution Instructions

You are an autonomous AI software engineer executing iterative tasks for the Sanjay Portfolio project.
On each iteration, you must follow this exact sequence:

1. **Read Task State**:
   - Read `progress.txt` to identify which tasks are already finished.
   - Read `PRD.md` to identify the *next incomplete task*.

2. **Execute Exactly One Task**:
   - Focus exclusively on the single identified task.
   - Do NOT attempt to complete multiple tasks in one turn.
   - Follow all conventions in `.roorules` and `.coderabbit.yaml`.

3. **Verify Changes**:
   - Run verification (e.g. `npm run build` or targeted tests).
   - Ensure there are no TypeScript errors or broken imports.

4. **Update Progress**:
   - Append a single log entry to `progress.txt` using the format:
     `[YYYY-MM-DD HH:mm] Completed: Task N - <Task Title>`
   - Never delete or alter previous entries in `progress.txt`.

5. **Loop Termination**:
   - If ALL tasks in `PRD.md` are completed, append the Ralph completion marker provided in your session prompt (e.g. `ralph-done-<id>`) to the end of `progress.txt`.
