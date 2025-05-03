"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Define the form data structure
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
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export default function SubmitCourt() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
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
    hours: {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: "",
    },
  });

  const submitCourtMutation = useMutation(api.courts.submitCourt);

  // Form handlers
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      if (parent === "amenities") {
        setFormData((prev) => ({
          ...prev,
          amenities: {
            ...prev.amenities,
            [child]: value,
          },
        }));
      } else if (parent === "contact") {
        setFormData((prev) => ({
          ...prev,
          contact: {
            ...prev.contact,
            [child]: value,
          },
        }));
      } else if (parent === "hours") {
        setFormData((prev) => ({
          ...prev,
          hours: {
            ...prev.hours,
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

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const [parent, child] = name.split(".");

    if (parent === "amenities") {
      setFormData((prev) => ({
        ...prev,
        amenities: {
          ...prev.amenities,
          [child]: checked,
        },
      }));
    }
  };

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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
        surfaceType: formData.surfaceType || "",
        cost: formData.cost || "",
        hours: {
          monday: formData.hours?.monday || "",
          tuesday: formData.hours?.tuesday || "",
          wednesday: formData.hours?.wednesday || "",
          thursday: formData.hours?.thursday || "",
          friday: formData.hours?.friday || "",
          saturday: formData.hours?.saturday || "",
          sunday: formData.hours?.sunday || "",
        },
        contact: {
          website: formData.contact?.website || "",
          phone: formData.contact?.phone || "",
          email: formData.contact?.email || "",
        },
        location: {
          type: "Point",
          coordinates: [0, 0], // Replace with actual geocoding
        },
      });

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
      <div className="max-w-4xl p-6 mx-auto mt-10 bg-white shadow-md rounded-xl">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-green-600">Thank You!</h1>
          <p className="mb-6 text-lg">
            Your court submission has been received and will be reviewed soon.
          </p>
          <p className="mb-4">Redirecting to homepage in 3 seconds...</p>
          <Link
            href="/"
            className="px-6 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl p-6 mx-auto mt-10 bg-white shadow-md submit-court-form rounded-xl"
    >
      <h1 className="mb-6 text-3xl font-bold text-center text-blue-800">
        Submit a Pickleball Court
      </h1>

      {error && (
        <div className="p-4 mb-6 border-l-4 border-red-500 bg-red-50">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="p-4 rounded-lg bg-blue-50">
          <h2 className="section-heading">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="form-label">
                Court Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="shadow-sm form-input"
                placeholder="Westside Recreation Center"
              />
            </div>

            <div>
              <label htmlFor="numberOfCourts" className="form-label">
                Number of Courts
              </label>
              <input
                type="number"
                id="numberOfCourts"
                name="numberOfCourts"
                value={formData.numberOfCourts}
                onChange={handleChange}
                min="1"
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="surfaceType" className="form-label">
                Surface Type
              </label>
              <select
                id="surfaceType"
                name="surfaceType"
                value={formData.surfaceType}
                onChange={handleChange}
                className="form-input"
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
              <label htmlFor="cost" className="form-label">
                Cost
              </label>
              <select
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
                <option value="Membership Required">Membership Required</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="p-4 rounded-lg bg-green-50">
          <h2 className="section-heading">Location</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="form-label">
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Anytown"
                />
              </div>

              <div>
                <label htmlFor="state" className="form-label">
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
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
                <label htmlFor="zipCode" className="form-label">
                  Zip Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="p-4 rounded-lg bg-yellow-50">
          <h2 className="section-heading">Amenities</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="amenities.indoorCourts"
                name="amenities.indoorCourts"
                checked={formData.amenities.indoorCourts}
                onChange={handleCheckboxChange}
                className="form-input"
              />
              <label htmlFor="amenities.indoorCourts" className="form-label">
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
                className="form-input"
              />
              <label htmlFor="amenities.outdoorCourts" className="form-label">
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
                className="form-input"
              />
              <label htmlFor="amenities.lightsAvailable" className="form-label">
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
                className="form-input"
              />
              <label
                htmlFor="amenities.restroomsAvailable"
                className="form-label"
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
                className="form-input"
              />
              <label htmlFor="amenities.waterFountain" className="form-label">
                Water Fountain
              </label>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-4 rounded-lg bg-purple-50">
          <h2 className="section-heading">Contact Information (Optional)</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="contact.website" className="form-label">
                Website
              </label>
              <input
                type="url"
                id="contact.website"
                name="contact.website"
                value={formData.contact.website}
                onChange={handleChange}
                className="form-input"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="contact.phone" className="form-label">
                Phone
              </label>
              <input
                type="tel"
                id="contact.phone"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="(123) 456-7890"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="contact.email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="contact.email"
                name="contact.email"
                value={formData.contact.email}
                onChange={handleChange}
                className="form-input"
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
            className="px-8 py-3 text-lg font-bold text-white transition duration-200 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Court 🏓"}
          </button>
        </div>
      </div>
    </form>
  );
}
