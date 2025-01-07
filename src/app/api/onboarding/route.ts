// app/api/onboarding/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { role, location, name, email } = body;

    // Validate role
    if (!role || !Object.values(UserRole).includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Validate location
    if (!location || !location.latitude || !location.longitude || !location.address) {
      return new NextResponse("Invalid location data", { status: 400 });
    }

    // Use upsert to create or update the user
    const updatedUser = await prisma.user.upsert({
      where: {
        id: userId
      },
      create: {
        id: userId,
        name,
        email,
        role: role as UserRole,
        location: {
          create: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address
          }
        }
      },
      update: {
        role: role as UserRole,
        location: {
          create: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address
          }
        }
      },
      include: {
        location: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        location: true
      }
    });

    // Even if user doesn't exist, return a response that indicates onboarding is needed
    if (!user) {
      return NextResponse.json({
        user: null,
        isOnboardingComplete: false
      });
    }

    const isOnboardingComplete = user.role && user.location;

    return NextResponse.json({
      user,
      isOnboardingComplete
    });
  } catch (error) {
    console.error("[ONBOARDING_STATUS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}