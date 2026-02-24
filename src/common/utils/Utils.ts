import { HttpStatus } from "@nestjs/common";

import { AppResponse, ErrorData } from "src/types/app";

export class AppUtils {
  static successResponse = <T extends object | null>(
    message: string,
    data: T,
    statusCode: HttpStatus = HttpStatus.OK,
  ): AppResponse<T> => {
    return {
      success: true,
      statusCode,
      data,
      message,
    };
  };

  static errorResponse = (
    data: ErrorData,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ): AppResponse<ErrorData> => {
    return {
      success: false,
      statusCode,
      data,
    };
  };
}