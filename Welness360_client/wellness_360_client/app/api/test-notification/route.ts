'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// POST handler - Create a test notification
export async function POST(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  
  // Create a test notification
  const testNotification = {
    title: "Test Notification",
    message: "This is a test notification created at " + new Date().toLocaleTimeString(),
    type: "system",
    priority: "medium"
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(testNotification),
    });

    const result = await response.json();

    return NextResponse.json({
      success: response.ok,
      message: response.ok 
        ? 'Test notification created successfully!' 
        : result.message || `Request failed with status ${response.status}`,
      data: response.ok ? result : undefined,
    }, { status: response.status });
  } catch (error: any) {
    console.error('Test notification error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create test notification',
    }, { status: 500 });
  }
} 