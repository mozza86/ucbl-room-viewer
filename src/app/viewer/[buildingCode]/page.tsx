'use server'
import FloorViewer from "@/(components)/floor/FloorViewer";
import {getBuildingData} from "@/utils";
import FloorSelector from "@/(components)/floor/FloorSelector";

interface PageProps {
    params: Promise<{
        buildingCode: string,
    }>
}

export default async function Page({params}: Readonly<PageProps>) {
    const {buildingCode} = await params;

    const {data, error} = await getBuildingData(buildingCode);
    if (error) return <div>Error loading building data: {error.message}</div>;

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <FloorSelector currentBuilding={data}/>
            {data.floors.map((floor) => (
                <FloorViewer key={floor.level} floor={floor}/>
            ))}
        </div>
    )
}