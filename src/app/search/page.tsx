"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DocumentCard } from "@/components/document/document-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Search } from "lucide-react";
import type { Document } from "@/lib/types";

interface SearchResult extends Document {
  rank: number;
  categories?: { name: string; slug: string } | null;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc("search_documents", {
      query_text: searchQuery,
      filter_type: filterType || null,
      page_limit: 50,
      page_offset: 0,
    });

    if (!error && data) {
      // Fetch full document details
      const ids = (data as { id: string; rank: number }[]).map((r) => r.id);
      const { data: docs } = await supabase
        .from("documents")
        .select("*, categories(name, slug)")
        .in("id", ids);

      if (docs) {
        // Sort by rank
        const sorted = (data as { id: string; rank: number }[])
          .map((r) => docs.find((d) => d.id === r.id))
          .filter(Boolean) as SearchResult[];
        setResults(sorted);
      }
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Search Documents</h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, description, or filename..."
            className="pl-10 h-12 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-12 w-full sm:w-40"
        >
          <option value="">All Types</option>
          <option value="application/pdf">PDF</option>
          <option value="image/jpeg">Images</option>
          <option value="video/mp4">Video</option>
          <option value="audio/mpeg">Audio</option>
          <option value="text/html">HTML</option>
          <option value="text/plain">Text</option>
        </Select>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Found {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </>
      ) : query ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No results found for &ldquo;{query}&rdquo;</p>
          <p className="text-sm mt-2">Try different keywords or remove filters</p>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Enter a search term to find documents</p>
        </div>
      )}
      </main>
      <Footer />
    </>
  );
}
