export async function GET(request: Request) {
  const headers = Object.fromEntries(request.headers.entries());
  console.log("LinkedIn Debug:", {
    url: request.url,
    headers,
    userAgent: headers["user-agent"],
    timestamp: new Date().toISOString(),
  });

  return new Response("Debug endpoint", { status: 200 });
}
