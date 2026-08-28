export interface Entry {
    name: string;
    value: number;
}

export const MEDALS = ['🥇', '🥈', '🥉'];

export function formatMoney(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(2)}`;
}

export function formatCompactNumber(v: number): string {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}b`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}m`;
    if (v > 999) return `${(v / 1_000).toFixed(1)}k`;
    return v.toLocaleString();
}

export function formatMinutes(mins: number): string {
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    return `${hours}h ${remainder}m`;
}

export default function LeaderboardCard({
    title,
    icon,
    entries,
    formatValue,
    compact = false,
}: {
    title: string;
    icon: React.ReactNode;
    entries: Entry[];
    formatValue: (v: number) => string;
    compact?: boolean;
}) {
    if (compact) {
        return (
            <div className="bg-blue-950/50 border border-gray-700/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-2 text-[#E31B23]">
                    {icon}
                    <h3 className="text-xs font-bold uppercase tracking-wide">{title}</h3>
                </div>
                {entries.length === 0 ? (
                    <p className="text-gray-500 text-xs">No data yet</p>
                ) : (
                    <ol className="space-y-1">
                        {entries.map((e, i) => (
                            <li key={e.name} className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 truncate">
                                    <span className="w-4 text-center shrink-0">{MEDALS[i] ?? `#${i + 1}`}</span>
                                    <span className="font-semibold truncate">{e.name}</span>
                                </span>
                                <span className="font-mono text-gray-300 shrink-0 ml-1">{formatValue(e.value)}</span>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        );
    }

    return (
        <div className="bg-blue-950/50 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4 text-[#E31B23]">
                {icon}
                <h3 className="text-lg font-bold">{title}</h3>
            </div>
            {entries.length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet — get out there and play!</p>
            ) : (
                <ol className="space-y-2">
                    {entries.map((e, i) => (
                        <li key={e.name} className="flex items-center justify-between border-b border-gray-700/30 pb-1.5 last:border-0 text-sm">
                            <span className="flex items-center gap-2">
                                <span className="w-5 text-center">{MEDALS[i] ?? `#${i + 1}`}</span>
                                <span className="font-semibold">{e.name}</span>
                            </span>
                            <span className="font-mono text-gray-300">{formatValue(e.value)}</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
