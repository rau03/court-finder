"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SubmitCourt() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
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
  });

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const [parent, child] = name.split(".");

    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: checked,
      },
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/courts/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit court");
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Success message
  if (success) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">Thank You!</h1>
          <p className="text-lg mb-6">
            Your court submission has been received and will be reviewed soon.
          </p>
          <p className="mb-4">Redirecting to homepage in 3 seconds...</p>
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-bold"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
        Submit a Pickleball Court
      </h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Court Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Westside Recreation Center"
              />
            </div>

            <div>
              <label
                htmlFor="numberOfCourts"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="surfaceType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Surface Type
              </label>
              <select
                id="surfaceType"
                name="surfaceType"
                value={formData.surfaceType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              <label
                htmlFor="cost"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cost
              </label>
              <select
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
                <option value="Membership Required">Membership Required</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Anytown"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  {/* More states... */}
                </select>
              </div>

              <div>
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Zip Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="amenities.indoorCourts"
                name="amenities.indoorCourts"
                checked={formData.amenities.indoorCourts}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="amenities.indoorCourts"
                className="ml-2 block text-sm text-gray-700"
              >
                Indoor Courts
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="amenities.outdoorCourts"
                name="amenities.outdoorCourts"
                checked={formData.amenities.outdoorCourts}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="amenities.outdoorCourts"
                className="ml-2 block text-sm text-gray-700"
              >
                Outdoor Courts
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="amenities.lightsAvailable"
                name="amenities.lightsAvailable"
                checked={formData.amenities.lightsAvailable}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="amenities.lightsAvailable"
                className="ml-2 block text-sm text-gray-700"
              >
                Lights Available
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="amenities.restroomsAvailable"
                name="amenities.restroomsAvailable"
                checked={formData.amenities.restroomsAvailable}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="amenities.restroomsAvailable"
                className="ml-2 block text-sm text-gray-700"
              >
                Restrooms Available
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="amenities.waterFountain"
                name="amenities.waterFountain"
                checked={formData.amenities.waterFountain}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="amenities.waterFountain"
                className="ml-2 block text-sm text-gray-700"
              >
                Water Fountain
              </label>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Contact Information (Optional)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact.website"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Website
              </label>
              <input
                type="url"
                id="contact.website"
                name="contact.website"
                value={formData.contact.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label
                htmlFor="contact.phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone
              </label>
              <input
                type="tel"
                id="contact.phone"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="(123) 456-7890"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="contact.email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="contact.email"
                name="contact.email"
                value={formData.contact.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="info@example.com"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Court 🏓"}
          </button>
        </div>
      </form>
    </div>
  );
}
