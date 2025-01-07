import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from '@prisma/client';
import DonorDashboard from "@/components/DonorDashboard";
import ReceiverDashboard from "@/components/ReceiverDashboard";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      location: true,
    },
  });

  if (!user) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {user.role === "DONOR" ? (
        <DonorDashboard user={{ ...user, location: user.location || { userId: '', id: '', latitude: 0, longitude: 0, address: '' } }} />
      ) : (
        <ReceiverDashboard user={{ ...user, location: user.location || { userId: '', id: '', latitude: 0, longitude: 0, address: '' } }} />
      )}
    </div>
  );
}