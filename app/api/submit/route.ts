import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = process.env.GOOGLE_SCRIPT_URL;
    if (!url) {
      return NextResponse.json({ok:true, mode:"demo", message:"Saved in demo mode. Add GOOGLE_SCRIPT_URL for Google Sheets."});
    }
    const response = await fetch(url, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    });
    const text = await response.text();
    return NextResponse.json({ok:response.ok, response:text});
  } catch (e) {
    return NextResponse.json({ok:false,error:String(e)}, {status:500});
  }
}
