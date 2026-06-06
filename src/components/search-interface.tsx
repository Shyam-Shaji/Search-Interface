import * as React from 'react';
import {Search, X, Loader2, Clock} from 'lucide-react';
import { useDebounce } from '../hooks/use-debounce';
import { useLocalStorage } from '../hooks/use-local-storage';
import { AppButton } from './app-button';
import { cn } from '../lib/utils';

export interface SearchResult {
    id: string | number;
    title: string;
    description?: string;
}

interface SearchInterfaceProps {
    /**Async search function */
    onSearch: (query: string, signal: AbortSignal) => Promise<SearchResult[]>;
    placeholder?: string;
    debounceMs?: number;
    storageKey?: string;
    minChars?: number;
    maxRecent?: number;
    className?: string;
}

export function SearchInterface({
  onSearch,
  placeholder = "Search…",
  debounceMs = 300,
  storageKey = "search:state",
  minChars = 2,
  maxRecent = 5,
  className,
}: SearchInterfaceProps) {
  const [persisted, setPersisted] = useLocalStorage<{
    query: string;
    recent: string[];
  }>(storageKey, { query: "", recent: [] });

  const [query, setQuery] = React.useState(persisted.query);
  const debouncedQuery = useDebounce(query.trim(), debounceMs);

  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  // Persist the live query so it survives reloads.
  React.useEffect(() => {
    setPersisted((prev) => ({ ...prev, query }));
  }, [query, setPersisted]);

  // Run the search whenever the debounced query changes.
  React.useEffect(() => {
    if (debouncedQuery.length < minChars) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    onSearch(debouncedQuery, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;
        setResults(res);
        setHasSearched(true);
        setPersisted((prev) => {
          const recent = [
            debouncedQuery,
            ...prev.recent.filter((r) => r !== debouncedQuery),
          ].slice(0, maxRecent);
          return { ...prev, recent };
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, minChars, maxRecent, onSearch, setPersisted]);

  const clear = () => {
    setQuery("");
    setResults([]);
    setError(null);
    setHasSearched(false);
  };

  const clearRecent = () =>
    setPersisted((prev) => ({ ...prev, recent: [] }));

  const showRecent =
    query.trim().length < minChars && persisted.recent.length > 0;

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search"
          className="w-full h-11 pl-10 pr-20 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2
              className="size-4 animate-spin text-muted-foreground"
              aria-label="Loading"
            />
          )}
          {query && (
            <AppButton
              variant="ghost"
              size="sm"
              onClick={clear}
              aria-label="Clear search"
              className="h-7 w-7 p-0"
            >
              <X />
            </AppButton>
          )}
        </div>
      </div>

      <div className="mt-4">
        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {!error && showRecent && (
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Recent
              </span>
              <AppButton
                variant="ghost"
                size="sm"
                onClick={clearRecent}
                className="h-6 px-2 text-xs"
              >
                Clear
              </AppButton>
            </div>
            <ul>
              {persisted.recent.map((r) => (
                <li key={r}>
                  <button
                    type="button"
                    onClick={() => setQuery(r)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                  >
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>{r}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!error && !showRecent && (
          <ResultsList
            isLoading={isLoading}
            results={results}
            query={debouncedQuery}
            hasSearched={hasSearched}
            minChars={minChars}
            currentLength={query.trim().length}
          />
        )}
      </div>
    </div>
  );
}

function ResultsList({
  isLoading,
  results,
  query,
  hasSearched,
  minChars,
  currentLength,
}: {
  isLoading: boolean;
  results: SearchResult[];
  query: string;
  hasSearched: boolean;
  minChars: number;
  currentLength: number;
}) {
  if (currentLength === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Start typing to search.
      </p>
    );
  }

  if (currentLength < minChars) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Type at least {minChars} characters…
      </p>
    );
  }

  if (isLoading && results.length === 0) {
    return (
      <ul className="space-y-2" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="h-14 rounded-lg border border-border bg-card animate-pulse"
          />
        ))}
      </ul>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No results for <span className="font-medium text-foreground">“{query}”</span>.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {results.map((r) => (
        <li
          key={r.id}
          className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-accent/50"
        >
          <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
          {r.description && (
            <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}