"use client";

import { UserWithLocation } from "@/types";
import FoodPostsList from "./FoodPostsList";

export default function ReceiverDashboard({ user }: { user: UserWithLocation }) {
  if (!user.location) {
    return <div>Location data is missing</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8 text-black">Available Food Donations</h1>
      <FoodPostsList userLocation={user.location} />
    </div>
  );
}
