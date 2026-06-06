import './App.css';
import { createFileRoute } from '@tanstack/react-router';
import { SearchInterface, type SearchResult } from './components/search-interface';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {titile: "Debounced Search"},
      {name: "description", content: "High performace search with debounced input and presisted state"},
    ],
  }),
  component: App,
})

const DATASET: SearchResult[] = [
  { id: 1, title: "React", description: "A JavaScript library for building user interfaces." },
  { id: 2, title: "TypeScript", description: "JavaScript with syntax for types." },
  { id: 3, title: "TanStack Router", description: "Type-safe routing for React applications." },
  { id: 4, title: "TanStack Query", description: "Powerful asynchronous state management." },
  { id: 5, title: "Tailwind CSS", description: "A utility-first CSS framework." },
  { id: 6, title: "Vite", description: "Next generation frontend tooling." },
  { id: 7, title: "Zod", description: "TypeScript-first schema validation." },
  { id: 8, title: "Radix UI", description: "Unstyled, accessible UI primitives." },
  { id: 9, title: "Framer Motion", description: "Production-ready motion library for React." },
  { id: 10, title: "Bun", description: "A fast all-in-one JavaScript runtime." },
  { id: 11, title: "Node.js", description: "JavaScript runtime built on V8." },
  { id: 12, title: "Deno", description: "A secure runtime for JavaScript and TypeScript." },
  { id: 13, title: "PostgreSQL", description: "Powerful open-source relational database." },
  { id: 14, title: "Supabase", description: "Open source Firebase alternative." },
  { id: 15, title: "GraphQL", description: "Query language for your API." },
];

// Simulated network call — replace with a real API.
function mockSearch(query: string, signal: AbortSignal): Promise<SearchResult[]> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => {
      const q = query.toLowerCase();
      resolve(
        DATASET.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q),
        ),
      );
    }, 400);
    signal.addEventListener("abort", () => {
      window.clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}


function App() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Search
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Debounced input, persisted across reloads.
        </p>
      </div>
      <SearchInterface
        onSearch={mockSearch}
        placeholder="Search libraries and tools…"
      />
    </main>
  )
}

export default App
