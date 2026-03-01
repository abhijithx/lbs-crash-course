// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Maintenance from 12:00 to 12:02 PM
  // const isMaintenanceTime = hours === 12 && minutes >= 0 && minutes <= 2;
  const isMaintenanceTime = false;

  if (isMaintenanceTime && !request.nextUrl.pathname.startsWith('/maintenance')) {
    const url = new URL('/maintenance', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
