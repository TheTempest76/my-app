"use client";

import { useState, useEffect } from "react";
import { Location } from "@prisma/client";
import { calculateDistance } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface FoodPost {
  id: string;
  title: string;
  description: string;
  quantity: string;
  expiryDate: Date;
  status: string;
  location: Location;
  donor: {
    id: string;
    name: string;
  };
}

export default function FoodPostsList({ userLocation }: { userLocation: Location }) {
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getDistance = (postLocation: Location) => {
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      postLocation.latitude,
      postLocation.longitude
    );
  };
  const handleRequestFood = async (postId: string) => {
    try {
      const response = await fetch(`/api/chat/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Chat request failed:', errorData);
        throw new Error(errorData.error || 'Failed to create/get chat');
      }
      
      const chat = await response.json();
      console.log("Chat created:", chat);
      
      // Navigate to chat page with the post ID
      router.push(`/chat/${postId}`);
    } catch (error) {
      console.error('Error handling food request:', error);
      // Optional: Add error notification here
    }
  };
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-gray-500">Loading available food posts...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {post.title}
            </h3>
            <p className="text-gray-600 mb-4">{post.description}</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Quantity:</span> {post.quantity}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Expires:</span>{" "}
                {new Date(post.expiryDate).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Distance:</span>{" "}
                {getDistance(post.location).toFixed(1)} km away
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Donor:</span> {post.donor.name}
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => handleRequestFood(post.id)}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                disabled={post.donor.id === user?.id}
              >
                {post.donor.id === user?.id ? "Your Post" : "Request Food"}
              </button>
            </div>
          </div>
        </div>
      ))}
      {posts.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">No food posts available at the moment.</p>
        </div>
      )}
    </div>
  );
}