import ICAL from "ical.js";
import {format, isBefore, subMinutes} from 'date-fns';

const currentDate = format(new Date(), 'yyyy-MM-dd');

const url = `https://edt.univ-lyon1.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=9113,126,134,132,118,119,120,121,122,123,135,136,133,9188,344,127,128,129,130,131&projectId=1&calType=ical&firstDate=${currentDate}&lastDate=${currentDate}`


export type CalendarEvent = {
    location: string;
    start: Date;
    end: Date;
    summary: string;
    description: string;
}

let calendars: CalendarEvent[];
let calendarCache: Date;

export async function getCalendars() {
    const isCacheMissing = !calendars
    const isCacheExpired = isBefore(calendarCache, subMinutes(new Date(), 10))
    console.log('Calendars missing in cache', isCacheMissing);
    console.log('Calendars cache expired', isCacheExpired, calendarCache)

    if (isCacheMissing || isCacheExpired) {
        const {error, calendarEvents} = await fetchCalendar()
        if (!calendarEvents) return {error};
        calendars = calendarEvents
        calendarCache = new Date()
        console.log('Reconstructed cache', calendarCache)
    }
    return {calendarEvents: calendars};
}

export async function fetchCalendar(): Promise<{ error?: string, calendarEvents?: CalendarEvent[] }> {
    try {
        console.info("Fetching calendar events:", url);
        const response = await fetch(url)
        if (!response.ok) return {error: response.statusText};

        const data = await response.text();
        const jcalData = ICAL.parse(data);
        const comp = new ICAL.Component(jcalData);
        const events = comp.getAllSubcomponents("vevent").map(event => new ICAL.Event(event));

        const calendarEvents: CalendarEvent[] = events.map(event => ({
            location: event.location,
            start: event.startDate.toJSDate(),
            end: event.endDate.toJSDate(),
            summary: event.summary,
            description: event.description,
        }))

        return {calendarEvents}
    } catch (e) {
        const error = e as Error
        return {error: error.message}
    }

}
