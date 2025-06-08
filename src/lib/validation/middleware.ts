import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'

export function validateRequest<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        }
      }
      return {
        success: false,
        error: 'Invalid request body',
      }
    }
  }
}

export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)
      return await handler(request, validatedData)
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors,
          },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
  }
}
