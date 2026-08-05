"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  Hammer,
  Flame,
  Sparkles,
  Copy,
  Check,
  Globe,
  MessageSquare,
  Layers2,
  Star,
  Wand2,
  Paintbrush,
  Layers,
  Code2,
  Briefcase,
  Lightbulb,
  Rocket,
  ClipboardCheck,
  ChevronDown,
  ArrowRight,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Syne, Outfit } from "next/font/google";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

type Platform = "Universal" | "ChatGPT" | "Claude" | "Gemini" | "Midjourney" | "DALL-E";
type Mode = "Detailed" | "Creative" | "Technical" | "Professional";
type Domain = "technology" | "business" | "creative" | "research" | "design" | "health" | "finance" | "education" | "general";

const platforms: { name: Platform; icon: any }[] = [
  { name: "Universal", icon: Globe },
  { name: "ChatGPT", icon: MessageSquare },
  { name: "Claude", icon: Layers2 },
  { name: "Gemini", icon: Star },
  { name: "Midjourney", icon: Wand2 },
  { name: "DALL-E", icon: Paintbrush },
];

const modes: { name: Mode; icon: any; description: string }[] = [
  { name: "Detailed", icon: Layers, description: "Comprehensive & thorough" },
  { name: "Creative", icon: Sparkles, description: "Original & imaginative" },
  { name: "Technical", icon: Code2, description: "Precise & technical" },
  { name: "Professional", icon: Briefcase, description: "Polished & executive" },
];

const examplePrompts = [
  { label: "Business plan", text: "Write a business plan for a sustainable packaging startup" },
  { label: "Quantum physics", text: "Explain quantum entanglement in simple terms" },
  { label: "Cinematic portrait", text: "Create a cinematic portrait of a cyberpunk city at night" },
  { label: "Debug React", text: "Debug my React app that crashes on state update" },
  { label: "Product launch", text: "Write a compelling product launch email for a new SaaS tool" },
];

// Fixed ember particle configuration (deterministic — avoids SSR/CSR hydration mismatch)
const emberParticles = [
  { left: "6%", size: 3, delay: "0s", duration: "7s" },
  { left: "14%", size: 2, delay: "1.2s", duration: "9s" },
  { left: "23%", size: 4, delay: "2.4s", duration: "8s" },
  { left: "34%", size: 2, delay: "0.6s", duration: "10s" },
  { left: "45%", size: 3, delay: "3.1s", duration: "7.5s" },
  { left: "58%", size: 2, delay: "1.8s", duration: "9.5s" },
  { left: "67%", size: 4, delay: "0.3s", duration: "8.5s" },
  { left: "76%", size: 2, delay: "2.9s", duration: "11s" },
  { left: "85%", size: 3, delay: "1.5s", duration: "7.8s" },
  { left: "92%", size: 2, delay: "3.6s", duration: "9.2s" },
];

// Domain detection
function detectDomain(text: string): Domain {
  const t = text.toLowerCase();
  const patterns: Record<Domain, string[]> = {
    technology: ["code", "app", "software", "react", "javascript", "python", "api", "database", "debug", "website", "web"],
    business: ["business", "startup", "marketing", "sales", "revenue", "plan", "strategy", "company", "brand"],
    creative: ["story", "poem", "novel", "character", "fiction", "creative", "write a story"],
    research: ["research", "study", "analyze", "hypothesis", "data", "experiment", "quantum", "physics"],
    design: ["design", "ui", "ux", "logo", "graphic", "layout", "typography", "color", "cinematic", "portrait"],
    health: ["health", "medical", "doctor", "disease", "symptom", "treatment", "nutrition", "exercise"],
    finance: ["finance", "investment", "stock", "budget", "tax", "accounting", "portfolio"],
    education: ["teach", "explain", "learn", "student", "lesson", "tutorial", "course"],
    general: [],
  };
  for (const [domain, keywords] of Object.entries(patterns)) {
    if (domain === "general") continue;
    if (keywords.some((k) => t.includes(k))) return domain as Domain;
  }
  return "general";
}

function getDomainLabel(domain: Domain): string {
  const labels: Record<Domain, string> = {
    technology: "Technology",
    business: "Business",
    creative: "Creative Writing",
    research: "Research & Analysis",
    design: "Design & Visual",
    health: "Health & Medicine",
    finance: "Finance & Investment",
    education: "Education",
    general: "General",
  };
  return labels[domain];
}

export default function PromptForgePage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("Universal");
  const [selectedMode, setSelectedMode] = useState<Mode>("Detailed");
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [optimizedPrompt, setOptimizedPrompt] = useState<string>("");
  const [improvements, setImprovements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const wordCount = useMemo(
    () => (inputPrompt.trim().length > 0 ? inputPrompt.trim().split(/\s+/).filter(Boolean).length : 0),
    [inputPrompt]
  );
  const charCount = inputPrompt.length;
  const enhancedWordCount = useMemo(
    () => (optimizedPrompt ? optimizedPrompt.split(/\s+/).filter(Boolean).length : 0),
    [optimizedPrompt]
  );

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const generateImprovements = useCallback(
    (domain: Domain, mode: Mode, platform: Platform): string[] => {
      const base: string[] = [
        "Added expert role assignment for higher-quality, domain-specific responses",
        "Structured task clearly for optimal AI comprehension",
      ];
      const modeSpecific: Record<Mode, string[]> = {
        Detailed: [
          "Added comprehensive detail requirements with structured formatting",
          "Requested concrete examples and edge case coverage",
        ],
        Creative: [
          "Injected imaginative framing and vivid language guidance",
          "Added stylistic direction for originality and voice",
        ],
        Technical: [
          "Enforced precision and domain-specific terminology",
          "Added code/structure requirements where applicable",
        ],
        Professional: [
          "Applied executive tone and strategic framing",
          "Added ROI and actionable-insight requirements",
        ],
      };
      const platformSpecific: Record<Platform, string> = {
        Universal: "Added clear universal output structure guidelines",
        ChatGPT: "Optimized for GPT-4 system prompt conventions",
        Claude: "Structured for Claude's nuanced reasoning strengths",
        Gemini: "Formatted for Gemini's multimodal capabilities",
        Midjourney: "Added visual composition and aesthetic keywords",
        "DALL-E": "Crafted descriptive visual language for DALL-E 3",
      };
      const domainSpecific: Record<Domain, string> = {
        technology: "Added technical depth and code-quality requirements",
        business: "Added strategic and market-awareness framing",
        creative: "Added narrative structure and voice guidance",
        research: "Added evidence-based reasoning requirements",
        design: "Added visual composition and aesthetic direction",
        health: "Added safety disclaimers and evidence requirements",
        finance: "Added regulatory awareness and risk framing",
        education: "Added pedagogical structure and clarity gates",
        general: "Added quality assurance and practical value requirement",
      };
      return [
        ...base,
        ...modeSpecific[mode],
        platformSpecific[platform],
        domainSpecific[domain],
      ];
    },
    []
  );

  const compilePrompt = useCallback(
    (raw: string, platform: Platform, mode: Mode): { prompt: string; improvements: string[] } => {
      const trimmed = raw.trim();
      const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      const words = trimmed.split(/\s+/).filter(Boolean);
      const wc = words.length;
      const domain = detectDomain(trimmed);

      const stopWords = new Set([
        "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for",
        "with", "is", "are", "be", "as", "at", "by", "from", "this", "that",
        "it", "i", "you", "we", "my", "your", "our", "can", "will", "should",
      ]);
      const keywords = Array.from(
        new Set(
          words
            .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
            .filter((w) => w.length > 3 && !stopWords.has(w))
        )
      ).slice(0, 6);

      const keywordList =
        keywords.length > 0
          ? keywords.map((k) => `- ${k.charAt(0).toUpperCase() + k.slice(1)}`).join("\n")
          : "- Core topic (to be refined)";

      const primarySentence = sentences[0]?.trim() || trimmed;

      const modeInstructions: Record<Mode, string> = {
        Detailed: "Provide exhaustive coverage of every relevant dimension. Leave no stone unturned.",
        Creative: "Think laterally. Use vivid metaphors, unexpected angles, and imaginative framing.",
        Technical: "Prioritize precision, accuracy, and domain-specific terminology. Include code where relevant.",
        Professional: "Adopt an executive tone. Focus on ROI, strategic implications, and actionable insights.",
      };

      const platformNote: Record<Platform, string> = {
        Universal: "Optimized for any frontier LLM (GPT-4, Claude, Gemini, etc.)",
        ChatGPT: "Tailored for OpenAI's GPT-4 / GPT-4o architecture and system prompt conventions.",
        Claude: "Structured for Anthropic's Claude 3.5+ with emphasis on nuanced reasoning and safety.",
        Gemini: "Formatted for Google's Gemini Pro/Ultra with multimodal awareness.",
        Midjourney: "Optimized for visual generation — emphasize style, composition, and aesthetic keywords.",
        "DALL-E": "Crafted for OpenAI's DALL-E 3 — focus on descriptive visual language and aspect ratios.",
      };

      const domainLabel = getDomainLabel(domain);

      const prompt = `Act as a highly knowledgeable expert and thoughtful advisor with deep analytical and communication skills. Your responses should reflect deep expertise, practical wisdom, and clear communication.

## Task
${primarySentence}

## Requirements
- Provide a comprehensive, thorough response covering all relevant aspects and sub-topics
- Include concrete examples, analogies, or case studies to illustrate key points
- Break down complex ideas into clear, digestible sections with proper headings
- Address common misconceptions, edge cases, or potential pitfalls
- Use structured formatting: headers, bullet points, numbered steps, and tables where helpful

## Context & Constraints
- **Domain:** ${domainLabel}
- **Platform:** ${platform} — ${platformNote[platform]}
- **Mode:** ${mode} — ${modeInstructions[mode]}
- **Thematic Anchors:**
${keywordList}

## Quality Gates
- No filler. Every sentence must earn its presence.
- No hedging without evidence. State uncertainty explicitly with reasons.
- No repetition. Each paragraph must advance the argument.
- No hallucination. Label unverifiable claims clearly.

## Expected Output Structure
1. **Executive Summary** — One crisp paragraph capturing the core answer.
2. **Detailed Analysis** — Structured breakdown with clear headings.
3. **Trade-offs & Edge Cases** — Honest assessment of limitations.
4. **Actionable Next Steps** — 3–5 concrete actions the user can take immediately.

## Tone & Style
- Voice: Authoritative yet approachable.
- Density: High information-per-word ratio.
- Length: Sufficient to cover thoroughly; not a word longer.

Before responding, silently:
1. Parse the user's true intent beneath literal wording.
2. Identify 2–3 likely failure modes of a naive answer.
3. Select the structure that maximizes clarity.
4. Verify claims; flag gaps.

*Blueprint compiled from ${wc} source words. Domain: ${domainLabel}. Ready for execution.*`;

      const improvements = generateImprovements(domain, mode, platform);
      return { prompt, improvements };
    },
    [generateImprovements]
  );

  const handleEnhance = useCallback(() => {
    if (inputPrompt.trim().length === 0 || isLoading) return;
    setIsLoading(true);
    setShowResult(false);

    const timer = setTimeout(() => {
      const { prompt, improvements } = compilePrompt(inputPrompt, selectedPlatform, selectedMode);
      setOptimizedPrompt(prompt);
      setImprovements(improvements);
      setIsLoading(false);
      setShowResult(true);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }, 1200);

    return () => clearTimeout(timer);
  }, [inputPrompt, selectedPlatform, selectedMode, isLoading, compilePrompt]);

  const handleCopy = useCallback(async () => {
    if (!optimizedPrompt) return;
    try {
      await navigator.clipboard.writeText(optimizedPrompt);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2000);
    } catch (error) {
      console.error("Clipboard failed:", error);
    }
  }, [optimizedPrompt]);

  const handleReset = useCallback(() => {
    setInputPrompt("");
    setOptimizedPrompt("");
    setImprovements([]);
    setShowResult(false);
    setIsLoading(false);
    setCopied(false);
  }, []);

  const handleExampleClick = (text: string) => {
    setInputPrompt(text);
  };

  const scrollToTool = () => {
    document.getElementById("tool-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`${syne.variable} ${outfit.variable} relative min-h-screen w-full overflow-hidden bg-[#07080C] text-[#F6F4EF] antialiased font-[family-name:var(--font-outfit)]`}>
      {/* ===== BACKGROUND SYSTEM ===== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]"
      />

      {/* Noise texture for tactile premium feel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Aurora blooms — ember (amber) + AI (violet) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-[8%] h-[520px] w-[620px] rounded-full bg-[#FF7A45]/[0.09] blur-[190px] motion-safe:animate-[drift1_16s_ease-in-out_infinite]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[22%] -right-40 h-[560px] w-[640px] rounded-full bg-[#7C6CFF]/[0.10] blur-[200px] motion-safe:animate-[drift2_19s_ease-in-out_infinite]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-10%] left-[35%] h-[380px] w-[480px] rounded-full bg-[#FFC65C]/[0.05] blur-[170px] motion-safe:animate-[drift3_21s_ease-in-out_infinite]"
      />

      {/* Ember particles rising */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {emberParticles.map((p, idx) => (
          <span
            key={idx}
            className="absolute bottom-0 rounded-full bg-gradient-to-t from-[#FF7A45] to-[#FFC65C] motion-safe:animate-[emberRise_var(--dur)_ease-in_infinite]"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              boxShadow: "0 0 6px 1px rgba(255,140,70,0.55)",
              animationDelay: p.delay,
              // @ts-ignore -- custom property for keyframe duration
              "--dur": p.duration,
            }}
          />
        ))}
      </div>

      {/* Mouse spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-500 motion-reduce:hidden"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,138,76,0.05), transparent 40%)`,
        }}
      />

      {/* ===== NAVBAR ===== */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#FF7A45]/40 bg-gradient-to-br from-[#FF7A45]/25 to-[#7C6CFF]/15">
            <div className="absolute inset-0 rounded-lg bg-[#FF7A45]/25 blur-md" />
            <Hammer className="relative h-4 w-4 text-[#FFB37A]" />
          </div>
          <span className={`text-lg font-bold ${syne.className}`}>
            Prompt<span className="bg-gradient-to-r from-[#FF9B5C] to-[#7C6CFF] bg-clip-text text-transparent">Forge</span>
          </span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#tool-section" className="text-sm text-white/50 transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,138,76,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A45]/50 rounded-sm">
            Tool
          </a>
          <a href="#how-it-works" className="text-sm text-white/50 transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,138,76,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A45]/50 rounded-sm">
            How it works
          </a>
        </div>
        <button className="group relative inline-flex items-center gap-2 rounded-full border border-[#FF7A45]/30 bg-[#FF7A45]/5 px-4 py-1.5 text-xs font-medium text-[#FFB37A] transition-all hover:bg-[#FF7A45]/15 hover:shadow-[0_0_20px_rgba(255,138,76,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A45]/50">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-[#FF7A45] opacity-75 [animation-duration:2s]" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF7A45] shadow-[0_0_8px_rgba(255,138,76,0.9)]" />
          </span>
          Free to use
        </button>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20 pt-14 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm transition-all hover:border-[#FF7A45]/40 hover:shadow-[0_0_20px_rgba(255,138,76,0.15)]">
          <Hammer className="h-3.5 w-3.5 text-[#FFB37A]" />
          <span className="text-xs font-medium text-white/70">The prompt engineering forge</span>
        </div>

        <h1 className={`relative mb-6 text-[42px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl ${syne.className}`}>
          <span className="block text-white">Raw ideas,</span>
          <span className="relative block">
            <span className="bg-gradient-to-r from-[#FF9B5C] via-[#FFC65C] to-[#7C6CFF] bg-[length:200%_auto] bg-clip-text text-transparent motion-safe:animate-[shimmer_5s_linear_infinite]">
              forged into precision
            </span>
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FF7A45]/40 via-[#FFC65C]/25 to-[#7C6CFF]/40 blur-3xl bg-[length:200%_auto] motion-safe:animate-[shimmer_5s_linear_infinite]"
            >
              forged into precision
            </span>
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/50 sm:text-lg">
          Transform rough ideas into precision-crafted prompts that unlock the full
          potential of ChatGPT, Claude, Gemini, Midjourney — and every AI platform
          in between.
        </p>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
          <span className="inline-flex items-center gap-2 transition-all hover:text-[#FFB37A]">
            <Globe className="h-4 w-4 text-[#FF9B5C] drop-shadow-[0_0_6px_rgba(255,138,76,0.6)]" />
            6 AI platforms
          </span>
          <span className="inline-flex items-center gap-2 transition-all hover:text-[#B8AEFF]">
            <Sparkles className="h-4 w-4 text-[#9C8CFF] drop-shadow-[0_0_6px_rgba(124,108,255,0.6)]" />
            4 enhancement modes
          </span>
          <span className="inline-flex items-center gap-2 transition-all hover:text-[#FFB37A]">
            <Flame className="h-4 w-4 text-[#FF9B5C] drop-shadow-[0_0_6px_rgba(255,138,76,0.6)]" />
            Instant results
          </span>
        </div>

        <button
          onClick={scrollToTool}
          className="inline-flex flex-col items-center gap-2 text-xs font-semibold tracking-[0.3em] text-white/50 transition-all hover:text-[#FFB37A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A45]/50 rounded-sm"
        >
          <span>START FORGING</span>
          <ChevronDown className="h-4 w-4 motion-safe:animate-bounce" />
        </button>
      </section>

      {/* ===== MAIN TOOL ===== */}
      <section id="tool-section" className="relative z-10 mx-auto max-w-5xl px-6 pb-20">
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#FF9B5C]/60 to-transparent"
          />

          {/* Platform */}
          <fieldset className="mb-6">
            <legend className="mb-3 block text-xs font-semibold uppercase tracking-wider text-white/40">
              Select AI platform
            </legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="AI platform">
              {platforms.map((p) => {
                const Icon = p.icon;
                const isActive = selectedPlatform === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setSelectedPlatform(p.name)}
                    aria-pressed={isActive}
                    className={`relative inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A45]/50 ${
                      isActive
                        ? "border-[#FF7A45]/60 bg-[#FF7A45]/15 text-[#FFD1A8] shadow-[0_0_20px_rgba(255,138,76,0.25)]"
                        : "border-white/10 bg-white/[0.02] text-white/50 hover:border-[#FF7A45]/40 hover:text-white/80 hover:shadow-[0_0_15px_rgba(255,138,76,0.1)]"
                    }`}
                  >
                    {isActive && <span className="absolute inset-0 rounded-lg bg-[#FF7A45]/10 blur-md" />}
                    <Icon className="relative h-4 w-4" />
                    <span className="relative">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Mode */}
          <fieldset className="mb-6">
            <legend className="mb-3 block text-xs font-semibold uppercase tracking-wider text-white/40">
              Enhancement mode
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label="Enhancement mode">
              {modes.map((m) => {
                const Icon = m.icon;
                const isActive = selectedMode === m.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setSelectedMode(m.name)}
                    aria-pressed={isActive}
                    className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CFF]/50 ${
                      isActive
                        ? "border-[#7C6CFF]/60 bg-[#7C6CFF]/15 shadow-[0_0_25px_rgba(124,108,255,0.25)]"
                        : "border-white/10 bg-white/[0.02] hover:border-[#7C6CFF]/40 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(124,108,255,0.1)]"
                    }`}
                  >
                    {isActive && <span className="absolute inset-0 bg-gradient-to-br from-[#7C6CFF]/20 to-transparent" />}
                    <Icon
                      className={`relative mb-2 h-5 w-5 transition-all ${
                        isActive ? "text-[#B3A8FF] drop-shadow-[0_0_8px_rgba(124,108,255,0.8)]" : "text-white/35 group-hover:text-[#B3A8FF]"
                      }`}
                    />
                    <div className={`relative text-sm font-semibold transition-all ${isActive ? "text-[#DAD4FF]" : "text-white/85"}`}>
                      {m.name}
                    </div>
                    <div className="relative mt-1 text-xs text-white/40">{m.description}</div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Textarea */}
          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="prompt-input" className={`text-sm font-semibold text-white/85 ${syne.className}`}>Your prompt</label>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span>{wordCount} words</span>
                <span>{charCount} chars</span>
                {inputPrompt.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-white/50 transition-colors hover:text-[#FFB37A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A45]/50 rounded-sm"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>
            <textarea
              id="prompt-input"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Enter your prompt here... (Ctrl+Enter to enhance)"
              aria-describedby="prompt-hint"
              className="h-40 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white/90 placeholder-white/25 outline-none transition-all focus:border-[#FF7A45]/50 focus:ring-2 focus:ring-[#FF7A45]/20 focus:shadow-[0_0_30px_rgba(255,138,76,0.12)]"
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") handleEnhance();
              }}
            />
            <span id="prompt-hint" className="sr-only">Press Control and Enter to enhance your prompt</span>
          </div>

          {/* Examples */}
          <div className="mb-6">
            <span className="mb-2 block text-xs text-white/40">Try:</span>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleExampleClick(example.text)}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white/50 transition-all hover:border-[#FF7A45]/40 hover:bg-[#FF7A45]/10 hover:text-[#FFD1A8] hover:shadow-[0_0_15px_rgba(255,138,76,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A45]/50"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          {/* Enhance Button */}
          <button
            type="button"
            onClick={handleEnhance}
            disabled={inputPrompt.trim().length === 0 || isLoading}
            aria-live="polite"
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#FF7A45] via-[#FFA24C] to-[#7C6CFF] px-6 py-4 text-base font-bold text-[#1A1006] shadow-lg shadow-black/30 transition-all hover:shadow-[0_0_50px_rgba(255,138,76,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden"
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Forging...</span>
                </>
              ) : (
                <>
                  <Flame className="h-5 w-5" />
                  <span>Enhance prompt</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
          </button>
        </div>

        {/* ===== RESULT ===== */}
        {showResult && optimizedPrompt && (
          <div ref={resultRef} className="mt-8 space-y-6" aria-live="polite">
            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-white/40">Original:</span>
                <span className="font-semibold text-white">{wordCount} words</span>
                <ArrowRight className="h-4 w-4 text-white/20" />
                <span className="text-white/40">Enhanced:</span>
                <span className="font-bold text-[#FFB37A]">{enhancedWordCount} words</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#FF7A45]/40 bg-[#FF7A45]/10 px-3 py-1 text-xs font-semibold text-[#FFD1A8]">
                <Sparkles className="h-3.5 w-3.5" />
                {improvements.length} improvements
              </div>
            </div>

            {/* Enhanced prompt box */}
            <div className="relative rounded-2xl border border-[#FF7A45]/20 bg-gradient-to-br from-[#1a0f08]/60 via-[#0d0e14]/70 to-[#120f1f]/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#FF9B5C]/70 to-transparent"
              />
              <div className="mb-4 flex items-center justify-between">
                <h3 className={`text-lg font-bold text-white ${syne.className}`}>Forged prompt</h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A45]/50 ${
                    copied
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:border-[#FF7A45]/50 hover:bg-[#FF7A45]/10 hover:text-[#FFD1A8] hover:shadow-[0_0_20px_rgba(255,138,76,0.2)]"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy prompt
                    </>
                  )}
                </button>
              </div>
              <div className="custom-scrollbar max-h-[500px] overflow-y-auto rounded-xl border border-white/5 bg-black/40 p-5">
                <pre className="whitespace-pre-wrap break-words font-[family-name:var(--font-outfit)] text-sm leading-relaxed text-white/85">
                  <code>{optimizedPrompt}</code>
                </pre>
              </div>
            </div>

            {/* Improvements list */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">What was improved</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {improvements.map((imp, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-white/75">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FF9B5C] drop-shadow-[0_0_6px_rgba(255,138,76,0.6)]" />
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14 text-center">
          <h2 className={`mb-3 text-4xl font-bold text-white sm:text-5xl ${syne.className}`}>How it works</h2>
          <p className="text-white/50">Three steps from rough idea to AI-ready precision prompt</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Lightbulb,
              step: "01",
              title: "Enter your prompt",
              desc: "Type your basic idea — even a rough single sentence works perfectly as a starting point.",
              accent: "#FF9B5C",
              ring: "border-[#FF7A45]/20",
              glow: "rgba(255,138,76,0.15)",
              iconBg: "bg-[#FF7A45]/10 border-[#FF7A45]/20",
            },
            {
              icon: Rocket,
              step: "02",
              title: "Choose your settings",
              desc: "Pick the AI platform you'll use and the enhancement mode that fits your goal.",
              accent: "#B3A8FF",
              ring: "border-[#7C6CFF]/20",
              glow: "rgba(124,108,255,0.15)",
              iconBg: "bg-[#7C6CFF]/10 border-[#7C6CFF]/20",
            },
            {
              icon: ClipboardCheck,
              step: "03",
              title: "Copy & dominate",
              desc: "Get your precision-crafted prompt with a full improvement breakdown. Paste and win.",
              accent: "#FFC65C",
              ring: "border-[#FFC65C]/20",
              glow: "rgba(255,198,92,0.15)",
              iconBg: "bg-[#FFC65C]/10 border-[#FFC65C]/20",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`group relative rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center backdrop-blur-xl transition-all duration-300 hover:${item.ring}`}
                style={{ boxShadow: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 30px ${item.glow}`)}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div className={`relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${item.iconBg} transition-all`}>
                  <Icon className="relative h-6 w-6" style={{ color: item.accent }} />
                </div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/35">Step {item.step}</div>
                <h3 className={`mb-3 text-xl font-bold text-white ${syne.className}`}>{item.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-[#FF7A45]/20 bg-gradient-to-br from-[#0d0e14] to-[#120f1f] p-10 text-center sm:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FF7A45]/10 to-[#7C6CFF]/10 blur-[120px]"
          />
          <h2 className={`relative mb-4 text-3xl font-bold text-white sm:text-4xl ${syne.className}`}>
            Ready to unlock AI's full potential?
          </h2>
          <p className="relative mx-auto mb-8 max-w-xl text-white/50">
            Every great AI output starts with a great prompt. Start enhancing yours —
            free, fast, and powerful.
          </p>
          <button
            type="button"
            onClick={scrollToTool}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#FF7A45] via-[#FFA24C] to-[#7C6CFF] px-8 py-3.5 text-base font-bold text-[#1A1006] shadow-lg shadow-black/30 transition-all hover:shadow-[0_0_50px_rgba(255,138,76,0.5)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden"
            />
            <Flame className="relative h-5 w-5" />
            <span className="relative">Start enhancing free</span>
            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-[#FF7A45]/40 bg-gradient-to-br from-[#FF7A45]/25 to-[#7C6CFF]/15">
              <Hammer className="relative h-3.5 w-3.5 text-[#FFB37A]" />
            </div>
            <span className={`text-sm font-bold ${syne.className}`}>
              Prompt<span className="bg-gradient-to-r from-[#FF9B5C] to-[#7C6CFF] bg-clip-text text-transparent">Forge</span>
            </span>
          </div>
          <p className="text-xs text-white/35">Transform your prompts. Unlock AI's full potential.</p>
          <p className="text-xs text-white/35">© 2026 PromptForge. All rights reserved.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(35px, -25px) scale(1.06); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-45px, 35px) scale(1.08); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, 40px) scale(1.05); }
        }
        @keyframes emberRise {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.9; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-420px); opacity: 0; }
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 138, 76, 0.4) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(255, 138, 76, 0.5), rgba(124, 108, 255, 0.35));
          border-radius: 999px;
          border: 1px solid rgba(15, 15, 20, 0.6);
          transition: all 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(255, 155, 92, 0.8), rgba(124, 108, 255, 0.55));
          box-shadow: 0 0 12px rgba(255, 138, 76, 0.5);
        }
        .custom-scrollbar:hover {
          scrollbar-color: rgba(255, 138, 76, 0.6) transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  );
}