import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    
    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Find the post
    const post = await prisma.foodPost.findUnique({
      where: { id: postId },
      include: { donor: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Find or create chat
    let chat = await prisma.chat.findFirst({
      where: { 
        postId: postId,
        OR: [
          { donorId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        donor: true,
        receiver: true,
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          postId: postId,
          donorId: post.donorId,
          receiverId: userId,
          messages: {
            create: {
              content: "Chat started",
              senderId: userId,
            },
          },
        },
        include: {
          messages: true,
          donor: true,
          receiver: true,
        },
      });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
