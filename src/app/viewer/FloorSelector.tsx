'use client'
interface FloorSelectorProps {
    currentFloor?: string
}

export default function FloorSelector({currentFloor = '0'}: FloorSelectorProps) {
    function handleFloorChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const selectedFloor = e.target.value;
        window.location.href = `/viewer/${selectedFloor}`;
    }
    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white bg-opacity-80 rounded-md p-2 shadow-md">
            <select value={currentFloor} onChange={handleFloorChange}>
                <option value="-1">Floor -1</option>
                <option value="0">Floor 0</option>
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
            </select>
        </div>
    );
}