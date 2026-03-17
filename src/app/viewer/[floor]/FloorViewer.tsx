'use server'
import {getFloorData, getFloorImageUrl} from "@/app/utils";
import FloorViewerClient from "@/app/viewer/[floor]/FloorViewerClient";
import {CalendarEvent, fetchCalendar} from "@/app/ade";

interface FloorViewerProps {
    floor: string
}

export default async function FloorViewer({floor}: FloorViewerProps) {
    const floorImageUrl = await getFloorImageUrl(floor);
    const {data, error} = await getFloorData(floor);
    if (error) return <div>Error loading floor data: {error.message}</div>;

    const {calendarEvents, error: calendarError} = await fetchCalendar()
    if (calendarError || !calendarEvents) return calendarError

    const processedCalendarEvents: CalendarEvent[] = calendarEvents.filter(event => {
        const eventLocation = event.location?.trim();
        return data?.rooms.some(room => room.adeName === eventLocation);
    }).map(event => {
        const room = data?.rooms.find(room => room.adeName === event.location.trim());
        return {
            ...event,
            location: room ? room.name : event.location, // Use the room name if found, otherwise keep original location
        }
    })

    return <FloorViewerClient imageUrl={floorImageUrl} floorData={data!} calendarEvents={processedCalendarEvents}/>;
}