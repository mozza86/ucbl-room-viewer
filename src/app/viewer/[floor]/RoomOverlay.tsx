import {RoomData} from "@/app/viewer/utils";

interface RoomOverlayProps {
    room: RoomData,
    scaleX?: number,
    scaleY?: number
    occupied?: boolean,
}

export default function RoomOverlay({room, occupied, scaleX = 1, scaleY = 1}: RoomOverlayProps) {
    occupied ??= false;
    const bgColor = occupied ? '#ff974d' : '#00C950';
    return (
        <div style={{
            left: room.coords.x1*scaleX,
            top: room.coords.y1*scaleY,
            width: room.width*scaleX,
            height: room.height*scaleY,
            backgroundColor: bgColor,
        }}
             className="border-white border-6 absolute z-20 text-6xl flex items-center justify-center text-white font-bold">
            {room.name}
        </div>
    );
}