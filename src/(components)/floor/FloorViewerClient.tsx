'use client'
import FloorOverlay from "@/(components)/floor/FloorOverlay";
import Image from "next/image";
import {FloorData} from "@/utils";
import useMeasure from "react-use-measure";
import {useMountedState, useWindowSize} from "react-use";
import {CalendarEvent} from "@/ade";

interface FloorViewerClientProps {
    floorData: FloorData,
    calendarEvents: CalendarEvent[],
    calendarAvailable: boolean
}

export default function FloorViewerClient({floorData, calendarEvents, calendarAvailable}: Readonly<FloorViewerClientProps>) {
    const [imgRef, bounds] = useMeasure();
    const {width, height} = useWindowSize();
    const isMounted = useMountedState();

    // Keep a stable initial value to match SSR and first hydration render.
    const isLandscape = isMounted() ? width > height : true;

    return (
        <div className="relative" style={{
            transform: isLandscape ? 'rotate(0deg)' : 'rotate(90deg)',
            transition: 'transform 0.3s ease',
        }}>
            <FloorOverlay floorData={floorData} isLandscape={isLandscape} imgBounds={bounds}
                          calendarEvents={calendarEvents} calendarAvailable={calendarAvailable}/>
            <Image ref={imgRef} src={floorData.image} alt={"floor image"} width={floorData.size.width}
                   height={floorData.size.height}/>
        </div>
    )
}
