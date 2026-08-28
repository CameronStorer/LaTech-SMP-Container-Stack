'use client';

import { Clipboard } from 'lucide-react';

interface CopyIPButtonProps {
    serverIP: string;
    variant?: 'inline' | 'iconLink';
}

const copyIP = async (serverIP: string) => {
    try {
        await navigator.clipboard.writeText(serverIP);
        alert(`Server IP copied to clipboard: ${serverIP}`);
    } catch (err) {
        console.error('Could not copy text: ', err);
        alert(`Failed to copy IP. Please manually select and copy: ${serverIP}`);
    }
};

export default function CopyIPButton({ serverIP, variant = 'inline' }: CopyIPButtonProps) {
    if (variant === 'iconLink') {
        return (
            <button onClick={() => copyIP(serverIP)} className="flex flex-col items-center hover:text-red-400 transition">
                <Clipboard className="w-9 h-9 mb-1" />
                <span className="font-semibold text-sm">Copy IP</span>
            </button>
        );
    }

    return (
        <div className="flex items-center space-x-2 p-2 bg-blue-950/70 border-2 border-[#E31B23] rounded-lg">
            <span className="font-mono text-sm text-gray-300 select-all cursor-pointer" onClick={() => copyIP(serverIP)}>
                {serverIP}
            </span>
            <button
                onClick={() => copyIP(serverIP)}
                className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600 transition flex items-center space-x-1"
            >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Copy</span>
            </button>
        </div>
    );
}
