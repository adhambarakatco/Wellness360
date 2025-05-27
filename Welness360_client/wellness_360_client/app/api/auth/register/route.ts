import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    const result = await response.json()

    return NextResponse.json(
      {
        success: response.ok,
        message: response.ok 
          ? 'Registration successful! Please check your email for verification.' 
          : result.message || `Request failed with status ${response.status}`,
        data: response.ok ? result.data : undefined
      },
      { status: response.status }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to connect to the server. Please try again later.',
      },
      { status: 500 }
    )
  }
} 