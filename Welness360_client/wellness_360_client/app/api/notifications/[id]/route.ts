'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET handler - Get a notification by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = cookies().get('access_token')?.value;
  const { id } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`, {
      method: 'GET',
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

    const result = await response.json();
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Notification fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch notification',
      },
      { status: 500 }
    );
  }
}

// PATCH handler - Update a notification by ID
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = cookies().get('access_token')?.value;
  const { id } = params;
  const body = await req.json();

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
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

    const result = await response.json();
    return NextResponse.json(
      {
        success: true,
        message: 'Notification updated successfully',
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update notification',
      },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a notification by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = cookies().get('access_token')?.value;
  const { id } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`, {
      method: 'DELETE',
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

    // For status 204 No Content, we should not return a body
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Notification deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to delete notification',
      },
      { status: 500 }
    );
  }
} 