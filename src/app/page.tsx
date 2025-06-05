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
      {/* Search and Results Section */}
      <div className="flex flex-col gap-8">
        {/* Find Courts Box */}
        <div className="p-5 bg-[#f2de29de] border-3 border-[#222] shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[0.3deg] relative h-[600px]">
          <h2 className="pb-2 mb-6 text-3xl font-black text-[#222] border-b-4 border-[#222] inline-block">
            Find Courts
          </h2>
          <SearchForm
            onSearch={searchCourts}
            onReset={resetSearch}
            loading={loading}
          />
        </div>

        {/* Court Results */}
        <div className="w-full">
          <CourtResults />
        </div>
      </div>

      {/* About Section */}
      <div className="mt-10 p-5 bg-[var(--primary)] border-3 border-[#222] shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[-0.3deg] relative">
        <h2 className="text-2xl font-black text-white underline decoration-2 underline-offset-4">
          About Pickleball Court Hub
        </h2>
        <p className="mt-2 font-bold text-white">
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
      <main className="min-h-screen bg-[#e5e1ff]">
        <Header />
        <SearchContainer />
      </main>
    </CourtSearchProvider>
  );
}
