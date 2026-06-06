# Search Interface

A high-performance, accessible search UI component built with **React 19**, **TypeScript**, and **Tailwind CSS v4**. Features debounced input, request cancellation via `AbortController`, and query persistence across page reloads using `localStorage`.

## Features

- **Debounced input** — Fires the search only after the user pauses typing (configurable delay, default `300ms`), preventing excessive API calls.
- **Request cancellation** — Each new search cancels the previous in-flight request via `AbortController`, so stale responses never overwrite fresh results.
- **Persisted state** — The current query and recent search history survive page reloads via `localStorage`.
- **Recent searches** — Stores up to 5 recent queries (configurable) and displays them when the input is empty, with a one-click clear option.
- **Skeleton loading** — Animated placeholder cards appear while results are being fetched.
- **Error handling** — Displays a styled error banner if the search function rejects.
- **Accessible markup** — Uses `role="alert"`, `aria-label`, and `aria-busy` to keep screen readers informed.
- **Composable API** — Drop in any async search function; the component is fully decoupled from the data layer.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Language | [TypeScript 6](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Routing | [TanStack Router v1](https://tanstack.com/router) |
| Icons | [Lucide React](https://lucide.dev/) |
| UI Primitives | [Radix UI](https://www.radix-ui.com/) / [shadcn](https://ui.shadcn.com/) |
| Build Tool | [Vite 8](https://vitejs.dev/) |
| Font | [Geist](https://vercel.com/font) (via `@fontsource-variable/geist`) |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
git clone https://github.com/your-username/search-interface.git
cd search-interface
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Built output goes to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
search-interface/
├── src/
│   ├── components/
│   │   ├── search-interface.tsx   # Core search UI component
│   │   ├── app-button.tsx         # Reusable button component
│   │   └── ui/                    # shadcn/Radix UI primitives
│   ├── hooks/
│   │   ├── use-debounce.ts        # Generic debounce hook
│   │   └── use-local-storage.ts   # localStorage hook with cross-tab sync
│   ├── lib/
│   │   └── utils.ts               # Utility helpers (cn, etc.)
│   ├── App.tsx                    # Root route & mock dataset
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles & Tailwind config
├── index.html
├── vite.config.ts
└── package.json
```

## Component API

### `<SearchInterface />`

The main exported component. Pass it any async function that resolves to `SearchResult[]`.

```tsx
import { SearchInterface, type SearchResult } from './components/search-interface';

<SearchInterface
  onSearch={mySearchFunction}
  placeholder="Search…"
  debounceMs={300}
  storageKey="search:state"
  minChars={2}
  maxRecent={5}
/>
```

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `onSearch` | `(query: string, signal: AbortSignal) => Promise<SearchResult[]>` | **required** | Async function called with the debounced query. Use the `signal` to cancel in-flight requests. |
| `placeholder` | `string` | `"Search…"` | Input placeholder text. |
| `debounceMs` | `number` | `300` | Milliseconds to wait after the user stops typing before firing `onSearch`. |
| `storageKey` | `string` | `"search:state"` | `localStorage` key used to persist query and recent searches. |
| `minChars` | `number` | `2` | Minimum number of characters required before a search is triggered. |
| `maxRecent` | `number` | `5` | Maximum number of recent searches to store. |
| `className` | `string` | — | Additional CSS classes applied to the root element. |

#### `SearchResult` type

```ts
interface SearchResult {
  id: string | number;
  title: string;
  description?: string;
}
```

## Custom Hooks

### `useDebounce<T>(value, delay)`

Returns a debounced copy of `value` that only updates after `delay` milliseconds of inactivity. Works with any type.

```ts
const debouncedQuery = useDebounce(query, 300);
```

### `useLocalStorage<T>(key, initialValue)`

A type-safe wrapper around `localStorage` that keeps React state in sync. Returns `[storedValue, setValue, removeValue]`.

- **Cross-tab sync** — Listens to the `storage` event so all open tabs stay in sync.
- **SSR-safe** — Guards all `window` access with `typeof window !== 'undefined'`.

```ts
const [theme, setTheme, removeTheme] = useLocalStorage<string>('theme', 'dark');
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

## License

MIT
