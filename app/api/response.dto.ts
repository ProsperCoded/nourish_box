import { NextResponse } from "next/server";

export class ResponseDto<T = any> {
  constructor(
    public message: string,
    public status: number,
    public data?: T,
    public error?: {
      cause?: unknown;
      name?: string;
      statusCode?: number;
    }
  ) {}

  public static createSuccessResponse<T>(
    message: string,
    data?: T
  ): NextResponse<ResponseDto<T>> {
    return NextResponse.json(new ResponseDto<T>(message, 200, data));
  }

  public static createErrorResponse<T>(
    message: string,
    error?: {
      cause?: unknown;
      name?: string;
      statusCode?: number;
    }
  ): NextResponse<ResponseDto<T>> {
    return NextResponse.json(
      new ResponseDto<T>(message, error?.statusCode || 500, undefined, error)
    );
  }
}
