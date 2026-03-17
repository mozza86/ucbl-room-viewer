'use server'
import path from "node:path";
import * as fs from "node:fs";

export async function getFloorImageUrl(floor: string) {
    return `/B2/${floor}.jpg`;
}

export type RoomData = {
    name: string;
    adeName: string;
    coords: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    }
    width: number;
    height: number;
}

type RawRoomData = {
    name?: string;
    adeName?: string;
    bbox: [number, number, number, number]; // [x, y, width, height]
};

type RawFloorData = {
    size: [number, number]; // [width, height]
    rooms: RawRoomData[]
}

export type FloorData = {
    size: {
        width: number;
        height: number;
    }
    rooms: RoomData[]
}

function normalizeRoom(room: RawRoomData): RoomData {
    const [x, y, width, height] = room.bbox;

    return {
        name: room.name ?? "Unknown",
        adeName: room.adeName ?? room.name ?? "Unknown",
        coords: {
            x1: x,
            y1: y,
            x2: x + width,
            y2: y + height,
        },
        width,
        height,
    };
}

export async function getFloorData(floor: string): Promise<{ data?: FloorData, error?: Error }> {
    const filePath = path.join(process.cwd(), 'public', 'B2', `${floor}.json`);

    try {
        const fileContents = fs.readFileSync(filePath, 'utf-8');
        const rawData: RawFloorData = JSON.parse(fileContents);

        const data: FloorData = {
            size: {
                width: rawData.size[0],
                height: rawData.size[1],
            },
            rooms: (rawData.rooms ?? []).map(normalizeRoom),
        }

        return {data};
    } catch (error) {
        return {error: error as Error};
    }
}