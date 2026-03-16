'use server'
import {getFloorData, getFloorImageUrl} from "@/app/viewer/utils";
import FloorViewerClient from "@/app/viewer/[floor]/FloorViewerClient";

interface FloorViewerProps {
    floor: string
}

export default async function FloorViewer({floor}: FloorViewerProps) {
    const floorImageUrl = await getFloorImageUrl(floor);
    const {data, error} = await getFloorData(floor);
    if (error) return <div>Error loading floor data: {error.message}</div>;

    return <FloorViewerClient imageUrl={floorImageUrl} floorData={data!} />;
}