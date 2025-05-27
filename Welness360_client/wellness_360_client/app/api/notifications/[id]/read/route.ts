'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// PATCH handler - Mark a notification as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = cookies().get('access_token')?.value;
  const { id } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    
    if (!response.ok) {
      if (response.status === 404) {
    
        return NextResponse.json(
          {
            success: false,
            message: 'Notification not found',
          },
          { status: 404 }
        );
      }

      const result = await response.json();
      return NextResponse.json(
        {
          success: false,
          message: result.message || `Request failed with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Notification marked as read',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Notification read update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to mark notification as read',
      },
      { status: 500 }
    );
  }
} 