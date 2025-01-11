import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, content } = await request.json();

    if (!chatId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { donorId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        chatId,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error in message route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
