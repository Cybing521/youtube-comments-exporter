# YouTube Comments macOS App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add flat Excel export and a macOS-first PySide6 desktop app for exporting YouTube comments from a link or existing JSON.

**Architecture:** Reuse the existing API/export module, add a workbook writer layer that supports both threaded and flat exports, then build a thin PySide6 presentation shell with a single-window workflow. The UI should stay mac-like and low-friction while all export logic remains testable outside the GUI.

**Tech Stack:** Python 3.9, PySide6, openpyxl, unittest.

---

### Task 1: Add Flat Excel Export Helpers

**Files:**
- Modify: `src/youtube_comments_api.py`
- Modify: `tests/test_youtube_comments_api.py`

**Step 1: Write the failing test**

- Add a unit test for creating a flat workbook structure from exported JSON.

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: FAIL because flat workbook export does not exist.

**Step 3: Write minimal implementation**

- Add reusable workbook writers for:
  - threaded workbook
  - flat workbook

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: PASS.

### Task 2: Extend CLI Outputs

**Files:**
- Modify: `src/youtube_comments_api.py`
- Modify: `scripts/export_video_comments.py`
- Modify: `tests/test_youtube_comments_api.py`

**Step 1: Write the failing test**

- Add a test for writing the flat Excel file from the CLI helpers.

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: FAIL.

**Step 3: Write minimal implementation**

- Add helper paths for threaded Excel and flat Excel outputs.
- Keep existing JSON export behavior intact.

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: PASS.

### Task 3: Create macOS GUI Shell

**Files:**
- Create: `src/mac_app.py`
- Create: `scripts/run_mac_app.py`
- Modify: `tests/test_youtube_comments_api.py`

**Step 1: Write the failing test**

- Add a smoke test that imports the GUI module and builds the main window without crashing.

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: FAIL because GUI module does not exist.

**Step 3: Write minimal implementation**

- Build a single-window PySide6 app.
- Add fields for URL, API key, output folder, and JSON input path.
- Add `Export All` and `Flat Excel From JSON`.

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: PASS.

### Task 4: Apply macOS Visual Design

**Files:**
- Modify: `src/mac_app.py`

**Step 1: Implement the visual pass**

- Add translucent layered panels
- Add refined spacing, hierarchy, and result presentation
- Keep the interface single-window and uncluttered

**Step 2: Smoke test launch**

Run a local launch command and confirm the window opens.

### Task 5: Real Export Verification

**Files:**
- Output: `output/gtEROmL0NzQ.time.comments.flat.xlsx`

**Step 1: Run full export**

Run the exporter for the sample video and generate:
- JSON
- threaded Excel
- flat Excel

**Step 2: Verify row counts**

- Flat Excel rows must equal top-level comments + replies + header

**Step 3: Launch GUI**

- Run the mac app locally and verify basic flow manually.
