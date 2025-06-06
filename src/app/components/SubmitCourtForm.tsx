"use client";

import React from "react";

export default function SubmitCourtForm() {
  return (
    <>
      <div className="p-5 bg-[var(--primary)] border-3 border-[#222] shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[-0.3deg] relative">
        <h2 className="text-2xl font-black text-black underline decoration-2 underline-offset-4">
          Basic Information
        </h2>
        <p className="mt-2 font-bold text-black">
          Tell us about the court. What&apos;s its name? Is it indoor or
          outdoor?
        </p>
      </div>
      <div className="p-5 bg-[var(--primary)] border-3 border-[#222] shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[-0.3deg] relative">
        <h2 className="text-2xl font-black text-black underline decoration-2 underline-offset-4">
          Location
        </h2>
        <p className="mt-2 font-bold text-black">
          Where is the court located? We need the address to help others find
          it.
        </p>
      </div>
      <div className="p-5 bg-[var(--primary)] border-3 border-[#222] shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[-0.3deg] relative">
        <h2 className="text-2xl font-black text-black underline decoration-2 underline-offset-4">
          Contact Information
        </h2>
        <p className="mt-2 font-bold text-black">
          How can people get in touch? Phone number, website, or email.
        </p>
      </div>
    </>
  );
}
