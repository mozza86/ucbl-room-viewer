import {FloorData} from "@/app/viewer/utils";
import RoomOverlay from "@/app/viewer/[floor]/RoomOverlay";
import {RectReadOnly} from "react-use-measure";

interface FloorOverlayProps {
    floorData: FloorData,
    imgBounds: RectReadOnly
    isLandscape?: boolean,
}

export default function FloorOverlay({floorData, imgBounds, isLandscape = true}: FloorOverlayProps) {
    const width = isLandscape ? imgBounds.width : imgBounds.height;
    const height = isLandscape ? imgBounds.height : imgBounds.width;

    const scaleX = width / floorData.size.width;
    const scaleY = height / floorData.size.height;

    console.log(`Rendering floor overlay with scaleX: ${scaleX}, scaleY: ${scaleY}, width: ${width}, height: ${height}, realImageWidth: ${floorData.size.width}, realImageHeight: ${floorData.size.height}`);

    return (
        <div style={{width, height}} className="absolute top-0 left-0 opacity-50 z-10">
            {floorData.rooms.map((room) => (
                <RoomOverlay key={room.name} room={room} scaleX={scaleX} scaleY={scaleY}/>
            ))}
        </div>
    );
}