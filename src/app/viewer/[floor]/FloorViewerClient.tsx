'use client'
import FloorOverlay from "@/app/viewer/[floor]/FloorOverlay";
import Image from "next/image";
import {FloorData} from "@/app/utils";
import useMeasure from "react-use-measure";
import {useMountedState, useWindowSize} from "react-use";
import {CalendarEvent} from "@/app/ade";

interface FloorViewerClientProps {
    imageUrl: string,
    floorData: FloorData,
    calendarEvents: CalendarEvent[]
}

export default function FloorViewerClient({imageUrl, floorData, calendarEvents}: FloorViewerClientProps) {
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
                          calendarEvents={calendarEvents}/>
            <Image ref={imgRef} src={imageUrl} alt={"floor image"} width={floorData.size.width}
                   height={floorData.size.height}/>
        </div>
    )
}