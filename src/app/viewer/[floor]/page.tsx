'use server'
import FloorSelector from "@/app/viewer/FloorSelector";
import FloorViewer from "@/app/viewer/[floor]/FloorViewer";

interface PageProps {
    params: Promise<{
        floor: string
    }>
}

export default async function Page({params}: PageProps) {
    const {floor} = await params;

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <FloorSelector currentFloor={floor}/>
            <FloorViewer floor={floor}/>
        </div>
    )
}