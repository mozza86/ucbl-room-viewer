'use client'
import FloorOverlay from "@/app/viewer/[floor]/FloorOverlay";
import Image from "next/image";
import {FloorData} from "@/app/viewer/utils";
import useMeasure from "react-use-measure";
import {useWindowSize} from "react-use";

interface FloorViewerClientProps {
    imageUrl: string,
    floorData: FloorData
}

export default function FloorViewerClient({imageUrl, floorData}: FloorViewerClientProps) {
    const [imgRef, bounds] = useMeasure();
    const {width, height} = useWindowSize();

    const isLandscape = width > height;

    return (
        <div className="relative" style={{
            transform: isLandscape ? 'rotate(0deg)' : 'rotate(90deg)',
            transition: 'transform 0.3s ease',
        }}>
            <FloorOverlay floorData={floorData} isLandscape={isLandscape} imgBounds={bounds}/>
            <Image ref={imgRef} src={imageUrl} alt={"floor image"} width={floorData.size.width}
                   height={floorData.size.height}/>
        </div>
    )
}