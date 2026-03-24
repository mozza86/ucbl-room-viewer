import {getBuildingList} from "@/utils";
import Link from "next/link";

export default async function Page() {
    const buildings = await getBuildingList()

    return (
        <div>
            {buildings.map((building) => (
                <Link href={`/viewer/${building}`} key={building} className="block p-4 border rounded mb-2">
                    {building}
                </Link>
            ))}
        </div>
    )
}
