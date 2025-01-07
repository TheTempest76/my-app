// app/onboarding/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const role = formData.get("role");

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          role,
          location: {
            latitude: location?.lat,
            longitude: location?.lng,
            address,
          },
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error during onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Complete Your Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Your Role
              </label>
              <div className="mt-2 space-y-4">
                <div className="flex items-center">
                  <input
                    id="donor"
                    name="role"
                    type="radio"
                    value="DONOR"
                    className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                    required
                  />
                  <label htmlFor="donor" className="ml-3">
                    <span className="block text-sm font-medium text-gray-700">
                      Donor
                    </span>
                    <span className="block text-sm text-gray-500">
                      I want to donate food
                    </span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="receiver"
                    name="role"
                    type="radio"
                    value="RECEIVER"
                    className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="receiver" className="ml-3">
                    <span className="block text-sm font-medium text-gray-700">
                      Receiver
                    </span>
                    <span className="block text-sm text-gray-500">
                      I want to receive food donations
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !location}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
            >
              {loading ? "Setting up your account..." : "Complete Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
    );
}