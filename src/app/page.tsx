"use client";

import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import CourtResults from "./components/CourtResults";
import {
  CourtSearchProvider,
  useCourtSearch,
} from "./context/CourtSearchContext";

// Wrapper component to access the context inside
const SearchContainer = () => {
  const { searchCourts, resetSearch, loading } = useCourtSearch();

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="p-5 bg-white md:col-span-1 border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="pb-2 mb-6 text-3xl font-black text-black border-b-4 border-black">
            Find Courts
          </h2>
          <SearchForm
            onSearch={searchCourts}
            onReset={resetSearch}
            loading={loading}
          />
        </div>
        <div className="md:col-span-2">
          <CourtResults />
        </div>
      </div>

      <div className="mt-10 p-5 bg-[var(--primary)] border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-black text-white">
          About Pickleball Court Finder
        </h2>
        <p className="mt-2 text-white font-bold">
          Find the best pickleball courts near you! Use our search tool to
          locate courts based on location, indoor/outdoor preferences, and
          distance. Help grow the community by submitting courts you know about.
        </p>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <CourtSearchProvider>
      <main className="min-h-screen">
        <Header />
        <SearchContainer />
      </main>
    </CourtSearchProvider>
  );
}
