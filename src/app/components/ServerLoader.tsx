import { useEffect, useState } from "react";

interface Props {
    children: React.ReactNode;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ServerLoader({ children }: Props) {

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const wakeServer = async () => {
            try {
                await fetch(`${API_BASE}/api/health`);
                setLoading(false);
            } catch (error) {
                console.error("Server wake failed", error);
                setTimeout(wakeServer, 3000);
            }
        };
        wakeServer();
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-3"> Digital Access Catalogue System </h1>
                    <p className="text-gray-600"> Connecting to server... </p>
                    <p className="text-sm text-gray-400 mt-2"> Initial startup may take up to 1 minute. </p>
                </div>
            </div>
        );
    }
    return <>{children}</>;
}