// app/api/posts/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, quantity, expiryDate } = body;

    // Validate required fields
    if (!title || !description || !quantity || !expiryDate) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get user's location
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { location: true }
    });

    if (!user || !user.location) {
      return new NextResponse("User or location not found", { status: 404 });
    }

    // Create new food post
    const post = await prisma.foodPost.create({
      data: {
        title,
        description,
        quantity,
        expiryDate: new Date(expiryDate),
        donor: {
          connect: { id: userId }
        },
        location: {
          connect: { id: user.location.id }
        }
      },
      include: {
        location: true,
        donor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POSTS_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the user's role and location
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { location: true }
    });

    if (!user || !user.location) {
      return new NextResponse("User or location not found", { status: 404 });
    }

    // Build the query based on role and filters
    const query: any = {
      where: {
        status: "AVAILABLE",
        // If user is donor, only show their posts
        ...(user.role === "DONOR" ? { donorId: userId } : {})
      },
      include: {
        location: true,
        donor: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    };

    // Add distance filter if provided
    const maxDistance = searchParams.get("maxDistance");
    if (maxDistance) {
      // Note: This is a simplified version. For real distance calculations,
      // you might want to use a PostGIS extension or similar
      query.where.location = {
        latitude: {
          gte: user.location.latitude - parseFloat(maxDistance),
          lte: user.location.latitude + parseFloat(maxDistance)
        },
        longitude: {
          gte: user.location.longitude - parseFloat(maxDistance),
          lte: user.location.longitude + parseFloat(maxDistance)
        }
      };
    }

    // Add expiry filter
  

    const posts = await prisma.foodPost.findMany(query);

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[POSTS_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}