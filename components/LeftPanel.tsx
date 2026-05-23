'use client'

interface LeftPanelProps {
  topic: string
  setTopic: (v: string) => void
  timeframe: string
  setTimeframe: (v: string) => void
  hoursPerDay: number
  setHoursPerDay: (v: number) => void
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  setSkillLevel: (v: 'beginner' | 'intermediate' | 'advanced') => void
  onGenerate: () => void
  onRegenerate: () => void
  isStreaming: boolean
  hasPlan: boolean
}

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'Start from scratch' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Know the basics' },
  { value: 'advanced', label: 'Advanced', desc: 'Go deep fast' },
] as const

export default function LeftPanel({
  topic, setTopic, timeframe, setTimeframe,
  hoursPerDay, setHoursPerDay, skillLevel, setSkillLevel,
  onGenerate, onRegenerate, isStreaming, hasPlan
}: LeftPanelProps) {
  return (
    <aside className="w-80 shrink-0 border-r border-white/5 flex flex-col overflow-y-auto">
      <div className="flex-1 p-6 space-y-8">

        {/* Topic input */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-white/40 uppercase tracking-widest">
            What to learn
          </label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isStreaming && onGenerate()}
            placeholder="e.g. Machine Learning"
            disabled={isStreaming}
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.05] transition-all disabled:opacity-50"
          />
        </div>

        {/* Timeframe */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-white/40 uppercase tracking-widest">
            Timeframe
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['1 week', '2 weeks', '1 month'].map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                disabled={isStreaming}
                className={`py-2 px-3 rounded-lg text-xs font-mono transition-all border ${
                  timeframe === t
                    ? 'bg-amber-400/10 border-amber-400/50 text-amber-400'
                    : 'bg-white/[0.03] border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                } disabled:opacity-50`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Hours per day slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-white/40 uppercase tracking-widest">
              Hours / day
            </label>
            <span className="text-sm font-mono text-amber-400">{hoursPerDay}h</span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            value={hoursPerDay}
            onChange={e => setHoursPerDay(Number(e.target.value))}
            disabled={isStreaming}
            className="w-full accent-amber-400 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs font-mono text-white/20">
            <span>1h</span>
            <span>8h</span>
          </div>
        </div>

        {/* Skill level */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-white/40 uppercase tracking-widest">
            Skill level
          </label>
          <div className="space-y-2">
            {SKILL_LEVELS.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setSkillLevel(value)}
                disabled={isStreaming}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  skillLevel === value
                    ? 'bg-amber-400/10 border-amber-400/40 text-white'
                    : 'bg-white/[0.03] border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                } disabled:opacity-50`}
              >
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs font-mono text-white/30 mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-6 border-t border-white/5 space-y-3">
        <button
          onClick={onGenerate}
          disabled={isStreaming || !topic.trim()}
          className="w-full py-3 px-4 rounded-lg bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isStreaming ? (
            <>
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Agent thinking...
            </>
          ) : (
            'Generate Plan'
          )}
        </button>

        {hasPlan && !isStreaming && (
          <button
            onClick={onRegenerate}
            className="w-full py-2.5 px-4 rounded-lg border border-white/10 text-white/50 text-sm hover:border-amber-400/30 hover:text-amber-400/70 transition-all font-mono"
          >
            ↺ Regenerate
          </button>
        )}
      </div>
    </aside>
  )
}