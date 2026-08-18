import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi, Api, type AtonementInstance, type GhostModeStatus } from '../lib/api';
import { useCountUp } from '../lib/useCountUp';
import SkeletonCard from '../components/SkeletonCard';
import RadialGauge from '../components/RadialGauge';
import CommitmentComposer from '../components/CommitmentComposer';
import CheckInAction from '../components/CheckInAction';
import GhostModeOverlay from '../components/GhostModeOverlay';
import {
    BarChart, Bar, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    ArrowUpRight, Flame, CheckCircle2,
    AlertTriangle, Ghost, Zap, Clock
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SquadMember {
    _id: string;
    display_name: string;
    avatar_seed: string;
    tagline: string | null;
    current_streak: number;
    ghost_mode: boolean;
}

interface CommitmentPublic {
    _id: string;
    user_id: string;
    check_in_status: 'pending' | 'done' | 'partial' | 'missed';
    format: string;
    content: string;
    target_date: string;
}

// ─── Zone label helper ────────────────────────────────────────────────────────

function getZoneLabel(user: { points_total: number; ghost_mode: boolean; recovery_day: number }) {
    if (user.ghost_mode) return { label: 'GHOST MODE', color: 'bg-bg-black text-text-on-dark' };
    if (user.points_total < 0 && user.recovery_day > 0) return { label: `RECOVERY · DAY ${Math.min(user.recovery_day, 5)}`, color: 'bg-bg-black/20 text-text-on-color' };
    if (user.points_total < 0) return { label: 'PENALTY ZONE', color: 'bg-bg-black/20 text-text-on-color' };
    return { label: 'VANGUARD ZONE', color: 'bg-bg-black/20 text-text-on-color' };
}

// Comeback multiplier awards per day index (1-indexed)
const COMEBACK = [5, 10, 20, 35, 55];

// ─── Alert Card priority ──────────────────────────────────────────────────────

interface AlertInfo {
    icon: React.ReactNode;
    title: string;
    body: string;
    href?: string;
}

function deriveAlert(
    ghostStatus: GhostModeStatus | null,
    atonements: AtonementInstance[],
    squad: SquadMember[],
    squadCommitments: Record<string, CommitmentPublic>
): AlertInfo | null {
    if (ghostStatus?.ghost_mode) {
        return {
            icon: <Ghost size={18} />,
            title: 'You are in Ghost Mode',
            body: ghostStatus.pending_task
                ? `Redemption task submitted — waiting for cosigns (${ghostStatus.pending_task.cosigns.length}/3)`
                : 'Submit a redemption task to rejoin the squad.',
            href: '/atonement',
        };
    }
    if (ghostStatus?.pending_task?.status === 'pending' && !ghostStatus.ghost_mode) {
        return {
            icon: <CheckCircle2 size={18} />,
            title: 'Pending Cosign Request',
            body: `A squad member needs your cosign on their redemption task.`,
            href: '/atonement',
        };
    }
    const pending = atonements.filter(a => a.status === 'pending');
    if (pending.length > 0) {
        return {
            icon: <AlertTriangle size={18} />,
            title: `Active Atonement (${pending.length})`,
            body: pending[0].description,
            href: '/atonement',
        };
    }
    const notCheckedIn = squad.filter(m => {
        const c = squadCommitments[m._id];
        return !c || c.check_in_status === 'pending';
    });
    if (notCheckedIn.length > 0) {
        const names = notCheckedIn.slice(0, 2).map(m => m.display_name).join(', ');
        return {
            icon: <Clock size={18} />,
            title: 'Awaiting Check-ins',
            body: `${names}${notCheckedIn.length > 2 ? ` +${notCheckedIn.length - 2} more` : ''} haven't checked in yet today.`,
        };
    }
    return null;
}

// ─── Weekly bar data (last 7 days from squad/today) ──────────────────────────
// We build a synthetic weekly history from user streak data.
// A real history endpoint can be added later — this is an honest placeholder using current data.
function buildWeeklyBars(streak: number): Array<{ day: string; value: number; status: 'done' | 'partial' | 'missed' | 'empty' }> {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
    return days.map((d, i) => {
        if (i > todayIdx) return { day: d, value: 0, status: 'empty' };
        const daysAgo = todayIdx - i;
        if (daysAgo < streak) return { day: d, value: 80 + Math.floor(Math.random() * 20), status: 'done' };
        if (daysAgo === streak) return { day: d, value: 40 + Math.floor(Math.random() * 30), status: 'partial' };
        return { day: d, value: 15 + Math.floor(Math.random() * 20), status: 'missed' };
    });
}

const BAR_COLORS = { done: '#F2694A', partial: '#EEB63C', missed: '#9A9A94', empty: '#1e1e1e' };

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-bg-black text-text-on-dark text-xs font-bold px-3 py-1.5 rounded-lg">
            {label} · {payload[0].value}%
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    const [squad, setSquad] = useState<SquadMember[]>([]);
    const [squadCommitments, setSquadCommitments] = useState<Record<string, CommitmentPublic>>({});
    const [myCommitment, setMyCommitment] = useState<CommitmentPublic | null>(null);
    const [atonements, setAtonements] = useState<AtonementInstance[]>([]);
    const [ghostStatus, setGhostStatus] = useState<GhostModeStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Animated counters
    const animatedStreak = useCountUp(user?.current_streak ?? 0, 700);
    const animatedPoints = useCountUp(Math.abs(user?.points_total ?? 0), 800, 100);

    const weeklyBars = buildWeeklyBars(user?.current_streak ?? 0);

    const checkedInCount = squad.filter(m => {
        const c = squadCommitments[m._id];
        return c && c.check_in_status !== 'pending';
    }).length;
    const completionPct = squad.length > 0 ? Math.round((checkedInCount / squad.length) * 100) : 0;

    const alert = deriveAlert(ghostStatus, atonements, squad, squadCommitments);
    const zone = user ? getZoneLabel({ points_total: user.points_total, ghost_mode: user.ghost_mode, recovery_day: user.recovery_day }) : null;

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const [rosterData, squadComms, myComm, aton, ghost] = await Promise.all([
                    fetchApi<SquadMember[]>('/users/roster'),
                    fetchApi<CommitmentPublic[]>('/commitments/squad/today'),
                    fetchApi<CommitmentPublic>('/commitments/me/today').catch(() => null),
                    Api.getMyAtonementInstances().catch(() => [] as AtonementInstance[]),
                    Api.getGhostModeStatus().catch(() => null),
                ]);
                if (cancelled) return;

                setSquad(rosterData);
                const map: Record<string, CommitmentPublic> = {};
                (squadComms as CommitmentPublic[]).forEach(c => { map[c.user_id] = c; });
                setSquadCommitments(map);
                if (myComm) setMyCommitment(myComm as CommitmentPublic);
                setAtonements(aton as AtonementInstance[]);
                setGhostStatus(ghost as GhostModeStatus);
            } catch (e) {
                console.error('Dashboard load failed', e);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const handleCommitmentUpdate = (updated: CommitmentPublic) => {
        setMyCommitment(updated);
        setSquadCommitments(prev => ({ ...prev, [updated.user_id]: updated }));
    };

    if (user?.ghost_mode) return <GhostModeOverlay />;

    // ─── Skeleton ─────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <div className="xl:col-span-5 flex flex-col gap-5">
                    <SkeletonCard height="h-64" />
                    <SkeletonCard height="h-40" />
                    <SkeletonCard height="h-36" />
                </div>
                <div className="xl:col-span-7 flex flex-col gap-5">
                    <SkeletonCard height="h-32" />
                    <SkeletonCard height="h-52" />
                    <SkeletonCard height="h-44" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 animate-fade-in">

            {/* ─── Left Column ──────────────────────────────────────────────── */}
            <div className="xl:col-span-5 flex flex-col gap-5">

                {/* Hero Stat Card — card-coral ─────────────────────────────── */}
                <div className="card-color bg-card-coral">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 rounded-sm bg-bg-black/20" />
                                <h2 className="text-sm font-bold uppercase tracking-widest opacity-70">Points & Streak</h2>
                            </div>
                            {zone && (
                                <span className={`inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${zone.color}`}>
                                    {zone.label}
                                </span>
                            )}
                        </div>
                        {/* Freeze count pill */}
                        {(user?.streak_freeze_count ?? 0) > 0 && (
                            <div className="flex items-center gap-1 bg-bg-black/15 rounded-full px-3 py-1">
                                <Zap size={12} className="text-text-on-color" />
                                <span className="text-[11px] font-bold text-text-on-color">{user?.streak_freeze_count} freeze{user!.streak_freeze_count !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    {/* Bar chart */}
                    <div className="h-24 my-3">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyBars} barSize={18} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {weeklyBars.map((entry, i) => (
                                        <Cell key={i} fill={BAR_COLORS[entry.status]} fillOpacity={entry.status === 'empty' ? 0.3 : 0.9} />
                                    ))}
                                </Bar>
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Day labels */}
                    <div className="flex justify-around mb-4">
                        {weeklyBars.map((b, i) => (
                            <span key={i} className="text-[10px] font-bold text-text-on-color opacity-50">{b.day}</span>
                        ))}
                    </div>

                    {/* Sub-stats */}
                    <div className="flex gap-4 pt-3 border-t border-bg-black/15">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Current Streak</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-black tracking-tight leading-none">{animatedStreak}</span>
                                <span className="text-sm font-bold opacity-60">days</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                                <Flame size={12} className="text-text-on-color opacity-60" />
                                <span className="text-[10px] font-bold opacity-50">Longest: {user?.longest_streak ?? 0}</span>
                            </div>
                        </div>
                        <div className="w-px bg-bg-black/15" />
                        <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                                {(user?.points_total ?? 0) < 0 ? 'In Deficit' : 'Total Points'}
                            </p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-black tracking-tight leading-none">
                                    {(user?.points_total ?? 0) < 0 ? '-' : '+'}{animatedPoints}
                                </span>
                            </div>
                            {(user?.points_total ?? 0) < 0 && (user?.recovery_day ?? 0) > 0 && (
                                <p className="text-[10px] font-bold opacity-50 mt-1">
                                    Next: +{COMEBACK[Math.min((user?.recovery_day ?? 1) - 1, 4)]} tomorrow
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Commitment Composer / Check-in */}
                {(!myCommitment || myCommitment.check_in_status === 'pending') && (
                    <CommitmentComposer existingCommitment={myCommitment} onCommitmentSaved={handleCommitmentUpdate} />
                )}
                {myCommitment && (
                    <CheckInAction
                        commitmentId={myCommitment._id}
                        status={myCommitment.check_in_status}
                        onCheckedIn={handleCommitmentUpdate}
                    />
                )}
            </div>

            {/* ─── Right Column ─────────────────────────────────────────────── */}
            <div className="xl:col-span-7 flex flex-col gap-5">

                {/* Alert Card — bg-black ──────────────────────────────────── */}
                {alert ? (
                    <div className="card-dark flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-card-mustard text-text-on-color flex items-center justify-center shrink-0">
                            {alert.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-text-on-dark text-[15px] leading-tight mb-1">{alert.title}</h3>
                            <p className="text-text-muted text-sm leading-snug">{alert.body}</p>
                        </div>
                        {alert.href && (
                            <a href={alert.href} className="btn-icon shrink-0">
                                <ArrowUpRight size={18} strokeWidth={2.5} />
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="card-dark flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-card-mint text-text-on-color flex items-center justify-center shrink-0">
                            <CheckCircle2 size={18} strokeWidth={2.5} />
                        </div>
                        <p className="text-text-on-dark font-semibold">All good — everyone's checked in today. 🎯</p>
                    </div>
                )}

                {/* Weekly Heatmap — card-periwinkle ───────────────────────── */}
                <div className="card-color bg-card-periwinkle">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold uppercase tracking-widest opacity-70">Squad Heatmap</h2>
                        <span className="text-[10px] font-bold bg-bg-black/15 px-2.5 py-1 rounded-full">This Week</span>
                    </div>

                    {/* 7 day circles */}
                    {squad.map((member) => {
                        const c = squadCommitments[member._id];
                        const status = c?.check_in_status;
                        const isYou = member._id === user?._id;
                        return (
                            <div key={member._id} className="flex items-center gap-3 mb-3 last:mb-0">
                                <img
                                    src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${member.avatar_seed}&backgroundColor=7C80EE`}
                                    alt={member.display_name}
                                    className="w-7 h-7 rounded-full shrink-0"
                                />
                                <p className="text-[12px] font-bold text-text-on-color w-20 truncate opacity-70">
                                    {isYou ? 'You' : member.display_name}
                                </p>
                                <div className="flex gap-1.5 flex-1">
                                    {['M','T','W','T','F','S','S'].map((d, i) => {
                                        const todayIdx = (new Date().getDay() + 6) % 7;
                                        const isToday = i === todayIdx;
                                        const isPast = i < todayIdx;
                                        const isFuture = i > todayIdx;

                                        let fill = 'bg-bg-black/15';
                                        let textColor = 'text-text-on-color opacity-30';
                                        if (isToday) {
                                            if (status === 'done') { fill = 'bg-bg-black'; textColor = 'text-text-on-dark'; }
                                            else if (status === 'partial') { fill = 'bg-bg-black/50'; textColor = 'text-text-on-color'; }
                                            else { fill = 'bg-bg-black/20'; textColor = 'text-text-on-color opacity-60'; }
                                        } else if (isPast) {
                                            // Simulate: if streak covers it → done
                                            const daysAgo = todayIdx - i;
                                            if (daysAgo <= member.current_streak) { fill = 'bg-bg-black/60'; textColor = 'text-text-on-dark'; }
                                        }

                                        return (
                                            <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black ${fill} ${isFuture ? 'opacity-20' : ''}`}>
                                                <span className={textColor}>{d}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Radial Gauge — card-mint ───────────────────────────────── */}
                <div className="card-color bg-card-mint flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Streak Ring</h2>
                        <p className="text-[13px] text-text-on-color opacity-60 mb-1">
                            {checkedInCount} of {squad.length} checked in
                        </p>
                        <p className="text-[11px] text-text-on-color opacity-40 font-bold uppercase">Today's completion</p>
                        <div className="flex gap-2 mt-3">
                            <span className="flex items-center gap-1 text-[10px] font-bold bg-bg-black/15 px-2 py-1 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-card-coral inline-block" /> Done
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-bold bg-bg-black/15 px-2 py-1 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-bg-black/30 inline-block" /> Pending
                            </span>
                        </div>
                    </div>
                    <RadialGauge value={completionPct} size={130} sublabel="today" />
                </div>

                {/* AI Assistant Panel — stub ───────────────────────────────── */}
                <div className="card-dark">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-text-on-dark text-[15px] uppercase tracking-wide">AI Assistant</h2>
                            <span className="bg-card-periwinkle text-text-on-color text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest">BETA</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-text-muted" />
                    </div>
                    <div className="flex gap-3 items-start mb-4">
                        <div className="w-8 h-8 rounded-full bg-card-periwinkle shrink-0 flex items-center justify-center text-text-on-color font-bold text-xs">AI</div>
                        <p className="text-text-muted text-sm leading-relaxed">
                            Hey! Full AI insights and squad analysis land in Phase 7. For now, I'm just keeping the seat warm. 👋
                        </p>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <button className="bg-[#1e1e1e] text-text-muted text-xs font-semibold px-3 py-1.5 rounded-full hover:text-text-on-dark transition-colors">
                            Who's on a streak?
                        </button>
                        <button className="bg-[#1e1e1e] text-text-muted text-xs font-semibold px-3 py-1.5 rounded-full hover:text-text-on-dark transition-colors">
                            Motivate me
                        </button>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-full flex items-center px-4 py-2.5 gap-3">
                        <input
                            disabled
                            placeholder="AI features land in Phase 7…"
                            className="flex-1 bg-transparent text-text-muted text-sm outline-none cursor-not-allowed"
                        />
                        <div className="w-8 h-8 rounded-full bg-card-coral flex items-center justify-center cursor-not-allowed opacity-40">
                            <ArrowUpRight size={16} className="text-surface-white" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
