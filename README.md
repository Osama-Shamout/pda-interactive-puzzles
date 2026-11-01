# PDA Retro Desktop

**A 1990s-style desktop operating system that runs in the browser, built as the interactive layer of [Private Detective Agency](https://pdacases.com) detective game cases.**

Players investigating a PDA case "log in" to a suspect's old computer. They read the mail, dig through case files and the recycle bin, and crack the passcode on a locked archive to move the investigation forward. The whole thing is plain HTML, CSS and JavaScript: no frameworks, no build step and no backend.

🔗 **Live product:** [pdacases.com](https://pdacases.com)

<!-- Add a GIF here: record 10–15 s of opening windows, dragging them, and unlocking the archive -->
<!-- ![PDA Retro Desktop demo](docs/demo.gif) -->

---

## Features

| Area | What it does |
|---|---|
| **Window manager** | Open, focus, drag, minimize, maximize and close multiple windows, with z-index stacking and a live taskbar |
| **Start menu & desktop** | Desktop icons, a start menu and a running clock, built with real `button` elements and ARIA labels on the inputs |
| **Built-in apps** | My Computer, Case Files, Notepad, Calculator, Mail client with an inbox and message view, Recycle Bin, About / Readme |
| **Puzzle mechanics** | A passcode-locked archive that unlocks new evidence, plus clues hidden across mail, files and deleted items |
| **Bilingual UI** | Full English / Arabic switching at runtime through an i18n dictionary, with right-to-left support |
| **Safe rendering** | User-facing strings go through an HTML-escape helper before they reach the DOM |

## Tech stack

- **Vanilla JavaScript (ES6+)**: about 1,000 lines with no dependencies
- **CSS3**: a retro look recreated with bevels, pixel borders and a system font stack
- **HTML5**: a semantic shell; every window is generated at runtime

## How it works

```
index.html      → desktop shell: icons, start menu, taskbar
script.js       → window manager, apps, i18n, puzzle state
style.css       → retro theme
```

- `makeWindow()` builds each window from a template. `focusWindow()`, `minimizeWindow()` and `toggleMax()` manage the window state, and `makeDraggable()` handles moving windows with pointer events.
- Each app (`openMail`, `openArchive`, `openCases`, …) is a self-contained function that renders its window and binds its own events.
- `setLanguage()` swaps the whole UI between English and Arabic and redraws any window that's open.

## Run locally

```bash
git clone https://github.com/Osama-Shamout/pda-retro-desktop.git
cd pda-retro-desktop
# open index.html in any modern browser. No install needed.
```

## Roadmap

More puzzles from PDA cases will be added to this repository:

- [ ] Piano puzzle
- [ ] Star-box puzzle
- [ ] Interactive story mode

## Author

**Osama Shamout**: co-founder and lead developer, Private Detective Agency
[GitHub](https://github.com/Osama-Shamout) · [osama.shamout.it@gmail.com](mailto:osama.shamout.it@gmail.com)

## License

© 2026 Private Detective Agency (PDA). All rights reserved.
This repository is published so the code can be viewed as part of a portfolio. The code, puzzle content, story and assets belong to Private Detective Agency. Copying, redistributing or reusing them commercially requires written permission.
