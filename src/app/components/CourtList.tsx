"use client";

import { api } from "../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";

export default function CourtList() {
  const [newCourtName, setNewCourtName] = useState("");

  // Use Convex query to fetch verified courts
  const courts = useQuery(api.courts.getVerifiedCourts);

  // Use Convex mutation to submit a new court
  const submitCourt = useMutation(api.courts.submitCourt);

  // Example submission handler (simplified for demonstration)
  const handleSubmitCourt = async () => {
    try {
      await submitCourt({
        name: newCourtName,
        address: "123 Example St",
        state: "CA",
        zipCode: "12345",
        indoor: false,
        numberOfCourts: 1,
        amenities: {
          indoorCourts: false,
          outdoorCourts: true,
        },
        location: {
          type: "Point",
          coordinates: [-122.4194, 37.7749], // Example coordinates
        },
      });
      setNewCourtName("");
    } catch (error) {
      console.error("Error submitting court:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">Pickleball Courts</h2>

      {/* Simple form to submit a new court */}
      <div className="mb-6">
        <input
          type="text"
          value={newCourtName}
          onChange={(e) => setNewCourtName(e.target.value)}
          placeholder="Enter court name"
          className="p-2 mr-2 border rounded"
        />
        <button
          onClick={handleSubmitCourt}
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          Submit Court
        </button>
      </div>

      {/* Display courts */}
      <div className="space-y-4">
        {courts === undefined ? (
          <div>Loading...</div>
        ) : courts === null ? (
          <div>Error loading courts</div>
        ) : (
          courts.map((court) => (
            <div
              key={court._id}
              className="p-4 transition-shadow border rounded shadow-sm hover:shadow-md"
            >
              <h3 className="font-semibold">{court.name}</h3>
              <p className="text-gray-600">{court.address}</p>
              <p className="text-sm text-gray-500">
                {court.indoor ? "Indoor" : "Outdoor"} • {court.numberOfCourts}{" "}
                courts
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
