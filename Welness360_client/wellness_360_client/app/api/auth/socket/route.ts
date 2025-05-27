import { NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/app/actions/auth';

export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    
    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    return NextResponse.json({ userId, authenticated: true });
  } catch (error) {
    console.error("Error getting user ID for socket auth:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
} 