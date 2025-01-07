import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to continue to FoodShare</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white shadow-lg rounded-lg",
              headerTitle: "text-2xl font-bold text-gray-900",
              headerSubtitle: "text-gray-600",
              formButtonPrimary: 
                "bg-green-600 hover:bg-green-700 text-white",
              formFieldInput: 
                "block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500",
              footerActionLink: "text-green-600 hover:text-green-700"
            },
          }}
        />
      </div>
    </div>
  );
}
