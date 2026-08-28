'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Clock, Award, Pickaxe, Box, Swords, Crosshair, Skull, Footprints } from 'lucide-react';
import LeaderboardCard, { Entry, formatMoney, formatMinutes, formatCompactNumber } from '../../components/LeaderboardCard';

interface LeaderboardData {
    generatedAt: string;
    money: Entry[];
    playtimeMinutes: Entry[];
    achievements: Entry[];
    blocksMined: Entry[];
    blocksPlaced: Entry[];
    mobKills: Entry[];
    playerKills: Entry[];
    deaths: Entry[];
    blocksTravelled: Entry[];
}

const EMPTY: Entry[] = [];

export default function LeaderboardData() {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        fetch('/leaderboard-data.json', { cache: 'no-store' })
            .then((res) => {
                if (!res.ok) throw new Error(`status ${res.status}`);
                return res.json();
            })
            .then(setData)
            .catch(() => setFailed(true));
    }, []);

    if (!data && !failed) {
        return <p className="text-gray-400 text-center text-sm py-10">Loading leaderboard…</p>;
    }

    if (!data && failed) {
        return <p className="text-gray-400 text-center text-sm py-10">Couldn&apos;t load leaderboard data right now — try again shortly.</p>;
    }

    return (
        <>
            <p className="text-gray-500 text-center text-xs mb-6">
                Updated {new Date(data!.generatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>

            <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                <LeaderboardCard
                    title="Richest Players"
                    icon={<DollarSign className="w-6 h-6" />}
                    entries={data?.money ?? EMPTY}
                    formatValue={formatMoney}
                />
                <LeaderboardCard
                    title="Most Playtime"
                    icon={<Clock className="w-6 h-6" />}
                    entries={data?.playtimeMinutes ?? EMPTY}
                    formatValue={formatMinutes}
                />
                <LeaderboardCard
                    title="Most Achievements"
                    icon={<Award className="w-6 h-6" />}
                    entries={data?.achievements ?? EMPTY}
                    formatValue={(v) => `${v}`}
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto mt-5">
                <LeaderboardCard
                    compact
                    title="Blocks Mined"
                    icon={<Pickaxe className="w-4 h-4" />}
                    entries={data?.blocksMined ?? EMPTY}
                    formatValue={formatCompactNumber}
                />
                <LeaderboardCard
                    compact
                    title="Blocks Placed"
                    icon={<Box className="w-4 h-4" />}
                    entries={data?.blocksPlaced ?? EMPTY}
                    formatValue={formatCompactNumber}
                />
                <LeaderboardCard
                    compact
                    title="Mobs Killed"
                    icon={<Swords className="w-4 h-4" />}
                    entries={data?.mobKills ?? EMPTY}
                    formatValue={formatCompactNumber}
                />
                <LeaderboardCard
                    compact
                    title="Player Kills"
                    icon={<Crosshair className="w-4 h-4" />}
                    entries={data?.playerKills ?? EMPTY}
                    formatValue={formatCompactNumber}
                />
                <LeaderboardCard
                    compact
                    title="Deaths"
                    icon={<Skull className="w-4 h-4" />}
                    entries={data?.deaths ?? EMPTY}
                    formatValue={formatCompactNumber}
                />
                <LeaderboardCard
                    compact
                    title="Blocks Travelled"
                    icon={<Footprints className="w-4 h-4" />}
                    entries={data?.blocksTravelled ?? EMPTY}
                    formatValue={formatCompactNumber}
                />
            </div>
        </>
    );
}
