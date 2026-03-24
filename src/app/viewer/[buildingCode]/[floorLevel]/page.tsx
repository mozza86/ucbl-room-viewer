'use server'
import FloorSelector from "@/(components)/floor/FloorSelector";
import FloorViewer from "@/(components)/floor/FloorViewer";
import {getBuildingData} from "@/utils";

interface PageProps {
    params: Promise<{
        buildingCode: string,
        floorLevel: string,
    }>
}

export default async function Page({params}: Readonly<PageProps>) {
    const {floorLevel, buildingCode} = await params;

    const {data, error} = await getBuildingData(buildingCode);
    if (error) return <div>Error loading building data: {error.message}</div>;

    const floor = data.floors.find((floor) => floor.level === floorLevel);
    if (!floor) return <div>Error loading floor data: no floor found for floor &quot;{floorLevel}&quot;</div>

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <FloorSelector currentFloor={floorLevel} currentBuilding={data}/>
            <FloorViewer floor={floor}/>
        </div>
    )
}