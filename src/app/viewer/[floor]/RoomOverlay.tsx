import {RoomData} from "@/app/utils";
import {CalendarEvent} from "@/app/ade";
import {format, isWithinInterval} from "date-fns";

interface RoomOverlayProps {
    room: RoomData,
    scaleX?: number,
    scaleY?: number,
    roomEvents: CalendarEvent[]
}

export default function RoomOverlay({room, scaleX = 1, scaleY = 1, roomEvents}: RoomOverlayProps) {
    const now = new Date();

    const currentEvent = roomEvents.find(event => isWithinInterval(now, {start: event.start, end: event.end}));
    const isOccupied = !!currentEvent;

    const bgColor = isOccupied ? '#ff974d' : '#00C950';


    let statusRoom = "Libre le reste de la journée"
    let description = ""
    let label = ""

    if (currentEvent) {
        statusRoom = "Occupée jusqu'à " + format(currentEvent.end, 'HH:mm');
        description = currentEvent.summary
        label = `Fin: ${format(currentEvent.end, 'HH:mm')}`
    }

    const nextEvent = roomEvents.find(event => event.start > now);

    if (nextEvent && currentEvent) {
        statusRoom = "Occupée jusqu'à " + format(nextEvent.end, 'HH:mm');
        description = currentEvent.summary;
    }

    if (nextEvent && !currentEvent) {
        statusRoom = `Libre jusqu'à ${format(nextEvent.start, 'HH:mm')}`
        description = nextEvent.summary;
        label = `${statusRoom}:`
    }


    return (
        <div style={{
            left: room.coords.x1 * scaleX,
            top: room.coords.y1 * scaleY,
            width: room.width * scaleX,
            height: room.height * scaleY,
            backgroundColor: bgColor,
        }}
             className="border-2 border-black absolute z-20">
            <div className="flex flex-col items-center justify-center text-white w-full h-full font-bold">
                <div className="w-full text-sm text-center">
                    {statusRoom}
                    <hr/>
                </div>

                <span className="grow w-full flex justify-center items-center text-5xl">{room.name}</span>

                <div className="w-full text-sm text-center flex flex-col">
                    <hr/>
                    <span>{label}</span>
                    <span>{description}</span>
                </div>
            </div>
        </div>
    );
}