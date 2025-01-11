"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreateFoodPost from "./createFoodPost";
import { UserWithLocation } from "@/types";
import axios from "axios";

interface FoodPost {
  id: string;
  title: string;
  description: string;
  quantity: string;
  expiryDate: string;
  status: 'AVAILABLE' | 'RESERVED' | 'COMPLETED';
  location: {
    address: string;
  };
  requests: Array<{
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
    receiver: {
      name: string;
    };
  }>;
  createdAt: string;
}

export default function DonorDashboard({ user }: { user: UserWithLocation }) {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/find-user-history');
      setPosts(response.data);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const getStatusBadgeColor = (status: FoodPost['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleChatClick = (postId: string) => {
    router.push(`/chat/${postId}`);
  };

  return (
    <div className="max-w-7xl min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
        <button
          onClick={() => setShowCreatePost(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Create New Post
        </button>
      </div>

      {showCreatePost && (
        <CreateFoodPost
          user={user}
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => {
            setShowCreatePost(false);
            fetchPosts();
          }}
        />
      )}
      
      <h1 className="text-2xl font-bold text-gray-900">Your History</h1>

      <div className="space-y-6 mt-8">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading posts...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No posts found. Create your first post!</div>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-gray-600 mt-1">{post.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(
                      post.status
                    )}`}
                  >
                    {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                  </span>
                  { 
                    <button
                      onClick={() => handleChatClick(post.id)}
                      className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 text-sm transition-colors"
                    >
                      Chat
                    </button>
}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Quantity:</span> {post.quantity}
                </div>
                <div>
                  <span className="font-medium">Expiry Date:</span>{' '}
                  {new Date(post.expiryDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Location:</span>{' '}
                  {post.location.address}
                </div>
                <div>
                  <span className="font-medium">Requests:</span>{' '}
                  {post.requests.length}
                </div>
              </div>

              {post.requests.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Recent Requests:</h4>
                  <div className="space-y-2">
                    {post.requests.map((request) => (
                      <div
                        key={request.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>{request.receiver.name}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            request.status === 'PENDING'
                              ? 'bg-blue-100 text-blue-800'
                              : request.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-4">
                Posted on {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}