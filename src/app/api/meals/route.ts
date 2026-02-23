import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── GET /api/meals?date=YYYY-MM-DD ────────────────────────────────────────

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    let where = {};
    if (dateStr) {
        const start = new Date(dateStr);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateStr);
        end.setHours(23, 59, 59, 999);
        where = {
            dateTime: { gte: start, lte: end },
            deletedAt: null,
        };
    } else {
        where = { deletedAt: null };
    }

    const meals = await db.meal.findMany({
        where,
        orderBy: { dateTime: "desc" },
    });

    return NextResponse.json({ meals });
}

// ─── DELETE /api/meals  (soft delete via body) ─────────────────────────────

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json() as { id: number };
        const meal = await db.meal.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return NextResponse.json({ meal });
    } catch (err) {
        console.error("[/api/meals DELETE]", err);
        return NextResponse.json({ error: "软删除失败" }, { status: 500 });
    }
}

// ─── PATCH /api/meals  (edit description / mealType / dateTime) ────────────

export async function PATCH(req: NextRequest) {
    try {
        const { id, descriptionText, mealType, dateTime, note } = await req.json() as {
            id: number;
            descriptionText?: string;
            mealType?: string;
            dateTime?: string;
            note?: string;
        };

        const meal = await db.meal.update({
            where: { id },
            data: {
                ...(descriptionText !== undefined && { descriptionText }),
                ...(mealType !== undefined && { mealType }),
                ...(dateTime !== undefined && { dateTime: new Date(dateTime) }),
            },
        });
        return NextResponse.json({ meal });
    } catch (err) {
        console.error("[/api/meals PATCH]", err);
        return NextResponse.json({ error: "更新失败" }, { status: 500 });
    }
}
