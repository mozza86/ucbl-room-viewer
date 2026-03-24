import {RoomData} from "@/utils";
import {CalendarEvent} from "@/ade";
import {format, isWithinInterval} from "date-fns";
import RoomDetails from "@/(components)/room/RoomDetails";
import {useRef} from "react";
import {useMouse} from "react-use";

interface RoomOverlayProps {
    room: RoomData,
    scaleX?: number,
    scaleY?: number,
    roomEvents: CalendarEvent[]
}

export default function RoomOverlay({room, scaleX = 1, scaleY = 1, roomEvents}: Readonly<RoomOverlayProps>) {
    const now = new Date();

    const currentEvent = roomEvents.find(event => isWithinInterval(now, {start: event.start, end: event.end}));

    let statusRoom = "Libre"
    let description = ""
    let label = ""
    let bgColor = "#00C950"

    if (currentEvent) {
        statusRoom = "Occupée - " + format(currentEvent.end, 'HH:mm');
        description = currentEvent.summary
        label = `Fin ${format(currentEvent.end, 'HH:mm')}`
        bgColor = "#ff974d"
    }

    const nextEvent = roomEvents.find(event => event.start > now);

    if (nextEvent && currentEvent) {
        statusRoom = "Occupée - " + format(nextEvent.end, 'HH:mm');
        description = currentEvent.summary;
        bgColor = "#ff974d"
    }

    if (nextEvent && !currentEvent) {
        statusRoom = `Libre - ${format(nextEvent.start, 'HH:mm')}`
        description = nextEvent.summary;
        label = `${statusRoom}:`
        bgColor = "#38df77"
    }

    const ref = useRef<HTMLDivElement>(null);
    const {elX, elY} = useMouse(ref);

    return (
        <div
            ref={ref}
            style={{
            left: room.coords.x1 * scaleX,
            top: room.coords.y1 * scaleY,
            width: room.width * scaleX,
            height: room.height * scaleY,
            backgroundColor: bgColor,
        }}
             className="group border-2 border-black absolute z-20">
            <div className="flex flex-col items-center justify-center text-sm text-white w-full h-full font-bold">
                <div className="w-full text-sm text-center line-clamp-1">
                    {statusRoom}
                    <hr/>
                </div>

                <span className="grow w-full flex justify-center items-center text-3xl">{room.name}</span>

                <div className="w-full text-sm text-center flex flex-col">
                    <hr/>
                    <span className="line-clamp-1">{label}</span>
                    <span className="line-clamp-1">{description}</span>
                </div>
            </div>
            <div
                 style={{
                     position: "absolute",
                     left: elX-160 + "px",
                     top: elY + "px",
                 }}
                 className="hidden group-hover:block">
                <RoomDetails room={room} events={roomEvents}/>
            </div>
        </div>
    );
}