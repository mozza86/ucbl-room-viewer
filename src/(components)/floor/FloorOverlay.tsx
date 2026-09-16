import {FloorData} from "@/utils";
import RoomOverlay from "@/(components)/room/RoomOverlay";
import {RectReadOnly} from "react-use-measure";
import {CalendarEvent} from "@/ade";

interface FloorOverlayProps {
    floorData: FloorData,
    imgBounds: RectReadOnly,
    isLandscape?: boolean,
    calendarEvents: CalendarEvent[],
    calendarAvailable: boolean
}

export default function FloorOverlay({floorData, imgBounds, isLandscape = true, calendarEvents, calendarAvailable}: Readonly<FloorOverlayProps>) {
    const width = isLandscape ? imgBounds.width : imgBounds.height;
    const height = isLandscape ? imgBounds.height : imgBounds.width;

    const scaleX = width / floorData.size.width;
    const scaleY = height / floorData.size.height;

    return (
        <div style={{width, height}} className="absolute top-0 opacity-90 left-0 z-10">
            {floorData.rooms.map((room) => (
                <RoomOverlay key={room.name} room={room} scaleX={scaleX} scaleY={scaleY}
                             roomEvents={calendarEvents.filter(event => event.location === room.name)}
                             calendarAvailable={calendarAvailable}/>
            ))}
        </div>
    );
}
