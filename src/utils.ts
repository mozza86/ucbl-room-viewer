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
    level: string,
    label: string,
    image: string,
    rooms: RawRoomData[]
}

export type FloorData = {
    size: {
        width: number;
        height: number;
    }
    level: string,
    label: string,
    image: string,
    rooms: RoomData[]
}

type RawBuildingData = {
    "name": string,
    "code": string,
    "adeUrl": string
    "floors": RawFloorData[]
}

export type BuildingData = {
    "name": string,
    "code": string,
    "adeUrl": string,
    "floors": FloorData[]
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

export async function getBuildingList() {
    const filePath = path.join(process.cwd(), 'public');
    const dirList = fs.readdirSync(filePath, {withFileTypes: true});

    return Promise.all(
        dirList.filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .map(async name => await getBuildingData(name))
    )
}

export async function getBuildingData(building: string) {
    const filePath = path.join(process.cwd(), 'public', building, `building.json`);

    try {
        const fileContents = fs.readFileSync(filePath, 'utf-8');
        const rawBuildingData: RawBuildingData = JSON.parse(fileContents);

        const buildingData: BuildingData = {
            name: rawBuildingData.name,
            code: rawBuildingData.code,
            adeUrl: rawBuildingData.adeUrl,
            floors: rawBuildingData.floors.map(rawFloor => ({
                level: rawFloor.level,
                label: rawFloor.label,
                image: rawFloor.image,
                size: {
                    width: rawFloor.size[0],
                    height: rawFloor.size[1],
                },
                rooms: (rawFloor.rooms ?? []).map(normalizeRoom),
            }))
        }

        return {data: buildingData};
    } catch (error) {
        return {error: error as Error};
    }
}