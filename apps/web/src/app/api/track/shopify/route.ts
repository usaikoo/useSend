import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ShopifyTrackingService } from "~/server/service/shopify-tracking-service";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const input = ShopifyTrackingService.parseEventInput(body);
    const event = await ShopifyTrackingService.recordEvent(input, {
      userAgent: req.headers.get("user-agent"),
    });

    if (!event) {
      return NextResponse.json(
        { ok: false, error: "Invalid tracking key" },
        { status: 404, headers: corsHeaders },
      );
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid event payload" },
        { status: 400, headers: corsHeaders },
      );
    }

    console.error("Shopify tracking error:", error);
    return NextResponse.json(
      { ok: false, error: "Tracking error" },
      { status: 500, headers: corsHeaders },
    );
  }
}
