import ICAL from "ical.js";
import {format, isBefore, subMinutes} from 'date-fns';

const resources = '9113,126,134,132,118,119,120,121,122,123,135,136,133,9188,344,127,128,129,130,131';


export type CalendarEvent = {
    location: string;
    start: Date;
    end: Date;
    summary: string;
    description: string;
}

let calendars: CalendarEvent[] | null = null;
let calendarCache: Date | null = null;
let inFlightRefresh: Promise<{ error?: string, calendarEvents?: CalendarEvent[] }> | null = null;

function refreshCalendars() {
    inFlightRefresh ??= fetchCalendar().finally(() => {
        inFlightRefresh = null;
    });

    return inFlightRefresh;
}

export async function getCalendars() {
    const isCacheMissing = !calendars;
    const isCacheExpired = !calendarCache || isBefore(calendarCache, subMinutes(new Date(), 10));

    if (isCacheMissing || isCacheExpired) {
        const {error, calendarEvents} = await refreshCalendars();

        if (calendarEvents) {
            calendars = calendarEvents;
            calendarCache = new Date();
            console.log('Reconstructed cache', calendarCache);
        } else if (!calendars) {
            return {error};
        } else {
            console.warn('Calendar refresh failed, returning stale cache', error);
        }
    }

    return {calendarEvents: calendars};
}

export async function fetchCalendar(): Promise<{ error?: string, calendarEvents?: CalendarEvent[] }> {
    try {
        const currentDate = format(new Date(), 'yyyy-MM-dd');
        const url = `https://edt.univ-lyon1.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resources}&projectId=1&calType=ical&firstDate=${currentDate}&lastDate=${currentDate}`;
        console.info("Fetching calendar events:", calendarCache, url);
        const response = await fetch(url);
        if (!response.ok) return {error: response.statusText};

        const data = await response.text();
        const jcalData = ICAL.parse(data);
        const comp = new ICAL.Component(jcalData);
        const events = comp.getAllSubcomponents("vevent").map(event => new ICAL.Event(event));

        const calendarEvents: CalendarEvent[] = events.map((event) => ({
            location: event.location,
            start: event.startDate.toJSDate(),
            end: event.endDate.toJSDate(),
            summary: event.summary,
            description: event.description,
        }));

        return {calendarEvents};
    } catch (e) {
        const error = e as Error;
        return {error: error.message};
    }

}
