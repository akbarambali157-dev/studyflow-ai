# STUDYFLOW AI

> **Your personal AI-powered learning workspace.**  
> Turn lecture materials into understandable explanations, focused revision notes, quizzes, and exam-style practice.

[![Built with Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)
[![AI-Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=googlegemini)](https://ai.google.dev/)

---

## 1. Project overview

STUDYFLOW AI is a web-based learning workspace designed to help students turn course materials into practical study resources. A student can provide lecture notes, choose a learning task, and receive an AI-generated result grounded in the supplied material.

The product is intended to support active learning rather than simply provide a generic chatbot. Its workflow starts with the student's own course content and turns that content into different learning formats:

- **Understand:** explain difficult topics in clearer language.
- **Condense:** create structured revision notes without casually discarding examinable ideas.
- **Practise:** generate objective questions and exam-style practice.
- **Ask:** ask follow-up questions about the material.

### Problem

Students often have lecture materials spread across PDFs, Word documents, and text files. These materials may be long, dense, inconsistently structured, or difficult to revise from. Creating summaries and practice questions manually takes time that students could spend understanding and practising the material.

### Proposed solution

STUDYFLOW AI provides one workspace for importing study material and transforming it into useful learning activities. The AI should use the supplied document as its primary source, clearly distinguish source-based answers from general background information, and avoid inventing facts or pretending that unsupported details came from the lecture note.

### Intended users

- University and college students.
- Secondary-school students using teacher-provided materials.
- Independent learners organising their own study resources.

### Product principles

1. **Source-aware:** prefer the student's uploaded material over unsupported general answers.
2. **Learning-first:** explain reasoning, not just return an answer.
3. **Honest:** disclose when the source does not contain enough information.
4. **Usable:** keep the interface simple, responsive, and accessible.
5. **Secure:** never expose provider API keys in browser code or commit secrets.
6. **Incremental:** ship a working, testable MVP before adding complex account or storage systems.

---

## 2. Product scope and feature requirements

The following describes the intended product behaviour. The implementation status is tracked separately in [Section 14](#14-implementation-status).

### 2.1 Dashboard

The dashboard is the entry point to the workspace.

**Expected behaviour**
- Introduce STUDYFLOW AI and explain its main value in one sentence.
- Provide clear entry points to Smart Notes, Revision Studio, Quiz Generator, Practice Exams, and Study Chat.
- Show a useful empty state when no study material has been added.
- Show the current document or study session when one exists.
- Work on mobile, tablet, and desktop screen sizes.

**Acceptance criteria**
- A first-time visitor can understand what the product does without reading documentation.
- Every visible navigation item leads to a real page or is clearly marked as not yet available.
- No dashboard card should imply that a feature is complete when it is only planned.

### 2.2 Smart Notes — document import and explanation

**Supported formats planned for MVP**
- PDF
- DOCX
- TXT

**Expected workflow**
1. Student selects or drops a file.
2. The app validates file type and size.
3. Text is extracted from the document.
4. The student can inspect the extracted text or a preview.
5. The student chooses a topic or asks for an explanation.
6. The server sends the relevant source text and task instructions to Gemini.
7. The result is displayed in a readable format.

**Requirements**
- Handle empty, corrupt, scanned, password-protected, and unsupported files gracefully.
- Explain that image-only/scanned PDFs may need OCR; do not silently claim that text was extracted when it was not.
- Keep document processing bounded by file-size and text-length limits.
- Avoid sending unrelated document contents when a smaller relevant excerpt is sufficient.
- Never execute uploaded content. Treat it as untrusted data.

**Acceptance criteria**
- A valid text-based document produces extracted text.
- An unsupported or unreadable document produces a helpful error.
- The UI shows a loading state while processing.
- The user can see which document is being used for the current task.

### 2.3 Simplifier — explain difficult concepts

**Inputs**
- Extracted lecture text.
- Optional topic or selected passage.
- Optional preferred explanation level (for example: simple, standard, or detailed).

**Output**
- A clear explanation.
- Important terms and their meanings.
- A small example where useful.
- A short recap.
- A source-grounding note when the answer uses only part of the uploaded material.

**Quality rules**
- Preserve the meaning of the source.
- Define technical terms before relying on them.
- Do not invent quotations, page references, or lecturer claims.
- If the source is ambiguous, say so.

### 2.4 Revision Studio — concise revision notes

**Inputs**
- Source document text.
- Optional topic or chapter.
- Optional target length.

**Output**
- Topic headings.
- Definitions and key concepts.
- Important lists, processes, dates, formulas, or distinctions found in the source.
- Short explanations that retain the original meaning.
- A final quick-revision checklist.

**Quality rules**
- Concise does not mean incomplete.
- Preserve named concepts and important distinctions.
- Do not add facts that are not supported by the source without labelling them as background.
- Do not promise that a generated note guarantees a particular exam result.

### 2.5 Quiz Generator — objective questions

**Inputs**
- Source text or selected topic.
- Number of questions.
- Difficulty.
- Question style (initially multiple choice).

**Output per question**
- Question statement.
- Four answer options labelled A–D.
- Correct answer.
- Short explanation.
- Optional indication of the source topic being tested.

**Requirements**
- Ensure exactly one best answer for ordinary single-answer MCQs.
- Avoid duplicate questions and ambiguous options.
- Randomise option order only if the correct-answer mapping is updated with it.
- Do not reveal answers before the student submits an answer in interactive quiz mode.
- Validate model output before rendering it.

### 2.6 Practice Exams — assessment simulation

**Planned workflow**
1. Student selects material, question count, and duration.
2. The app generates or loads a validated question set.
3. Student answers questions.
4. A timer displays remaining time.
5. Student submits the attempt.
6. The app calculates the score from the validated answer key.
7. The result page shows corrections and explanations.

**Important distinction**
The timer is a user-interface feature, not a secure proctoring system. Do not describe the product as invigilating, monitoring, or preventing cheating.

**Acceptance criteria**
- Answers persist while the attempt is active.
- Submission calculates the score using the answer key, not a new AI judgement.
- A submitted attempt cannot accidentally be submitted twice.
- Timeout behaviour is predictable and explained.
- The result page gives useful explanations, not only a percentage.

### 2.7 Study Chat — ask questions about uploaded notes

**Expected behaviour**
- Student asks a question about the active document.
- The server supplies relevant document context to Gemini.
- The answer prioritises the uploaded material.
- If the answer is not in the source, the assistant says so clearly.
- The student can ask follow-up questions within the current session.

**MVP limitation**
Unless a persistence layer is deliberately added, document context and chat history may exist only in the current browser session. Do not imply that a student's files are permanently saved or synchronised across devices.

---

## 3. Technology stack

| Layer | Choice | Responsibility |
|---|---|---|
| Framework | Next.js App Router | Full-stack React application and routing |
| Language | TypeScript | Typed application code |
| UI | React | Interactive interface |
| Styling | Tailwind CSS | Responsive styling and design system |
| Components | shadcn/ui (where useful) | Accessible, reusable interface primitives |
| AI provider | Google Gemini API | Explanations, revision notes, quizzes, and study chat |
| AI SDK | Official Google Gen AI SDK | Server-side model requests |
| PDF extraction | pdf-parse | Extract text from text-based PDFs in the Node.js route |
| DOCX extraction | Mammoth | Extract text from Word documents |
| Validation | Zod | Validate API inputs and structured model outputs |
| Deployment | Vercel | Hosting, server-side functions, and preview deployments |
| Source control | GitHub | Version control and coding-agent collaboration |

### Why this stack?

Next.js provides the UI and server-side API routes in one repository. This avoids maintaining a separate backend service for the initial product. Vercel has first-class Next.js deployment support and can automatically create preview deployments from Git branches and pull requests.

The Gemini key and model calls belong on the server. The browser should call our own API routes, never the Gemini API directly with a private key.

**Official references**
- [Next.js documentation](https://nextjs.org/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Vercel deployment documentation](https://vercel.com/docs/deployments)
- [Google Gemini API documentation](https://ai.google.dev/gemini-api/docs)
- [Zod documentation](https://zod.dev/)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)

---

## 4. High-level architecture

```text
┌──────────────────────────────────────────────────────────┐
│                       STUDENT                             │
│             Browser / Mobile / Desktop                    │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                 NEXT.JS FRONTEND                          │
│  Dashboard │ Smart Notes │ Revision │ Quiz │ Chat         │
│  React components, forms, loading and error states        │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTPS request
                           ▼
┌──────────────────────────────────────────────────────────┐
│                NEXT.JS ROUTE HANDLERS                      │
│  Validate input → enforce limits → build prompt           │
│  → call AI provider → validate output → return response   │
└──────────────────────────┬───────────────────────────────┘
                           │ Server-side only
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   GOOGLE GEMINI API                       │
│       Explanation │ Summary │ Quiz │ Study Q&A            │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                 VALIDATED RESPONSE                        │
│       Structured result returned to the frontend          │
└──────────────────────────────────────────────────────────┘
```

### Request lifecycle

1. The browser collects the task input and document text or an uploaded file.
2. The browser sends a request to a Next.js Route Handler.
3. The route validates the request with a schema.
4. The route checks size limits and required configuration.
5. The server builds a task-specific prompt.
6. The server calls Gemini using a private environment variable.
7. The server validates and normalises the model response.
8. The route returns a predictable JSON response.
9. The UI renders the result or a clear error state.

### Security boundaries

- `GEMINI_API_KEY` is server-only. Never prefix it with `NEXT_PUBLIC_`.
- Never commit `.env.local`, access tokens, credentials, or real student documents.
- Treat uploaded files and their extracted text as untrusted user input.
- Validate request bodies and file metadata on the server.
- Enforce file-size, text-length, question-count, and request limits.
- Do not render model-generated HTML as trusted markup.
- Avoid logging full document contents or API keys.
- Do not claim a document is private, encrypted at rest, or permanently deleted unless the implementation actually provides those guarantees.

---

## 5. Planned repository structure

The structure below is the target organisation. It may evolve as implementation decisions are made; update this section whenever files are added, moved, or removed.

```text
studyflow-ai/
├── app/
│   ├── (workspace)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── notes/
│   │   │   └── page.tsx
│   │   ├── revision/
│   │   │   └── page.tsx
│   │   ├── quiz/
│   │   │   └── page.tsx
│   │   ├── practice/
│   │   │   └── page.tsx
│   │   └── chat/
│   │       └── page.tsx
│   ├── api/
│   │   ├── ai/
│   │   │   └── route.ts
│   │   └── health/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/
│   ├── documents/
│   ├── study/
│   ├── layout/
│   └── ui/
├── hooks/
├── lib/
│   ├── ai/
│   │   ├── client.ts
│   │   ├── prompts.ts
│   │   ├── schemas.ts
│   │   └── tasks.ts
│   ├── documents/
│   │   ├── extract.ts
│   │   └── validation.ts
│   ├── utils.ts
│   └── constants.ts
├── types/
├── public/
├── tests/
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── README.md
└── submission/
    ├── PROJECT_DESCRIPTION.md
    ├── TECH_STACK.md
    └── DEMO_SCRIPT.md
```

### Directory responsibilities

- `app/`: route pages, layouts, and server API handlers.
- `components/`: reusable visual components. Keep components focused and avoid giant page components.
- `hooks/`: reusable client-side state and interaction hooks.
- `lib/ai/`: Gemini client, prompt templates, task orchestration, and validation schemas.
- `lib/documents/`: file validation and text extraction.
- `types/`: shared TypeScript types where they improve clarity.
- `tests/`: unit and integration tests.
- `submission/`: hackathon-facing project description and demo material.

Do not create empty layers merely to match this diagram. Add abstractions when they have a clear purpose.

---

## 6. Environment variables

Create a local `.env.local` file. Use `.env.example` as the template.

| Variable | Required | Purpose |
|---|---:|---|
| `GEMINI_API_KEY` | Yes for live AI features | Private Gemini API key |
| `GEMINI_MODEL` | Recommended | Model identifier selected for the project |
| `NEXT_PUBLIC_APP_URL` | Optional | Public application URL for metadata or absolute links |

Example:

```bash
GEMINI_API_KEY=replace_with_your_key
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The model name is configurable. Before changing it, verify that the selected model is available to the project's API key and supports the required generation features.

**Never put a real key in this README, source code, screenshots, commits, issue reports, or browser-exposed variables.** If a key is accidentally committed, revoke it and create a replacement; deleting it in a later commit is not sufficient.

When the key is missing, the application should still render its interface and show a clear setup message when the user tries an AI action. It should not crash during page load.

---

## 7. Local development setup

### Prerequisites

- Node.js version supported by the installed Next.js release.
- npm (or the package manager selected by the lockfile).
- Git.
- A Gemini API key for live AI functionality.

### Setup

```bash
git clone https://github.com/akbarambali157-dev/studyflow-ai.git
cd studyflow-ai
npm install
```

Create `.env.local` in the project root and add the environment variables described above.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Before pushing changes

Run the checks that exist in `package.json`:

```bash
npm run lint
npm run typecheck
npm run build
```

If a script is not defined, do not assume it ran. Add the appropriate script and test configuration as part of the implementation.

---

## 8. AI integration design

### Server-side provider client

The initial implementation currently lives in `lib/ai.ts`. If the AI layer grows, it can be split into modules such as `lib/ai/client.ts`, `lib/ai/prompts.ts`, and `lib/ai/schemas.ts`. The provider client should:
- Read the API key from server environment variables.
- Fail with a helpful configuration error when the key is missing.
- Avoid creating a new client for every small helper call when reuse is appropriate.
- Keep provider-specific code isolated from UI components.

### Task-specific prompt design

Keep prompts in `lib/ai/prompts.ts` or a similarly clear module. Avoid scattering long prompt strings across page components.

Each task prompt should define:
- The task and intended student audience.
- The supplied source material.
- Output format and length constraints.
- Grounding rules.
- A clear instruction to report insufficient source information.
- A prohibition on fabricating quotations, page numbers, or citations.

### Structured output

Prefer structured JSON for quizzes and practice exams. Validate the response with Zod before using it.

For example, a multiple-choice question should have a stable ID, question text, four options, a correct option key, and an explanation. The exact schema belongs in the code and should be shared by generation, UI rendering, scoring, and tests.

Do not trust model output merely because it looks like JSON. Parse it, validate it, handle malformed responses, and show a recoverable error when validation fails.

### Context and token management

- Set a maximum upload size and maximum extracted-text length.
- For long documents, split text into bounded chunks.
- Keep a clear association between chunks and their source document.
- Retrieve or select only relevant chunks for a question when feasible.
- Do not silently truncate a document and then imply the entire document was analysed.
- Tell the student when only part of a long document was included.
- Keep prompts focused; do not send the same large context repeatedly when a smaller excerpt is enough.

### AI reliability

AI-generated material can contain errors. The interface should encourage students to compare important facts with their original course material. Quiz answer keys should be validated for completeness and consistency before scoring.

---

## 9. API contract and error handling

The initial implementation exposes two routes:

- `POST /api/documents`: multipart form upload with a `file` field. Accepts PDF, DOCX, and TXT files up to 8 MB and returns extracted text, filename, character count, and a truncation flag. The extraction limit is 80,000 characters.
- `POST /api/ai`: JSON task request. Supported task values are `explain`, `summarise`, `quiz`, and `chat`.

### AI request

```json
{
  "task": "explain",
  "sourceText": "The lecture material goes here...",
  "topic": "Core concept",
  "questionCount": 8,
  "difficulty": "medium",
  "question": ""
}
```

Fields:
- `task`: required task identifier.
- `sourceText`: required source text, between 30 and 80,000 characters.
- `topic`: optional topic or focus area.
- `questionCount`: optional quiz length, 3–20; defaults to 8.
- `difficulty`: optional `easy`, `medium`, or `hard`; defaults to `medium`.
- `question`: optional student question, required in practice for the `chat` task.

### Success response

```json
{
  "success": true,
  "data": {
    "task": "explain",
    "result": "Generated learning material"
  }
}
```

For the `quiz` task, `result` is a structured object containing a title and validated multiple-choice questions. For other tasks, `result` is text.

### Error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Check your study material and request, then try again."
  }
}
```

Suggested error categories:
- `VALIDATION_ERROR`: malformed or incomplete request.
- `FILE_TYPE_UNSUPPORTED`: unsupported document format.
- `FILE_TOO_LARGE`: configured size limit exceeded.
- `TEXT_EXTRACTION_FAILED`: file could not be read.
- `AI_NOT_CONFIGURED`: missing provider key.
- `AI_PROVIDER_ERROR`: provider request failed.
- `AI_OUTPUT_INVALID`: response failed schema validation.
- `RATE_LIMITED`: request limit reached (rate limiting is not implemented yet).
- `INTERNAL_ERROR`: unexpected server error.

Do not return stack traces, secret values, or raw provider credentials to the browser.

## 10. Document processing requirements

### PDF

Use a maintained PDF text extraction library compatible with the chosen Next.js runtime. Confirm that the selected package works in the Vercel Node.js function environment. Do not assume a browser-only PDF worker can run inside a server route without configuration.

### DOCX

Mammoth can extract text from DOCX files. Treat the result as plain text for AI processing. Do not render arbitrary uploaded document HTML as trusted application HTML.

### TXT

Decode as UTF-8 where possible. Handle empty content and unexpected encodings gracefully.

### Scanned PDFs

A scanned PDF may contain page images but no selectable text. The MVP should detect the absence of useful extracted text and explain the limitation. OCR can be added later as a separate feature with explicit cost, privacy, and processing decisions.

### Upload safety

- Validate extension and MIME type, but do not rely on either alone.
- Enforce a strict maximum file size.
- Do not persist uploaded files unless a storage feature is deliberately implemented.
- Do not execute macros, scripts, or embedded content.
- Avoid logging uploaded text.
- Clear temporary client state when the user removes a document or starts a new session.

---

## 11. UI and experience guidelines

The application should feel like a focused modern learning product, not a generic chatbot clone.

### Design direction

- Clear visual hierarchy and readable typography.
- Calm, consistent colour system.
- Strong spacing and alignment.
- Responsive dashboard and navigation.
- Accessible contrast and visible keyboard focus.
- Consistent buttons, inputs, cards, dialogs, and alerts.
- Useful empty, loading, success, and error states.
- Avoid unnecessary animations and excessive gradients.
- Avoid decorative metrics that imply real usage data when none exists.

### Interaction standards

- Every button must perform its stated action.
- Disable submit controls while a request is in progress.
- Prevent accidental duplicate submissions.
- Keep error messages close to the affected action.
- Preserve user input when a recoverable request fails.
- Confirm destructive actions such as clearing a session.
- Make quiz answer feedback understandable and accessible.

---

## 12. Vercel deployment

Vercel is the intended hosting platform. The repository should be compatible with Vercel's standard Next.js detection; do not add custom deployment configuration unless the application needs it.

### Git-based deployment

1. Sign in to Vercel.
2. Import `akbarambali157-dev/studyflow-ai`.
3. Confirm that Vercel detects Next.js.
4. Add the required environment variables in Project Settings.
5. Deploy.
6. Open the generated deployment URL and test the application.
7. Add a custom domain later if desired.

### Environment configuration

Set `GEMINI_API_KEY` and `GEMINI_MODEL` in Vercel's project environment settings. Configure the variables for the environments where they are needed (Preview and Production, as appropriate). Redeploy after changing environment variables when required.

### Preview and production workflow

- Feature branches and pull requests should be tested through Preview deployments.
- The production branch should contain reviewed, buildable code.
- Do not merge a change just because the preview page loads; test the actual AI workflow and error states.
- Inspect Vercel build logs when a deployment fails.

### Deployment verification checklist

- [ ] Build completes successfully.
- [ ] Landing page loads on desktop and mobile.
- [ ] No private API key appears in browser source or network responses.
- [ ] Missing-key state is understandable.
- [ ] AI request succeeds with a configured key.
- [ ] Invalid requests return safe errors.
- [ ] PDF and DOCX extraction work in the deployed runtime.
- [ ] Long documents are bounded safely.
- [ ] No local-only file path assumptions exist.
- [ ] Preview and production environment variables are configured correctly.

Useful documentation: [Vercel + Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs) and [Vercel deployments](https://vercel.com/docs/deployments).

---

## 13. Testing and quality strategy

### Unit tests

Prioritise tests for:
- File type and size validation.
- Text extraction helpers.
- Prompt construction.
- Zod schemas for model outputs.
- Quiz scoring and answer-key mapping.
- Text chunking and length limits.
- Error normalisation.

### Integration tests

Test:
- API request validation.
- Missing Gemini key behaviour.
- Provider error handling.
- Invalid model output handling.
- Successful structured quiz generation using a mocked provider response.

### Manual end-to-end checks

1. Open the app with no API key and confirm the UI remains usable.
2. Upload a short PDF with selectable text.
3. Generate an explanation from the extracted material.
4. Generate revision notes.
5. Generate a multiple-choice quiz.
6. Answer questions and confirm scoring.
7. Ask a question not covered by the document and confirm the app does not pretend the source contains the answer.
8. Try an unsupported or unreadable file and confirm a useful error appears.
9. Repeat the key flow on a narrow mobile viewport.

### Quality gates

Before considering the MVP ready:
- TypeScript has no unexplained errors.
- Lint passes.
- Production build passes.
- Core flows have been manually tested.
- Secrets are absent from the repository.
- README status matches the actual implementation.

---

## 14. Implementation status

This table is the source of truth for project progress. Update it whenever code is added or verified.

| Area | Status | Notes |
|---|---|---|
| Repository | Created | Public GitHub repository |
| Product specification | Documented | This README and submission notes |
| Next.js application scaffold | Implemented, unverified | App Router, TypeScript, Tailwind CSS 4 configuration and root page are committed |
| Responsive dashboard | Implemented, unverified | Initial responsive workspace UI is committed |
| Document upload | Implemented, unverified | Upload UI and 8 MB server-side limit are committed |
| PDF text extraction | Implemented, unverified | Uses pdf-parse; must be tested in local and Vercel Node runtimes |
| DOCX text extraction | Implemented, unverified | Uses Mammoth raw-text extraction |
| Gemini server integration | Implemented, unverified | Server route and @google/genai integration committed; requires a real key to test |
| Simplifier | Implemented, unverified | Task prompt and UI flow committed |
| Revision Studio | Implemented, unverified | Task prompt and UI flow committed |
| Quiz Generator | Implemented, unverified | JSON generation, Zod validation, interactive answer selection and scoring committed |
| Practice Exams | Pending | Dedicated timed exam flow remains future work |
| Study Chat | In progress | Single-turn document-grounded question flow committed; multi-turn history is not implemented |
| Automated tests | Pending | Test suite and CI checks still need to be added and run |
| Vercel deployment | Pending | Repository is not yet connected/deployed to Vercel |
| Hackathon demo | Pending | Requires API key, deployment, and end-to-end verification |

**Status definitions**
- **Pending:** not implemented.
- **In progress:** implementation has started but is not complete.
- **Implemented:** code exists, but may not have been fully verified.
- **Verified:** acceptance criteria have been tested successfully.
- **Blocked:** progress depends on an external requirement or unresolved decision.

Do not mark a feature Verified solely because its page renders.

---

## 15. Development roadmap

### Phase 1 — Foundation
- [x] Create the Next.js App Router project.
- [x] Configure TypeScript, Tailwind CSS, and lint configuration (verify with install/build).
- [x] Create the shared application layout and initial responsive navigation.
- [x] Build the initial dashboard and empty states.
- [ ] Add environment variable validation.

### Phase 2 — Document pipeline
- [x] Add PDF, DOCX, and TXT upload validation.
- [x] Implement initial PDF, DOCX, and TXT text extraction.
- [ ] Add text preview and document removal.
- [ ] Enforce size and extracted-text limits.
- [ ] Test document processing locally and on Vercel.

### Phase 3 — AI foundation
- [x] Add the server-only Gemini client.
- [x] Add initial task-specific prompt templates.
- [x] Add request and quiz response schemas.
- [ ] Add safe error handling and loading states.
- [ ] Verify that the key never reaches the client.

### Phase 4 — Learning tools
- [ ] Implement Simplifier.
- [ ] Implement Revision Studio.
- [ ] Implement Quiz Generator.
- [ ] Implement Practice Exams and deterministic scoring.
- [ ] Implement Study Chat.

### Phase 5 — Quality and presentation
- [ ] Test all core user journeys.
- [ ] Improve accessibility and responsive layouts.
- [ ] Add useful example content for the demo.
- [ ] Write the hackathon project description.
- [ ] Record or prepare a short product demonstration.
- [ ] Deploy and verify the Vercel production URL.

### Later enhancements (not MVP blockers)
- User accounts and saved study workspaces.
- Database-backed document metadata and study history.
- Persistent flashcards and spaced repetition.
- OCR for scanned lecture notes.
- Retrieval-augmented generation for very large documents.
- Export revision notes to PDF.
- Collaborative study groups.
- Usage analytics with appropriate privacy controls.

Do not begin these enhancements until the core upload → understand → revise → practise journey is reliable.

---

## 16. Coding-agent handover guide

This section is intended for any future coding agent working in GitHub Codespaces or another development environment.

### First actions for a new agent

1. Read this README completely before editing.
2. Inspect the actual repository tree and current Git status.
3. Read `package.json`, environment examples, app routes, and existing tests.
4. Compare the actual code against the implementation-status table.
5. Run the existing lint, typecheck, test, and build commands.
6. Identify the smallest useful next task from the roadmap.
7. Make changes that fit the existing architecture instead of replacing working code unnecessarily.

### Non-negotiable engineering rules

- Keep Gemini API calls on the server.
- Never expose secrets through `NEXT_PUBLIC_*` variables.
- Never commit real environment files or API keys.
- Validate all external input, including AI-generated structured output.
- Treat uploaded documents as untrusted data.
- Keep document and model response limits explicit.
- Do not fabricate citations, page numbers, or source claims.
- Do not claim a feature is implemented unless its real workflow exists.
- Do not replace real AI functionality with hard-coded demo responses.
- Do not silently discard existing work when refactoring.
- Keep dependencies purposeful and avoid installing packages for trivial tasks.
- Preserve mobile responsiveness and accessibility.
- Update this README when architecture, commands, routes, dependencies, or feature status changes.

### How to approach a task

For each task:
1. State the intended behaviour and files likely to change.
2. Inspect the existing implementation before modifying it.
3. Implement the smallest complete solution.
4. Add or update tests.
5. Run relevant checks.
6. Review the diff for accidental changes and secrets.
7. Update documentation and status.
8. Summarise what changed, what was tested, and what remains.

### Definition of done

A task is complete only when:
- The requested behaviour is implemented.
- Loading, empty, success, and error states are considered.
- Inputs and outputs are validated where appropriate.
- Relevant tests pass.
- The production build passes, or any blocker is clearly documented.
- Documentation reflects the actual result.
- No secrets or unrelated files were introduced.

### Avoid these common mistakes

- Building all features as one oversized React component.
- Putting the Gemini key in client-side code.
- Trusting model output without validation.
- Sending an entire huge document for every small question.
- Treating a scanned PDF as if text extraction succeeded.
- Scoring quizzes by asking the AI whether an answer is correct after submission.
- Adding authentication or a database before the core learning flow works.
- Marking mock UI as a completed feature.
- Changing the framework or deployment target without a clear technical reason.

---

## 17. Hackathon submission materials

The project is intended for the Remote Control AI Hackathon. The final submission should be updated with the official challenge requirements and the actual deployed application.

Suggested short description:

> STUDYFLOW AI is an AI-powered learning workspace that transforms students' lecture materials into clear explanations, concise revision notes, interactive quizzes, and exam-style practice. Instead of starting with generic chatbot conversations, students work from their own course content and turn it into structured learning activities.

Before submission:
- [ ] Confirm the official track/category.
- [ ] Confirm team details and submission requirements.
- [ ] Add the live Vercel URL.
- [ ] Add the public repository URL.
- [ ] Verify all claims against the working application.
- [ ] Prepare a short demo showing a real document moving through the study workflow.

See the `submission/` directory for supporting materials as they are created.

---

## 18. Project links

- **GitHub:** https://github.com/akbarambali157-dev/studyflow-ai
- **Live application:** To be added after Vercel deployment.
- **Hackathon submission:** To be added after submission.

---

## 19. Licence and project ownership

A licence has not yet been selected. Do not assume that the project is open source for reuse simply because the GitHub repository is public. Add an explicit licence file once the owner has chosen the intended terms.

---

*STUDYFLOW AI — understand your notes, practise what you learn, and study with purpose.*
