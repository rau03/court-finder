"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

interface FormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  numberOfCourts: number;
  surfaceType: string;
  cost: string;
  amenities: {
    indoorCourts: boolean;
    outdoorCourts: boolean;
    lightsAvailable: boolean;
    restroomsAvailable: boolean;
    waterFountain: boolean;
  };
  contact: {
    website: string;
    phone: string;
    email: string;
  };
  indoor: boolean;
}

export default function SubmitCourtForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitCourtMutation = useMutation(api.courts.submitCourt);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    numberOfCourts: 1,
    surfaceType: "Concrete",
    cost: "Free",
    amenities: {
      indoorCourts: false,
      outdoorCourts: true,
      lightsAvailable: false,
      restroomsAvailable: false,
      waterFountain: false,
    },
    contact: {
      website: "",
      phone: "",
      email: "",
    },
    indoor: false,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "amenities" || parent === "contact") {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof FormData] as {
              [key: string]: string | boolean;
            }),
            [child]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !isSignedIn) {
      router.push("/sign-in?redirect_url=/submit-court");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.address || !formData.state || !formData.zipCode) {
        throw new Error("Please fill in all required address fields");
      }

      // Format the address string
      const addressParts = [
        formData.address,
        formData.city,
        formData.state,
        formData.zipCode,
      ].filter(Boolean);

      const addressString = addressParts.join(", ");

      // First, geocode the address
      const geocodeResponse = await fetch(
        `/api/geocode?address=${encodeURIComponent(addressString)}`
      );

      if (!geocodeResponse.ok) {
        const errorData = await geocodeResponse.json();
        throw new Error(errorData.error || "Failed to geocode address");
      }

      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.lat || !geocodeData.lng) {
        throw new Error(
          "Could not determine location coordinates. Please check the address and try again."
        );
      }

      // Submit the court data to Convex
      await submitCourtMutation({
        name: formData.name,
        address: formData.address,
        city: formData.city || "",
        state: formData.state,
        zipCode: formData.zipCode,
        indoor: formData.indoor,
        numberOfCourts: Number(formData.numberOfCourts),
        amenities: {
          indoorCourts: Boolean(formData.amenities?.indoorCourts),
          outdoorCourts: Boolean(formData.amenities?.outdoorCourts),
          lightsAvailable: Boolean(formData.amenities?.lightsAvailable),
          restroomsAvailable: Boolean(formData.amenities?.restroomsAvailable),
          waterFountain: Boolean(formData.amenities?.waterFountain),
        },
        location: {
          type: "Point",
          coordinates: [geocodeData.lng, geocodeData.lat],
        },
        surfaceType: formData.surfaceType,
        cost: formData.cost,
        hours: {
          monday: "",
          tuesday: "",
          wednesday: "",
          thursday: "",
          friday: "",
          saturday: "",
          sunday: "",
        },
        contact: formData.contact,
      });

      // Show success message (optional)
      alert("Court submitted successfully! Redirecting to home page...");

      // Use Next.js router for navigation
      router.push("/");
    } catch (err) {
      console.error("Error submitting court:", err);
      setError(err instanceof Error ? err.message : "Failed to submit court");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is being checked
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  // Show sign-in component if not signed in
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">
            Sign in to Submit a Court
          </h2>
          <button
            onClick={() => router.push("/sign-in?redirect_url=/submit-court")}
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 mb-6 border-l-4 border-red-500 bg-red-50">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="p-5 bg-[var(--primary)] border-3 border-[#222] shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[-0.3deg] relative">
        <h2 className="text-2xl font-black text-black underline decoration-2 underline-offset-4">
          Basic Information
        </h2>
        <p className="mt-2 font-bold text-black">
          Tell us about the court. What&apos;s its name? Is it indoor or
          outdoor?
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="block font-bold text-black">
              Court Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 mt-1 border-2 border-black rounded"
              placeholder="Westside Recreation Center"
            />
          </div>
          <div>
            <label
              htmlFor="numberOfCourts"
              className="block font-bold text-black"
            >
              Number of Courts
            </label>
            <input
              type="number"
              id="numberOfCourts"
              name="numberOfCourts"
              value={formData.numberOfCourts}
              onChange={handleChange}
              min="1"
              className="w-full p-2 mt-1 border-2 border-black rounded"
            />
          </div>
          <div>
            <label htmlFor="surfaceType" className="block font-bold text-black">
              Surface Type
            </label>
            <select
              id="surfaceType"
              name="surfaceType"
              value={formData.surfaceType}
              onChange={handleChange}
              className="w-full p-2 mt-1 border-2 border-black rounded"
            >
              <option value="Concrete">Concrete</option>
              <option value="Asphalt">Asphalt</option>
              <option value="Wood">Wood</option>
              <option value="Tennis Court">Tennis Court</option>
              <option value="Gym Floor">Gym Floor</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="cost" className="block font-bold text-black">
              Cost
            </label>
            <select
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              className="w-full p-2 mt-1 border-2 border-black rounded"
            >
              <option value="Free">Free</option>
              <option value="Paid">Paid</option>
              <option value="Membership Required">Membership Required</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-5 bg-[var(--primary)] border-3 border-[#222] shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[-0.3deg] relative">
        <h2 className="text-2xl font-black text-black underline decoration-2 underline-offset-4">
          Location
        </h2>
        <p className="mt-2 font-bold text-black">
          Where is the court located? We need the address to help others find
          it.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="address" className="block font-bold text-black">
              Street Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full p-2 mt-1 border-2 border-black rounded"
              placeholder="123 Main Street"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="city" className="block font-bold text-black">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2 mt-1 border-2 border-black rounded"
                placeholder="Anytown"
              />
            </div>
            <div>
              <label htmlFor="state" className="block font-bold text-black">
                State *
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full p-2 mt-1 border-2 border-black rounded"
              >
                <option value="">Select State</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </select>
            </div>
            <div>
              <label htmlFor="zipCode" className="block font-bold text-black">
                Zip Code *
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                className="w-full p-2 mt-1 border-2 border-black rounded"
                placeholder="12345"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-[var(--primary)] border-3 border-[#222] shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[-0.3deg] relative">
        <h2 className="text-2xl font-black text-black underline decoration-2 underline-offset-4">
          Contact Information
        </h2>
        <p className="mt-2 font-bold text-black">
          How can people get in touch? Phone number, website, or email.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="contact.website"
              className="block font-bold text-black"
            >
              Website
            </label>
            <input
              type="url"
              id="contact.website"
              name="contact.website"
              value={formData.contact.website}
              onChange={handleChange}
              className="w-full p-2 mt-1 border-2 border-black rounded"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label
              htmlFor="contact.phone"
              className="block font-bold text-black"
            >
              Phone
            </label>
            <input
              type="tel"
              id="contact.phone"
              name="contact.phone"
              value={formData.contact.phone}
              onChange={handleChange}
              className="w-full p-2 mt-1 border-2 border-black rounded"
              placeholder="(123) 456-7890"
            />
          </div>
          <div>
            <label
              htmlFor="contact.email"
              className="block font-bold text-black"
            >
              Email
            </label>
            <input
              type="email"
              id="contact.email"
              name="contact.email"
              value={formData.contact.email}
              onChange={handleChange}
              className="w-full p-2 mt-1 border-2 border-black rounded"
              placeholder="info@example.com"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 text-lg font-bold text-white transition duration-200 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Court 🏓"}
        </button>
      </div>
    </form>
  );
}
