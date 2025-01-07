import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-green-600">
                FoodShare
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {userId ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-green-600"
                  >
                    Dashboard
                  </Link>
                  <UserButton />
                </>
              ) : (
                <div className="space-x-4">
                  <Link
                    href="/sign-in"
                    className="text-gray-700 hover:text-green-600"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section with background image */}
      <div className="relative h-screen ">

        <img
          src="https://community.thriveglobal.com/wp-content/uploads/2018/09/helping-hands.jpg"
          alt="People helping each other in the community"
          className="w-full h-full object-cover"
        />
        
       

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        {/* Content on top of the image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-bold text-center mb-6">
            Reduce Food Waste, Share with Care
          </h1>
          <p className="text-xl text-center mb-8 max-w-2xl px-4">
            Connect food donors with those in need. Make a difference in your community.
          </p>
          {!userId && (
            <div className="space-x-4">
              <Link
                href="/sign-up?role=donor"
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
              >
                Register as Donor
              </Link>
              <Link
                href="/sign-up?role=receiver"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
              >
                Register as Receiver
              </Link>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">For Donors</h2>
            <p className="text-gray-600">
              Share surplus food with those who need it. Post details about available food items and connect with receivers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">For Receivers</h2>
            <p className="text-gray-600">
              Find available food donations in your area. Message donors and arrange collection.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Location Based</h2>
            <p className="text-gray-600">
              Find and share food within your community using our location-based system.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}