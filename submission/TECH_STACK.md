# Technology Stack

| Technology | Role |
|---|---|
| Next.js App Router | Full-stack application framework and routing |
| React | Interactive user interface |
| TypeScript | Static typing |
| Tailwind CSS | Responsive styling |
| Google Gemini API | Study explanations, revision notes, and quiz generation |
| @google/genai | Official Google Gen AI JavaScript SDK |
| Mammoth | DOCX text extraction |
| pdf-parse | PDF text extraction |
| Zod | Request and model-output validation |
| Vercel | Hosting and deployment |
| GitHub | Source control and collaboration |

## Architecture decisions

- AI provider requests run only in server-side route handlers.
- The Gemini API key is stored in environment variables and never exposed to the browser.
- Uploaded documents are parsed in a Node.js route handler.
- The first version keeps study material in the active browser session rather than claiming persistent cloud storage.
- Structured quiz output is validated before it is rendered or used for scoring.
- OCR, accounts, database persistence, and advanced retrieval are future enhancements, not assumed MVP capabilities.
