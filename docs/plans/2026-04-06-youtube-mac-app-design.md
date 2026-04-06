# YouTube Comments macOS App Design

**Goal:** Turn the existing YouTube comments exporter into a macOS-only desktop utility that lets non-technical users export JSON, threaded Excel, and flat Excel from a YouTube link or from an existing JSON file.

## Product Direction

- **Audience:** Non-technical macOS users who need a simple "paste link and export" workflow.
- **Primary job:** Export usable data without asking the user to touch terminals, Python, or JSON internals.
- **Aesthetic:** Refined macOS utility, not a generic dashboard.
- **Memorable element:** A calm single-window composition with layered translucent panels, soft paper-white gradients, and restrained glass surfaces that feel like a native Apple utility rather than a browser mockup.

## UX Scope

### Main flow

1. User opens the app.
2. User pastes a YouTube URL.
3. User optionally pastes an API key.
4. User chooses an output folder.
5. User clicks one export action.
6. App writes:
   - full JSON
   - threaded Excel
   - flat Excel
7. App shows counts, output paths, and completion state.

### Secondary flow

1. User opens an existing exported JSON.
2. User chooses an output folder.
3. User exports only the flat Excel.

## UI Layout

Single window, fixed mac-first layout:

- **Title band:** app name, soft status chip, one-line description
- **Primary input block:** URL field, API key field, output-folder picker
- **Action rail:** `Export All` as primary action, `Flat Excel From JSON` as secondary action
- **Results block:** top-level comments, replies, total comments, coverage estimate, generated file paths
- **Activity strip:** compact textual log for progress and errors

The layout stays single-column and calm. No modal wizard. No side navigation. No tabs.

## Visual Design

- **Theme:** warm light, stone-white and mist-blue tinted neutrals
- **Glass usage:** only on major grouped surfaces and toolbar band; avoid overusing blur on every control
- **Typography:** elegant serif-leaning display for title paired with readable body UI font
- **Controls:** rounded but not toy-like; subtle inset highlights, low-contrast shadows, strong focus rings
- **Motion:** quick fade/slide on status changes and export completion; no decorative bounce

## Technical Direction

- **Framework:** PySide6
- **Packaging target:** macOS app bundle later; first implementation can run as a Python desktop app
- **Core data layer:** reuse current `src/youtube_comments_api.py`
- **New export layer:** add reusable flat Excel writer alongside current workbook export
- **App module:** separate GUI entry point and presentation layer from export logic

## Error Handling

- Empty URL -> inline validation
- Missing API key -> inline validation
- Export/network failure -> readable error strip, no crash dialog dump
- Existing JSON shape mismatch -> explain what file is expected

## Validation

- Unit tests for flat Excel generation
- Smoke test for GUI launch
- Real export against the sample video
- Real flat Excel output row counts must match JSON counts

## Success Criteria

- Non-technical mac user can export without touching terminal commands
- Flat Excel is generated and verified
- Sample video still exports with `time` ordering and near-page coverage
