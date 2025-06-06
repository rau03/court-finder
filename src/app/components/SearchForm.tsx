"use client";

import { useState } from "react";

interface SearchFormProps {
  onSearch: (searchParams: SearchParams) => Promise<void>;
  onReset: () => void;
  loading: boolean;
}

export interface SearchParams {
  address: string;
  state: string;
  zipCode: string;
  indoor: string | null;
  maxDistance: string;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  onReset,
  loading,
}) => {
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [indoor, setIndoor] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState("50000"); // Default ~30 miles (50km)

  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      address,
      state,
      zipCode,
      indoor,
      maxDistance,
    });
  };

  const handleReset = () => {
    setAddress("");
    setState("");
    setZipCode("");
    setIndoor(null);
    setMaxDistance("50000");
    onReset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="address"
          className="block mb-2 text-xl font-bold text-black"
        >
          Address or City
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-2 font-bold text-black border-black rounded-none border-3 neo-input shadow-[4px_4px_0px_0px_rgba(30,30,30,1)]"
          placeholder="Enter city, full address, or landmark"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="w-full">
          <label
            htmlFor="state"
            className="block mb-2 text-lg font-bold text-black"
          >
            State
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full p-2 font-bold text-black border-black rounded-none border-3 neo-input h-[52px] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] pr-8 leading-normal"
          >
            <option value="">Any State</option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full">
          <label
            htmlFor="zipCode"
            className="block mb-2 text-lg font-bold text-black"
          >
            Zip Code
          </label>
          <input
            type="text"
            id="zipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full p-2 font-bold text-black border-black rounded-none border-3 neo-input h-[52px] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)]"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="p-3 mb-4 bg-white border-black border-3 shadow-[4px_4px_0px_0px_rgba(30,30,30,1)]">
        <label className="block mb-2 text-lg font-bold text-black">
          Indoor/Outdoor
        </label>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="any"
              name="indoorOutdoor"
              value="any"
              checked={indoor === null}
              onChange={() => setIndoor(null)}
              className="w-5 h-5 mr-2"
            />
            <label htmlFor="any" className="font-bold text-black">
              Any
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="indoor"
              name="indoorOutdoor"
              value="indoor"
              checked={indoor === "true"}
              onChange={() => setIndoor("true")}
              className="w-5 h-5 mr-2"
            />
            <label htmlFor="indoor" className="font-bold text-black">
              Indoor
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="outdoor"
              name="indoorOutdoor"
              value="outdoor"
              checked={indoor === "false"}
              onChange={() => setIndoor("false")}
              className="w-5 h-5 mr-2"
            />
            <label htmlFor="outdoor" className="font-bold text-black">
              Outdoor
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="maxDistance"
          className="block mb-2 text-lg font-bold text-black"
        >
          Maximum Distance (miles)
        </label>
        <select
          id="maxDistance"
          value={maxDistance}
          onChange={(e) => setMaxDistance(e.target.value)}
          className="w-full p-2 font-bold text-black border-black rounded-none border-3 neo-input shadow-[4px_4px_0px_0px_rgba(30,30,30,1)]"
        >
          <option value="8000">5 miles</option>
          <option value="16000">10 miles</option>
          <option value="40000">25 miles</option>
          <option value="50000">30 miles</option>
          <option value="80000">50 miles</option>
          <option value="160000">100 miles</option>
          <option value="1000000">600+ miles</option>
        </select>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="w-full px-4 py-3 font-black text-white bg-[var(--primary)] rounded-none border-3 border-black hover:-translate-y-1 transform transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-full px-4 py-3 font-black text-white bg-[var(--secondary)] rounded-none border-3 border-black hover:-translate-y-1 transform transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          disabled={loading}
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
