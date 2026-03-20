'use client'
import Link from "next/link";
import {BuildingData} from "@/app/utils";

interface FloorSelectorProps {
    currentFloor?: string,
    currentBuilding: BuildingData
}

export default function FloorSelector({currentBuilding, currentFloor}: Readonly<FloorSelectorProps>) {

    const floors = currentBuilding.floors.map(floor => {
        return { label: floor.label, value: floor.level };
    })

    return (
        <div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white bg-opacity-80 rounded-md p-2 shadow-md">
            <div className="flex gap-2">
                <Link
                    className={"px-2 py-0.5 rounded bg-blue-200 hover:bg-blue-300 transition" + (!currentFloor ? " bg-blue-500 text-white" : "")}
                    href={`/viewer/${currentBuilding.code}`}>Tous</Link>
                {floors.map((floor, index) => (
                    <Link key={index}
                          className={"px-2 py-0.5 rounded bg-blue-200 hover:bg-blue-300 transition" + (floor.value.toString() === currentFloor ? " bg-blue-500 text-white" : "")}
                          href={`/viewer/${currentBuilding.code}/${floor.value}`}>{floor.label}</Link>
                ))}
            </div>
        </div>
    );
}