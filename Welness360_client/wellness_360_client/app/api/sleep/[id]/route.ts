import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
      const cookieStore = cookies();
      const accessToken = cookieStore.get('access_token')?.value;
  
      if (!accessToken) {
        return NextResponse.json(
          { error: 'Unauthorized - No access token' },
          { status: 401 }
        );
      }
  
      const body = await request.json();
      const id = params.id;
  
      const response = await fetch(`${API_BASE}/sleep/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
  
      let data;
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If the response is not JSON, wrap it in a JSON structure
        data = { message: responseText };
      }
  
      return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating sleep record:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to update sleep record' },
        { status: 500 }
      );
    }
}
  
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
      const cookieStore = cookies();
      const accessToken = cookieStore.get('access_token')?.value;
  
      if (!accessToken) {
        return NextResponse.json(
          { error: 'Unauthorized - No access token' },
          { status: 401 }
        );
      }
  
      const id = params.id;
  
      const response = await fetch(`${API_BASE}/sleep/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
  
      let data;
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If the response is not JSON, wrap it in a JSON structure
        data = { message: responseText };
      }
  
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error deleting sleep record:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to delete sleep record' },
        { status: 500 }
      );
    }
}
  