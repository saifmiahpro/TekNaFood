import { NextResponse } from "next/server"

export async function POST() {
    const response = NextResponse.json({ success: true })

    // Supprimer le cookie
    response.cookies.set({
        name: 'admin_session',
        value: '',
        expires: new Date(0),
        path: '/',
    })

    return response
}
