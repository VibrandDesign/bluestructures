import { corsResponse } from "../lib/api-cors";

export async function OPTIONS(request: Request) {
  return corsResponse(request);
}

export function GET(request: Request) {
  return corsResponse(request, {
    message: "Hello from me",
  });
}
