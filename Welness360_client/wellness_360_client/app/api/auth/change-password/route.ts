import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const accessToken = cookies().get('access_token')?.value;
    const { newPassword } = await request.json();
    const reauthToken = cookies().get("reauthToken")?.value;
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ newPassword, reauthToken }),
    });

    const data = await res.json();
    if (!res.ok) {
        return NextResponse.json(
            { message: data.message },
            { status: res.status }
        );
    }
    const response = NextResponse.json(
        { message: "Password changed successfully" },
        { status: 200 }
    );
    response.cookies.delete("reauthToken");
    response.cookies.delete("expiresAt");
    
    return response;
}

