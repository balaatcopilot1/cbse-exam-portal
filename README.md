# Class 12 Exam Portal

A simple static exam portal for Class 12 Physics, Chemistry and Maths.

## Features

- Subject selection
- Multiple question sets
- One question per page
- Previous / Next navigation
- Question navigator
- Score calculation
- Correct / wrong / unanswered counts
- Answer review with explanations
- MathJax support for LaTeX mathematical notation
- Works well on desktop and mobile
- No backend required for the first version

## Important: run through a web server

Because the app loads JSON files using `fetch()`, opening `index.html` directly with `file://` may be blocked by the browser.

For local testing with Python:

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000

## Adding a new question set

1. Create a JSON file in the appropriate subject folder.
2. Follow the structure of the sample JSON files.
3. Add the file to `sets.json`.
4. Push the changes to GitHub.

## JSON structure

```json
{
  "title": "Chapter - Set 1",
  "subject": "Physics",
  "questions": [
    {
      "question": "Question text with optional $LaTeX$",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Short explanation.",
      "topic": "Topic"
    }
  ]
}
```

`answer` is zero-based:

- 0 = A
- 1 = B
- 2 = C
- 3 = D

## GitHub Pages

Upload the entire folder to a GitHub repository and enable GitHub Pages using the repository's main branch/root folder.

The site can then be opened from the GitHub Pages URL.
