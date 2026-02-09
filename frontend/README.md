# Veren Frontend

This is the **frontend application for Veren**, built using a modern, type-safe stack. It consumes Veren’s backend APIs to provide a seamless user experience, ranging from public-facing content to internal platform dashboards.

## Tech Stack

* **Vite** – Fast build tool and development server
* **React** – Component-based UI framework
* **TypeScript** – Static typing for better developer experience
* **Tailwind CSS v3** – Utility-first CSS framework
---

## Project Structure

The project follows a modular structure to keep logic and presentation separate:

```text
frontend/
├── src/
│   ├── api/          # Axios instances & API wrappers (centralized logic)
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page-level components
│   ├── App.tsx       # Main application routing/entry
│   ├── main.tsx      # React DOM mounting
│   └── index.css     # Tailwind & global styles
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts

```

---

## Getting Started

### Prerequisites

* **Node.js** (20)
* **npm** (10.8.2)

### Setup & Installation

1. Navigate to the directory:
```bash
cd frontend

```


2. Install dependencies:
```bash
npm install

```



### Running Locally

To start the development server:

```bash
npm run dev

```

The application will be available at: [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)

---

## 🎨 Styling Guidelines

* **Tailwind CSS v3:** Use utility classes for all styling.
* **Global Styles:** Custom global CSS belongs in `src/index.css`.
* **Best Practice:** Avoid creating new `.css` files. Rely on Tailwind's configuration for customization.

## 🔌 API Usage Rules

To maintain a clean architecture, we follow strict API patterns:

1. **Centralization:** All API calls **must** live in `src/api/`.
2. **No Direct Calls:** Components should never call Axios directly.
3. **Documentation First:** API functions must reflect the official backend API docs.

**Example Usage:**

```typescript
import { getProjects } from "@/api/project.api";

```

---

## Contributing Guidelines

Before submitting a Pull Request (PR):

* **Verify Logic:** Ensure your changes align with the backend API documentation.
* **Structure:** Maintain the existing folder hierarchy.
* **Scope:** Keep PRs focused; avoid "scope creep."
* **No Magic:** Avoid adding heavy abstractions or unnecessary third-party libraries.

> **Note:** PRs that assume undocumented API behavior or introduce "magic" abstractions may be closed.

---
</br>
</br>
</br>
</br>
</br>
</br>
</br>