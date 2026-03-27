import {RoomData} from "@/utils";
import {CalendarEvent} from "@/ade";
import {format} from "date-fns";

interface RoomDetailsProps {
    room: RoomData,
    events: CalendarEvent[]
}

export default function RoomDetails({room, events}: Readonly<RoomDetailsProps>) {

    return (
        <div className="flex flex-col z-[200] bg-white p-1 text-black rounded-lg w-xs border border-gray-200 shadow-2xl text-sm">
            <div className="flex justify-center">{room.name}</div>
            {events.map(event => {
                const desc = event.description.split("(Exporté")[0]
                return (
                    <div key={event.start.toISOString()} className="flex gap-1 border-t border-gray-300 p-0.5 odd:bg-gray-100">
                        <div className=" flex flex-col items-center justify-center text-sm font-bold">
                            <span>{format(event.start, 'HH:mm')}</span>
                            <span>{format(event.end, 'HH:mm')}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="line-clamp-1">{event.summary}</span>
                            <span className="line-clamp-1 text-gray-500">{desc}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}