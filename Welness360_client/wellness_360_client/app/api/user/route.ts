'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET handler
export async function GET(req: NextRequest) {
    const accessToken = cookies().get('access_token')?.value;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const result = await response.json();

        return new NextResponse(
            JSON.stringify({
                success: response.ok,
                message: response.ok
                    ? 'User data fetched successfully!'
                    : result.message || `Request failed with status ${response.status}`,
                data: response.ok ? result : undefined,
            }),
            {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error: any) {
        console.error('User data fetch error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to fetch user data',
            },
            { status: 500 }
        );
    }
}

// PUT handler
export async function PUT(req: NextRequest) {
    const accessToken = cookies().get('access_token')?.value;
    const body = await req.json();
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        const res = new NextResponse(
            JSON.stringify({
                success: response.ok,
                message: response.ok
                    ? 'Profile updated successfully!'
                    : result.message || `Request failed with status ${response.status}`,
                data: response.ok ? result.user : undefined,
            }),
            {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            }
        );

        // Delete cookie if update was successful
        if (response.ok) {
            cookies().delete('isProfileCompleted');
        }

        return res;
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to update profile',
            },
            { status: 500 }
        );
    }
}
