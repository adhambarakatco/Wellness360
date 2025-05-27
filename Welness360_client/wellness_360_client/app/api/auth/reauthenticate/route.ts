import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {    
    const accessToken = cookies().get('access_token')?.value;
    const { currentPassword } = await request.json();;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reauthenticate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
        return NextResponse.json(
            { message: data.message },
            { status: res.status }
        );
    }
    const reauthToken = data.reauthToken;
    const expiresAt = data.expiresAt;

    const response = NextResponse.json(
        { message: "Reauthentication successful" },
        { status: 200 }
    );
    response.cookies.set("reauthToken", reauthToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    
    response.cookies.set("expiresAt", expiresAt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    return response;

}