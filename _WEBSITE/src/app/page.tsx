import fs from 'fs';
import path from 'path';
import Image from "next/image";
import Link from "next/link";
import Button from '../components/Button';
import CopyIPButton from '../components/CopyIPButton';
import Carousel from '../components/Carousel';
import { Instagram, MessageSquare, Mail, Trophy } from 'lucide-react';
import logo from '../../public/logo.webp';

// Tech Blue: #002F8B
// Tech Red: #E31B23

const SERVER_IP = 'PLAY.LATECHSMP.NET';
const DISCORD_LINK = 'https://discord.gg/MTVf7rSjaa';
const INSTAGRAM_LINK = 'https://www.instagram.com/latech.minecraft/';
const MAIL_LINK = 'mailto:contact@latechsmp.net';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

function getGalleryImages(): string[] {
    const dir = path.join(process.cwd(), 'public', 'gallery');
    try {
        return fs
            .readdirSync(dir)
            .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
            .sort()
            .map((f) => `/gallery/${f}`);
    } catch {
        return [];
    }
}

export default function Home() {
    const galleryImages = getGalleryImages();

    return (
        <div className="bg-[#002F8B] min-h-screen text-white font-sans">
            {/* Navigation */}
            <header className="py-3 border-b border-gray-700/50 sticky top-0 bg-[#002F8B]/90 backdrop-blur-sm z-40">
                <div className="container max-w-5xl mx-auto px-4 flex justify-between items-center">
                    <h1 className="lg:text-2xl text-lg font-extrabold tracking-widest text-[#E31B23] uppercase">
                        <a href="#">
                          <div className="container flex justify-between items-center">
                            <Image alt="logo" src={logo} width={38} height={38} className="mr-3"/>
                            LATech SMP
                          </div>
                        </a>
                    </h1>
                    <nav className="space-x-2 sm:space-x-4 text-xs sm:text-sm">
                        <a href="#join" className="hover:text-red-400 transition">Join</a>
                        <a href="#info" className="hover:text-red-400 transition">Info</a>
                        <Link href="/leaderboard" className="hover:text-red-400 transition">Leaderboard</Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section (Primary CTA) */}
            <main id="join" className="mx-auto px-4 py-14 text-center tiled-bg-blue scroll-mt-16"
            style={{ textShadow: '2px 4px 20px rgba(0,0,0,1)' }}>
                <h2 className="text-4xl md:text-6xl font-black mb-5 leading-tight tracking-tighter">
                    <span className="text-[#E31B23]">CRAFT</span> YOUR LEGACY <br className="hidden md:block" />
                    <span className="whitespace-nowrap">AT <span className="text-white">LA TECH</span>.</span>
                </h2>

                <div className="inline-flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-center">
                    <Button
                        href={DISCORD_LINK}
                        text="JOIN THE DISCORD"
                        isPrimary
                        target="_blank"
                    />

                    <CopyIPButton serverIP={SERVER_IP} />
                </div>

                <p className="text-gray-400 text-base mt-4">Unofficial Student-Run Server</p>
                <p className="text-gray-400 mt-1 text-sm">Cross-play: Minecraft Java &amp; Bedrock Edition, always on the latest version</p>
                <p className="text-gray-400 mt-1 text-sm">Bedrock players: use port <span className="font-mono text-white">50060</span></p>
            </main>

            {/* Gallery Section - photos fill the section as a background, text sits on top */}
            <section id="gallery" className="relative py-8 md:py-14 scroll-mt-16 min-h-[220px] sm:min-h-[300px] md:min-h-[360px] flex items-center overflow-hidden">
                <Carousel images={galleryImages} fill shuffle />
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-black/35 z-10" />
            </section>

            {/* Info/Feature Section */}
            <section id="info" className="tiled-bg-blue py-12 scroll-mt-16">
                <div className="container max-w-5xl mx-auto px-4">
                    <h3
                        className="text-2xl md:text-3xl font-bold text-center mb-8 text-[#E31B23]"
                        style={{ textShadow: '2px 4px 20px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,0.9)' }}
                    >
                        What is the LA Tech SMP?
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 text-center">
                        <div className="p-4 rounded-xl bg-blue-950/70 border border-blue-800/60 hover:border-[#E31B23] transition-all">
                            <div className="text-3xl mb-2">🤝</div>
                            <h4 className="text-lg font-semibold mb-1">College Community</h4>
                            <p className="text-gray-300 text-sm">A place for Tech students to connect, relax, and build together outside of classes.</p>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-950/70 border border-blue-800/60 hover:border-[#E31B23] transition-all">
                            <div className="text-3xl mb-2">🏡</div>
                            <h4 className="text-lg font-semibold mb-1">Claim Your Land</h4>
                            <p className="text-gray-300 text-sm">Protect your builds with a simple land claim system — your base stays yours.</p>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-950/70 border border-blue-800/60 hover:border-[#E31B23] transition-all">
                            <div className="text-3xl mb-2">💰</div>
                            <h4 className="text-lg font-semibold mb-1">Player Economy</h4>
                            <p className="text-gray-300 text-sm">Sell what you find, shop for essentials, trade at the auction house, and earn daily rewards just for logging in.</p>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-950/70 border border-blue-800/60 hover:border-[#E31B23] transition-all">
                            <div className="text-3xl mb-2">🏆</div>
                            <h4 className="text-lg font-semibold mb-1">Build Challenges</h4>
                            <p className="text-gray-300 text-sm">Participate in Tech-themed build competitions and server-wide events!</p>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <Link
                            href="/leaderboard"
                            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition font-semibold"
                            style={{ textShadow: '2px 4px 20px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,0.9)' }}
                        >
                            <Trophy className="w-4 h-4" />
                            See who&apos;s topping the leaderboard &rarr;
                        </Link>
                    </div>
                </div>
            </section>

            {/* Socials/Link Section */}
            <section id="socials" className="pt-12 tiled-bg-black">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#E31B23]">Stay Connected</h3>
                    <p className="text-gray-300 text-base mb-6">Follow our socials for updates, highlights, and build showcases!</p>

                    <div className="flex justify-center flex-wrap gap-4">
                        <a href={DISCORD_LINK} target="_blank" className="flex flex-col items-center hover:text-red-400 transition">
                            <MessageSquare className="w-9 h-9 mb-1" />
                            <span className="font-semibold text-sm">Discord Server</span>
                        </a>

                        <a href={INSTAGRAM_LINK} target="_blank" className="flex flex-col items-center hover:text-red-400 transition">
                            <Instagram className="w-9 h-9 mb-1" />
                            <span className="font-semibold text-sm">Instagram</span>
                        </a>

                        <a href={MAIL_LINK} target="_blank" className="flex flex-col items-center hover:text-red-400 transition">
                            <Mail className="w-9 h-9 mb-1" />
                            <span className="font-semibold text-sm">Contact</span>
                        </a>

                        <CopyIPButton serverIP={SERVER_IP} variant="iconLink" />
                    </div>
                </div>
            {/* Footer */}
            <footer className="py-5 border-t border-gray-700/50 mt-10">
                <div className="container mx-auto px-4 text-center text-gray-400 text-xs">
                    <p>&copy; 2026 LA Tech SMP. All Rights Reserved.</p>
                    <p className="mt-1">This is an <span className="font-semibold text-[#E31B23]">UNOFFICIAL</span>, student-run server and is not affiliated with or endorsed by Louisiana Tech University.</p>
                </div>
            </footer>            </section>


        </div>
    );
}
