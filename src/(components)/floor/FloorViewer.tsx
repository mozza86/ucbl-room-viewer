'use server'
import {FloorData} from "@/utils";
import FloorViewerClient from "@/(components)/floor/FloorViewerClient";
import {CalendarEvent, getCalendars} from "@/ade";

interface FloorViewerProps {
    floor: FloorData
}

export default async function FloorViewer({floor}: Readonly<FloorViewerProps>) {
    const {calendarEvents, error: calendarError} = await getCalendars()
    if (calendarError || !calendarEvents) return calendarError

    const processedCalendarEvents: CalendarEvent[] = calendarEvents.filter(event => {
        const eventLocation = event.location?.trim();
        return floor?.rooms.some(room => room.adeName === eventLocation);
    }).map(event => {
        const room = floor?.rooms.find(room => room.adeName === event.location.trim());
        return {
            ...event,
            location: room ? room.name : event.location, // Use the room name if found, otherwise keep original location
        }
    })

    return <FloorViewerClient floorData={floor} calendarEvents={processedCalendarEvents}/>;
}