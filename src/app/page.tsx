import Link from "next/link";

export default function Home() {
    return (
        <div>
            <Link className="p-2 bg-blue-200 rounded hover:bg-blue-300 transition" href="/viewer">Viewer</Link>
        </div>
    );
}
