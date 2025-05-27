import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include', // Required to receive the Set-Cookie
  })

  if (!response.ok) {
    const resBody = await response.json()
    return NextResponse.json(
      {
        success: false,
        message: resBody.message || `Request failed with status ${response.status}`,
      },
      { status: response.status }
    )
  }

  const resBody = await response.json()

  // Create a raw HTTP response
  const res = new NextResponse(JSON.stringify(resBody), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  res.cookies.set('access_token', resBody.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  if (!resBody.user.isProfileCompleted) {
    res.cookies.set('isProfileCompleted', 'false', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
  }
  return res
} 