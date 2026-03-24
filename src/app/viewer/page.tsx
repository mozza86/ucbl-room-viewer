import {getBuildingList} from "@/utils";
import Link from "next/link";

export default async function Page() {
    const buildings = await getBuildingList()

    return (
        <div>
            {buildings.map(({data, error}, idx) => {
                if (error) return <div key={idx}>{error.message}</div>;

                return <Link href={`/viewer/${data.code}`} key={data.code} className="block p-4 border rounded mb-2">
                    {data.code} - {data.name}
                </Link>
            })}
        </div>
    )
}
