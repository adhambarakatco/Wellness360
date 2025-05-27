import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email }),
    })

    const result = await response.json()

    return NextResponse.json(
      {
        success: response.ok,
        message: response.ok 
          ? result.message
          : result.message || `Request failed with status ${response.status}`,
        data: response.ok ? result.data : undefined
      },
      { status: response.status }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to process request',
      },
      { status: 500 }
    )
  }
}