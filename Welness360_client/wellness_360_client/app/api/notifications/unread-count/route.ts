'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET handler - Get unread notification count
export async function GET(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      return NextResponse.json(
        {
          success: false,
          message: result.message || `Request failed with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Notification count error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch unread notification count',
      },
      { status: 500 }
    );
  }
} 