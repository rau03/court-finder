"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Header from "../components/Header";
import Link from "next/link";
import { Id } from "../../../convex/_generated/dataModel";

export default function AdminDashboard() {
  const isAdmin = useQuery(api.users.isAdmin);
  const pendingCourts = useQuery(api.courts.getPendingCourts);
  const approveMutation = useMutation(api.courts.approveCourt);
  const rejectMutation = useMutation(api.courts.rejectCourt);

  // Handle loading state
  if (isAdmin === undefined) {
    return (
      <div>
        <Header />
        <div className="max-w-6xl p-8 mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Handle unauthorized access
  if (isAdmin === false) {
    return (
      <div>
        <Header />
        <div className="max-w-6xl p-8 mx-auto">
          <h1 className="mb-2 text-2xl font-bold text-red-600">
            Access Denied
          </h1>
          <p className="mb-4">
            You don&apos;t have permission to access this page.
          </p>
          <Link
            href="/"
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleApprove = async (courtId: Id<"courts">) => {
    try {
      await approveMutation({ courtId });
    } catch (error) {
      console.error("Error approving court:", error);
      alert("Failed to approve court");
    }
  };

  const handleReject = async (courtId: Id<"courts">) => {
    if (
      confirm(
        "Are you sure you want to reject this court? This action cannot be undone."
      )
    ) {
      try {
        await rejectMutation({ courtId });
      } catch (error) {
        console.error("Error rejecting court:", error);
        alert("Failed to reject court");
      }
    }
  };

  return (
    <div>
      <Header />

      <div className="max-w-6xl p-8 mx-auto">
        <h1 className="inline-block pb-2 mb-8 text-3xl font-black border-b-4 border-black">
          Admin Dashboard
        </h1>

        <h2 className="mb-4 text-2xl font-bold">Courts Pending Approval</h2>

        {!pendingCourts || pendingCourts.length === 0 ? (
          <p className="p-4 text-gray-500 bg-gray-100 rounded">
            No courts pending approval
          </p>
        ) : (
          <div className="space-y-4">
            {pendingCourts.map((court) => (
              <div
                key={court._id}
                className="border-3 border-black p-4 bg-[#f2de29] shadow-[4px_4px_0px_0px_rgba(30,30,30,0.8)]"
              >
                <h3 className="text-xl font-bold">{court.name}</h3>
                <p>
                  {court.address}, {court.city || ""}, {court.state}{" "}
                  {court.zipCode}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 bg-white border-2 border-black">
                    <span className="font-bold">Type:</span>{" "}
                    {court.indoor ? "Indoor 🏢" : "Outdoor 🌳"}
                  </div>
                  <div className="p-2 bg-white border-2 border-black">
                    <span className="font-bold">Courts:</span>{" "}
                    {court.numberOfCourts}
                  </div>
                </div>

                <div className="flex mt-4 space-x-4">
                  <button
                    onClick={() => handleApprove(court._id)}
                    className="px-4 py-2 bg-[var(--primary)] text-white font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(30,30,30,1)] hover:shadow-[5px_5px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(court._id)}
                    className="px-4 py-2 bg-[var(--secondary)] text-white font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(30,30,30,1)] hover:shadow-[5px_5px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
