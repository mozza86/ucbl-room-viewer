'use client'
import Link from "next/link";

interface FloorSelectorProps {
    currentFloor?: string
}

export default function FloorSelector({currentFloor = '0'}: FloorSelectorProps) {
    const floors = [{
        label: "Sous sol",
        value: -1
    }, {
        label: "RdC",
        value: 0
    }, {
        label: "1er étage",
        value: 1
    }, {
        label: "2ème étage",
        value: 2
    }]

    return (
        <div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white bg-opacity-80 rounded-md p-2 shadow-md">
            <div className="flex gap-2">
                {floors.map((floor, index) => (
                    <Link key={index}
                          className={"px-2 py-0.5 rounded bg-blue-200 hover:bg-blue-300 transition" + (floor.value.toString() === currentFloor ? " bg-blue-500 text-white" : "")}
                          href={"/viewer/" + floor.value}>{floor.label}</Link>
                ))}
            </div>
        </div>
    );
}