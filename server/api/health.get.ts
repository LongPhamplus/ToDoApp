// server/api/health.get.ts
import { connectDB } from '../utils/mongoose'
import type { ApiResponse } from '../../app/types/todo'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()
    
    return {
      success: true,
      message: '✅ Server is running and MongoDB is connected!',
      data: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      }
    }
  } catch (error: any) {
    console.error('❌ Health check error:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: error.message || 'Failed to connect to database',
    }
  }
})
