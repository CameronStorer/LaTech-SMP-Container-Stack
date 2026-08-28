import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TrophyRain from '../../components/TrophyRain';
import LeaderboardData from './LeaderboardData';

// Rankings are fetched client-side from /leaderboard-data.json (see LeaderboardData.tsx)
// rather than baked in at build time, so a cron job can refresh the numbers daily without
// needing to rebuild or redeploy the site - see SCRIPTS/gen_leaderboard_data.py.
export default function LeaderboardPage() {
    return (
        <div className="bg-[#002F8B] min-h-screen text-white font-sans relative">
            <TrophyRain />

            <header className="relative z-20 py-3 border-b border-gray-700/50 sticky top-0 bg-[#002F8B]/90 backdrop-blur-sm">
                <div className="container max-w-5xl mx-auto px-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 hover:text-red-400 transition text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </header>

            <main className="relative z-10 container max-w-5xl mx-auto px-4 py-10">
                <h2 className="text-3xl md:text-4xl font-black text-center mb-2">
                    <span className="text-[#E31B23]">LEADERBOARD</span>
                </h2>
                <p className="text-gray-400 text-center text-sm mb-6">Stats from the server, updated daily.</p>

                <LeaderboardData />
            </main>

            <footer className="py-5 border-t border-gray-700/50 mt-8">
                <div className="container mx-auto px-4 text-center text-gray-400 text-xs">
                    <p>&copy; 2026 LA Tech SMP. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
