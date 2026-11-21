# Reproducing my LaTeX workflow in VS Code

This file records workflow customizations that cannot be reproduced by copying
`settings.json` alone. Give this file to GPT/Codex when setting up another computer.
It is a record of the changes documented below, not an export of every VS Code setting.

Location: `.vscode/LATEX_VSCODE_WORKFLOW.md` inside the project. The `.vscode`
folder is hidden in this project's Explorer settings. To open this file, press
Command+P (Control+P on Windows/Linux), enter
`.vscode/LATEX_VSCODE_WORKFLOW.md`, and press Enter.

## Instructions for GPT/Codex on another computer

Read this file and reproduce the documented behavior in the active VS Code profile.
Inspect existing settings and shortcuts first, merge the changes, and preserve
unrelated configuration. Adapt paths and keyboard shortcuts to the operating
system. Verify what was installed and distinguish configuration checks from
behavior actually tested in VS Code.

## Clear old error notifications when saving or recompiling LaTeX

Added: 2026-10-31.

### Functionality

When a LaTeX editor is active, these shortcuts run two commands in sequence:

| macOS shortcut | First command | Second command |
| --- | --- | --- |
| Command+S | Clear existing notifications | Save the current file |
| Command+Option+B | Clear existing notifications | Build with LaTeX Workshop |
| Command+L, then Option+B | Clear existing notifications | Build with LaTeX Workshop |

Saving triggers compilation through the project's existing LaTeX Workshop
`onSave` configuration. If compilation fails again, a fresh error notification
appears. Error popups remain enabled.

Notifications clear **before** saving/building, not in response to a successful
build. This clears all dismissible notifications, including those from other
extensions. Clicking the build button, using the Command Palette, or compiling
through another shortcut does not invoke this workaround. Command+S still only
saves; it relies on build-on-save and does not force a build of an unchanged file.

### Exact files and changes

The change was to the **user keyboard shortcuts file**, not `settings.json`:

```text
/Users/hadarstrauss/Library/Application Support/Code/User/keybindings.json
```

That file did not previously exist. It was created with exactly these entries:

```json
[
    {
        "key": "cmd+s",
        "command": "runCommands",
        "when": "editorLangId == latex && !editorReadonly",
        "args": {
            "commands": [
                "notifications.clearAll",
                "workbench.action.files.save"
            ]
        }
    },
    {
        "key": "cmd+alt+b",
        "command": "runCommands",
        "when": "editorLangId == latex",
        "args": {
            "commands": [
                "notifications.clearAll",
                "latex-workshop.build"
            ]
        }
    },
    {
        "key": "cmd+l alt+b",
        "command": "runCommands",
        "when": "editorLangId == latex",
        "args": {
            "commands": [
                "notifications.clearAll",
                "latex-workshop.build"
            ]
        }
    }
]
```

The following prerequisites were already present in this project's
`.vscode/settings.json` and were not changed by this customization:

```json
{
    "latex-workshop.latex.autoBuild.run": "onSave",
    "latex-workshop.message.error.show": true
}
```

A working LaTeX installation, LaTeX Workshop extension, and suitable build recipe
are also required. The shortcut change does not install or configure the compiler.

### Steps to reproduce

1. Install VS Code and LaTeX Workshop, and confirm the project compiles normally.
2. In VS Code, open the Command Palette and run
   **Preferences: Open Keyboard Shortcuts (JSON)**. This opens the shortcuts file
   for the active profile and avoids assuming a particular filesystem path.
3. Merge the three entries above into its JSON array. Preserve existing entries;
   avoid duplicates and resolve any conflicting shortcuts. Use the supplied
   `cmd` shortcuts on macOS. On Windows/Linux, replace `cmd` with `ctrl`, giving
   `ctrl+s`, `ctrl+alt+b`, and `ctrl+l alt+b`.
4. In the applicable project or user `settings.json`, ensure the two prerequisite
   settings above have those values. Check for workspace overrides. Keep the
   computer's own compiler paths and build recipes.
5. Save the files. VS Code reloads keyboard shortcuts automatically.
6. In a disposable LaTeX document/project, cause a compilation error and confirm
   its notification appears. Fix it, then save using Command+S (Control+S on
   Windows/Linux). The old notification should clear; a successful compilation
   should leave no new error popup. Repeat using the build shortcut. With an
   error still present, confirm a fresh popup appears after the failed build.
   Do not introduce test errors into the user's manuscript.

At initial installation, the three installed entries were checked against the
configuration above, and error popups were confirmed to remain enabled. The
error/fix cycle was not tested interactively in VS Code.

### Undo

Remove these three `runCommands` entries from the active profile's
`keybindings.json`. The normal save/build shortcuts then apply again. Keep any
unrelated shortcuts. This customization did not change `settings.json`.

Reference: [VS Code: running multiple commands with a keyboard shortcut](https://code.visualstudio.com/docs/configure/keybindings#_running-multiple-commands).

## Fast color completion with ordered color choices

Added: 2026-10-31.

### Functionality and files

In this workspace's LaTeX editors, start typing `\c` or `col`, select the
`color{}` snippet, and accept with Tab or Enter. It inserts `\color{teal}`
and immediately opens the snippet choice menu in this order: `teal`, `purple`,
`olive`. Use the arrow keys to choose a color and accept it; Tab advances past
the closing brace. You can also replace the selected color with another name.
The choice menu belongs to this snippet; manually typing `\color{}` does not
invoke it. Other matching completions can still appear.

New workspace file `.vscode/latex.code-snippets`:

```json
{
  "color{}": {
    "scope": "latex",
    "prefix": ["\\color", "color"],
    "body": "\\color{${1|teal,purple,olive|}}$0",
    "description": "Insert \\color{} and choose teal, purple, or olive."
  }
}
```

In `.vscode/settings.json`, the `[latex]` block now sets
`"editor.quickSuggestionsDelay": 10` (milliseconds). This speeds up all LaTeX
quick suggestions in this workspace; extension processing can add latency.
The following existing settings in that same block remain prerequisites:

```json
{
  "editor.quickSuggestions": {
    "other": true,
    "comments": false,
    "strings": true
  },
  "editor.suggestOnTriggerCharacters": true,
  "editor.snippetSuggestions": "top",
  "editor.suggestSelection": "first",
  "editor.acceptSuggestionOnEnter": "on",
  "editor.tabCompletion": "on"
}
```

### Reproduce, verify, and undo

Copy `latex.code-snippets` into the new workspace's `.vscode` directory and
merge the settings above plus `editor.quickSuggestionsDelay: 10` into the
`[latex]` block of its `.vscode/settings.json`. VS Code's built-in snippet
support provides this feature; no new extension is needed. The LaTeX document
still needs a package supporting these colors, such as `xcolor`, to compile.
The files are portable across operating systems.

Configuration verification: both JSON files parse, the snippet is scoped to
LaTeX, and its choice order and 10 ms delay were checked. Interactive behavior
has not been tested in VS Code. To check it, use a disposable LaTeX editor,
type `\col`, accept `color{}`, and confirm the immediate ordered color menu
and Tab exit. Suggestions do not appear automatically in comments.

To undo, remove the `color{}` entry from `.vscode/latex.code-snippets` and the
`editor.quickSuggestionsDelay` entry from `[latex]`; preserve the existing
completion settings and any unrelated snippets added later.

Reference: [VS Code snippets](https://code.visualstudio.com/docs/editing/userdefinedsnippets)
and [IntelliSense settings](https://code.visualstudio.com/docs/editing/intellisense).

## Fast reference command completion

Added: 2026-10-31.

In this workspace's LaTeX editors, type `\ref` (or `ref`) and accept the
`ref{}` snippet with Tab or Enter. It inserts `\ref{}` with the cursor inside
the braces; Tab then advances past the closing brace. Other matching
completions may appear. This snippet inserts the command; label suggestions
remain provided by the existing LaTeX Workshop extension.

Added this entry to the existing workspace `.vscode/latex.code-snippets`,
preserving the color snippet:

```json
{
  "ref{}": {
    "scope": "latex",
    "prefix": ["\\ref", "ref"],
    "body": "\\ref{${1}}$0",
    "description": "Insert \\ref{} with the cursor inside the braces."
  }
}
```

To reproduce, merge this entry into that file and retain the `[latex]`
completion settings documented in the color section above, including the
10 ms quick suggestion delay and snippets at the top. No settings were changed
for this addition. VS Code's built-in snippet support is sufficient; the
snippet file is portable across operating systems. Suggestions are disabled
in comments by the existing settings. Extension processing can add latency.

Verification: both workspace JSON files parse, and the reference snippet's
prefixes, body, scope, and completion prerequisites were checked. Interactive
behavior has not been tested in VS Code. To verify, type `\ref` in a disposable
LaTeX editor, accept `ref{}`, and confirm the cursor is inside the braces and
Tab exits them. To undo, remove only the `ref{}` entry from the snippet file.

## Keeping this file up to date

The personal Codex skill `record-latex-vscode-workflow` instructs Codex to update
this file whenever a requested LaTeX/VS Code workflow customization involves
anything beyond `settings.json`. This includes keyboard shortcuts, extensions,
scripts, tasks, environment changes, and external configuration.

The skill is installed at:

```text
~/.codex/skills/record-latex-vscode-workflow/
```

When migrating, copy this document and that skill directory to the new computer's
Codex skills directory (`$CODEX_HOME/skills`, or `~/.codex/skills` by default).
Update the document path in the skill's `SKILL.md` to the new location. If using
another GPT environment, provide this document directly; a Codex skill is not
automatically installed in other applications.

## Research proposal workspace

Added: 2026-11-04.

Created `/Users/hadarstrauss/Desktop/research_proposal` using the existing empty
folder. Copied this project's entire `.vscode` directory, `.latexmkrc`, and
`.texmf` directory, preserving workspace settings, snippets, dictionary, the
local dollar-pair extension artifact, and project-local TeX packages and Biber.
The copied files were verified byte-for-byte. No manuscript content was copied.

The workspace uses the same VS Code installation and default user profile, so
user settings, keyboard shortcuts, and installed extensions are inherited.
Build recipes and root discovery still expect `A_main.tex`; create the proposal's
main document under that name. Compilation and interactive editor behavior have
not been tested in this empty workspace.

To reproduce on this computer, copy those three paths into an empty project
folder and open that folder in VS Code using the same profile. On another
computer, also reproduce the user-level prerequisites documented above and
adapt the `/Library/TeX/texbin` compiler paths in `.vscode/settings.json`.
To undo, remove the three copied configuration paths from the proposal folder,
preserving any proposal documents subsequently added. The original project's
configuration is unchanged apart from this record entry.
