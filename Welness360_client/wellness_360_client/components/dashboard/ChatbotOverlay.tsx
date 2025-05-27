'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, X, Bot, User, RefreshCw, Copy, Minimize2, Maximize2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatbotOverlayProps {
  isOpen: boolean
  onClose: () => void
}

// Fixed default size
const DEFAULT_SIZE = {
  width: 450,
  height: 600
}

export default function ChatbotOverlay({ isOpen, onClose }: ChatbotOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome',
      role: 'assistant', 
      content: 'Hello! I\'m your personal wellness assistant. How can I help you with your health and wellness journey today?', 
      timestamp: new Date() 
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  
  // Only keep expanded state
  const [isExpanded, setIsExpanded] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input when overlay is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Reset copied message ID after 2 seconds
  useEffect(() => {
    if (copiedMessageId) {
      const timeout = setTimeout(() => {
        setCopiedMessageId(null)
      }, 2000)
      
      return () => clearTimeout(timeout)
    }
  }, [copiedMessageId])
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev)
  }

  // Copy message to clipboard
  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text)
      .then(() => setCopiedMessageId(messageId))
      .catch(() => {}) // Silently fail
  }

  // Retry last message if there was an error
  const retryLastMessage = () => {
    if (messages.length < 2) return
    
    // Find the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user')
    if (lastUserMessageIndex === -1) return
    
    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex]
    
    // Remove the error message and any response after the last user message
    setMessages(messages.slice(0, messages.length - lastUserMessageIndex))
    setError(null)
    
    // Resend the last user message
    handleSendMessage(lastUserMessage.content)
  }

  // Handle sending a message
  const handleSendMessage = async (messageText?: string) => {
    const messageContent = messageText || input.trim()
    
    if (!messageContent) return
    
    // Clear input if we're using the input field
    if (!messageText) {
      setInput('')
    }
    
    // Generate a unique ID for the message
    const messageId = `user-${Date.now()}`
    
    // Add user message
    const userMessage: Message = { 
      id: messageId,
      role: 'user', 
      content: messageContent, 
      timestamp: new Date() 
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)
    
    // Simulate typing indicator after a short delay
    setTimeout(() => setIsTyping(true), 500)
    
    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // Include session ID if we have one
      if (sessionId) {
        headers['x-session-id'] = sessionId
      }
      
      // Send request to API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: messageContent })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      
      // Store session ID if it's the first message
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId)
      }
      
      // Add a slight delay to make the typing indicator more realistic
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsTyping(false)
      
      // Add assistant response
      setMessages(prev => [
        ...prev, 
        { 
          id: `assistant-${Date.now()}`,
          role: 'assistant', 
          content: data.text || 'I apologize, but I couldn\'t process your request. Please try again.', 
          timestamp: new Date() 
        }
      ])
    } catch (err: any) {
      console.error('Error sending message:', err)
      setIsTyping(false)
      setError(err.message || 'Failed to get response')
      
      // Add error message
      setMessages(prev => [
        ...prev, 
        { 
          id: `error-${Date.now()}`,
          role: 'assistant', 
          content: 'I apologize, but I encountered an error processing your request. Please try again.', 
          timestamp: new Date() 
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = () => handleSendMessage()

  // Handle keypress for sending
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  // Calculate styles based on expanded state only
  const containerStyles = isExpanded
    ? { width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh', borderRadius: 0 }
    : { width: `${DEFAULT_SIZE.width}px`, height: `${DEFAULT_SIZE.height}px` }

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${isExpanded ? 'p-0' : 'p-4 md:p-0'} transition-all duration-300 z-50 ${isExpanded ? 'bg-black' : 'bg-black/80 backdrop-blur-md'}`}>
      <div 
        className={`bg-black border ${isExpanded ? 'border-0' : 'border-white/10 rounded-xl'} shadow-2xl max-h-[100vh] flex flex-col overflow-hidden transition-all duration-300 relative`}
        style={containerStyles}
        onClick={e => e.stopPropagation()}
      >
        {/* Header - more professional styling */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Wellness AI Assistant</h3>
              <p className="text-xs text-gray-400">Powered by Google Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Expand/Minimize Button */}
            <button
              onClick={toggleExpanded}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
              aria-label={isExpanded ? "Exit Fullscreen" : "Fullscreen"}
              title={isExpanded ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isExpanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
              aria-label="Close"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-black/80">
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`group flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-primary/20">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className="flex flex-col max-w-[85%]">
                <div 
                  className={`px-4 py-3 rounded-xl ${
                    message.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none shadow-sm' 
                      : 'bg-gray-900 border border-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
                </div>
                
                {/* Message timestamp and actions */}
                <div className={`flex items-center mt-1 text-xs text-gray-500 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
                  
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="ml-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                      aria-label="Copy message"
                    >
                      {copiedMessageId === message.id ? (
                        <span className="text-primary">Copied!</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-primary/20">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="px-4 py-4 rounded-xl bg-gray-900 border border-gray-800 rounded-tl-none">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-900/20 border border-red-900/30 rounded-lg px-4 py-2 text-sm text-red-400 flex items-center gap-2">
                <span>{error}</span>
                <button 
                  onClick={retryLastMessage}
                  className="p-1 hover:bg-red-900/30 rounded transition-colors"
                  aria-label="Retry"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-white/10 bg-gray-950">
          <form 
            onSubmit={e => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything about wellness..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
              disabled={isLoading}
              maxLength={500}
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white p-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || input.trim() === ''}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          
          {/* Character count */}
          <div className="flex justify-end mt-1.5">
            <span className={`text-xs ${input.length > 450 ? 'text-amber-400' : 'text-gray-500'}`}>
              {input.length}/500
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 