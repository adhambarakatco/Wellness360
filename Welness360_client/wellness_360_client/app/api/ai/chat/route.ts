import { NextResponse } from 'next/server'

// Utility function for structured logging
function logApiEvent(type: 'request' | 'response' | 'error', data: any) {
  const timestamp = new Date().toISOString()
  console.log(JSON.stringify({
    timestamp,
    type,
    ...data
  }))
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    // Extract session ID from headers
    const sessionId = req.headers.get('x-session-id')
    
    // Parse request body
    const body = await req.json().catch(() => ({}))
    const { prompt } = body
    
    // Validate request
    if (!prompt || typeof prompt !== 'string') {
      logApiEvent('error', {
        requestId,
        error: 'Invalid request',
        details: 'Missing or invalid prompt',
        duration: Date.now() - startTime
      })
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request. Prompt is required and must be a string.' 
        },
        { status: 400 }
      )
    }
    
    // Log request
    logApiEvent('request', {
      requestId,
      sessionId: sessionId || 'new-session',
      promptLength: prompt.length,
    })
    
    // Fetch from the Gemini API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gemini/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt,
        sessionId: sessionId || undefined
      }),
    })
    
    // Handle non-success responses
    if (!response.ok) {
      const errorText = await response.text().catch(() => null)
      let errorData
      
      try {
        errorData = errorText ? JSON.parse(errorText) : null
      } catch {
        errorData = null
      }
      
      const errorMessage = errorData?.error || `API request failed with status ${response.status}`
      
      logApiEvent('error', {
        requestId,
        error: 'API request failed',
        status: response.status,
        details: errorMessage,
        duration: Date.now() - startTime
      })
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage
        },
        { status: response.status }
      )
    }
    
    // Parse successful response
    const result = await response.json()
    
    
    // Return formatted response
    return NextResponse.json({ 
      success: true,
      sessionId: result.sessionId,
      text: result.response
    })
    
  } catch (error: any) {
    // Log error
    logApiEvent('error', {
      requestId,
      error: error.name || 'UnknownError',
      message: error.message || 'An unknown error occurred',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      duration: Date.now() - startTime
    })
    
    // Return error response
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
} 