// app/api/find-user-history/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const posts = await prisma.foodPost.findMany({
      where: {
        donorId: userId,
      },
      include: {
        location: true,
        requests: {
          include: {
            receiver: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[USER_POSTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}