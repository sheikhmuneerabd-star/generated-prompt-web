"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  Zap,
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
    <div className={`${syne.variable} ${outfit.variable} relative min-h-screen w-full overflow-hidden bg-[#050810] text-white antialiased font-[family-name:var(--font-outfit)]`}>
      {/* ===== DEEP BACKGROUND ===== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(20,184,166,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,184,166,0.04)_1px,transparent_1px)] bg-[size:60px_60px]"
      />

      {/* Flowing orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-60 left-1/4 h-[600px] w-[800px] rounded-full bg-cyan-500/10 blur-[200px] animate-[float1_12s_ease-in-out_infinite]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-60 h-[700px] w-[800px] rounded-full bg-violet-500/10 blur-[220px] animate-[float2_14s_ease-in-out_infinite]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[600px] rounded-full bg-amber-400/6 blur-[180px] animate-[float3_16s_ease-in-out_infinite]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/5 blur-[150px] animate-pulse [animation-duration:4s]"
      />

      {/* Mouse spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-500"
        style={{
          background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.05), transparent 40%)`,
        }}
      />

      {/* Moving light streaks */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 h-[2px] w-[300px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent blur-sm animate-[moveRight_15s_linear_infinite]" />
        <div className="absolute top-1/3 -left-40 h-[2px] w-[400px] bg-gradient-to-r from-transparent via-violet-400/20 to-transparent blur-sm animate-[moveRight_20s_linear_infinite_3s]" />
        <div className="absolute top-2/3 -left-40 h-[2px] w-[250px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent blur-sm animate-[moveRight_18s_linear_infinite_6s]" />
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/30 to-teal-500/20 border border-cyan-400/40">
            <div className="absolute inset-0 rounded-lg bg-cyan-400/30 blur-md" />
            <Zap className="relative h-4 w-4 text-cyan-300" fill="currentColor" />
          </div>
          <span className={`text-lg font-bold ${syne.className}`}>
            Prompt<span className="bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">Forge</span>
          </span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#tool-section" className="text-sm text-slate-400 transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
            Tool
          </a>
          <a href="#how-it-works" className="text-sm text-slate-400 transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
            How it works
          </a>
        </div>
        <button className="group relative inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-4 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-400/15 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75 [animation-duration:2s]" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
          </span>
          Free to use
        </button>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-12 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-4 py-1.5 backdrop-blur-sm transition-all hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          <span className="text-xs font-medium text-cyan-200">AI Prompt Engineering Platform</span>
        </div>

        <h1 className={`relative mb-6 text-[39px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl ${syne.className}`}>
          <span className="block text-white">Supercharge</span>
          <span className="bg-gradient-to-r from-yellow-300 via-purple-200 to-cyan-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_4s_linear_infinite]">Your AI</span>
          <span className="relative block">
            <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-yellow-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_4s_linear_infinite]">
              Prompts
            </span>
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-400/40 via-teal-300/30 to-violet-400/40 blur-3xl bg-[length:200%_auto] animate-[shimmer_4s_linear_infinite]"
            >
              Prompts
            </span>
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Transform rough ideas into precision-crafted prompts that unlock the full
          potential of ChatGPT, Claude, Gemini, Midjourney — and every AI platform
          in between.
        </p>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <span className="inline-flex items-center gap-2 transition-all hover:text-cyan-300">
            <Globe className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
            6 AI Platforms
          </span>
          <span className="inline-flex items-center gap-2 transition-all hover:text-cyan-300">
            <Zap className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
            4 Enhancement Modes
          </span>
          <span className="inline-flex items-center gap-2 transition-all hover:text-cyan-300">
            <Sparkles className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
            Instant Results
          </span>
        </div>

        <button
          onClick={scrollToTool}
          className="inline-flex flex-col items-center gap-2 text-xs font-semibold tracking-[0.3em] text-slate-400 transition-all hover:text-cyan-300"
        >
          <span>START ENHANCING</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </button>
      </section>

      {/* ===== MAIN TOOL ===== */}
      <section id="tool-section" className="relative z-10 mx-auto max-w-5xl px-6 pb-20">
        <div className="relative rounded-2xl border border-slate-800/80 bg-[#0a1020]/70 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
          />

          {/* Platform */}
          <div className="mb-6">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select AI Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => {
                const Icon = p.icon;
                const isActive = selectedPlatform === p.name;
                return (
                  <button
                    key={p.name}
                    onClick={() => setSelectedPlatform(p.name)}
                    className={`relative inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                        : "border-slate-700/60 bg-slate-800/30 text-slate-400 hover:border-cyan-500/40 hover:text-slate-200 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                    }`}
                  >
                    {isActive && <span className="absolute inset-0 rounded-lg bg-cyan-400/10 blur-md" />}
                    <Icon className="relative h-4 w-4" />
                    <span className="relative">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode */}
          <div className="mb-6">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Enhancement Mode
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {modes.map((m) => {
                const Icon = m.icon;
                const isActive = selectedMode === m.name;
                return (
                  <button
                    key={m.name}
                    onClick={() => setSelectedMode(m.name)}
                    className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                      isActive
                        ? "border-cyan-400/60 bg-cyan-500/15 shadow-[0_0_25px_rgba(34,211,238,0.3)]"
                        : "border-slate-700/60 bg-slate-800/20 hover:border-cyan-500/40 hover:bg-slate-800/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                    }`}
                  >
                    {isActive && <span className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-transparent" />}
                    <Icon
                      className={`relative mb-2 h-5 w-5 transition-all ${
                        isActive ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]" : "text-slate-500 group-hover:text-cyan-300"
                      }`}
                    />
                    <div className={`relative text-sm font-semibold transition-all ${isActive ? "text-cyan-200" : "text-slate-200"}`}>
                      {m.name}
                    </div>
                    <div className="relative mt-1 text-xs text-slate-500">{m.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

          {/* Textarea */}
          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between">
              <label className={`text-sm font-semibold text-slate-200 ${syne.className}`}>Your Prompt</label>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{wordCount} words</span>
                <span>{charCount} chars</span>
                {inputPrompt.length > 0 && (
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-slate-400 transition-colors hover:text-cyan-300"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Enter your prompt here... (Ctrl+Enter to enhance)"
              className="h-40 w-full resize-none rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm leading-relaxed text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") handleEnhance();
              }}
            />
          </div>

          {/* Examples */}
          <div className="mb-6">
            <span className="mb-2 block text-xs text-slate-500">Try:</span>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example.text)}
                  className="rounded-full border border-slate-700/60 bg-slate-800/30 px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-200 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          {/* Enhance Button */}
          <button
            onClick={handleEnhance}
            disabled={inputPrompt.trim().length === 0 || isLoading}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-6 py-4 text-base font-bold text-slate-900 shadow-lg shadow-cyan-500/30 transition-all hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-300 to-teal-300 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" fill="currentColor" />
                  <span>Enhance Prompt</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
          </button>
        </div>

        {/* ===== RESULT ===== */}
        {showResult && optimizedPrompt && (
          <div ref={resultRef} className="mt-8 space-y-6">
            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800/60 bg-[#0a1020]/60 px-5 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">Original:</span>
                <span className="font-semibold text-white">{wordCount} words</span>
                <ArrowRight className="h-4 w-4 text-slate-600" />
                <span className="text-slate-400">Enhanced:</span>
                <span className="font-bold text-cyan-300">{enhancedWordCount} words</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                {improvements.length} improvements
              </div>
            </div>

            {/* Enhanced prompt box */}
            <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-teal-950/30 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"
              />
              <div className="mb-4 flex items-center justify-between">
                <h3 className={`text-lg font-bold text-white ${syne.className}`}>Enhanced Prompt</h3>
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    copied
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                      : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
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
              <div className="custom-scrollbar max-h-[500px] overflow-y-auto rounded-xl border border-cyan-500/10 bg-slate-950/70 p-5">
                <pre className="whitespace-pre-wrap break-words font-[family-name:var(--font-outfit)] text-sm leading-relaxed text-slate-200">
                  <code>{optimizedPrompt}</code>
                </pre>
              </div>
            </div>

            {/* Improvements list */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#0a1020]/60 p-6 backdrop-blur-xl sm:p-8">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">What Was Improved</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {improvements.map((imp, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
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
          <h2 className={`mb-3 text-4xl font-bold text-white sm:text-5xl ${syne.className}`}>How It Works</h2>
          <p className="text-slate-400">Three steps from rough idea to AI-ready precision prompt</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { icon: Lightbulb, color: "cyan", step: "01", title: "Enter Your Prompt", desc: "Type your basic idea — even a rough single sentence works perfectly as a starting point." },
            { icon: Rocket, color: "violet", step: "02", title: "Choose Your Settings", desc: "Pick the AI platform you'll use and the enhancement mode that fits your goal." },
            { icon: ClipboardCheck, color: "amber", step: "03", title: "Copy & Dominate", desc: "Get your precision-crafted prompt with a full improvement breakdown. Paste and win." },
          ].map((item, idx) => {
            const Icon = item.icon;
            const colorMap: Record<string, string> = {
              cyan: "cyan",
              violet: "violet",
              amber: "amber",
            };
            const c = colorMap[item.color];
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-800/80 bg-[#0a1020]/60 p-8 text-center backdrop-blur-xl transition-all duration-300 hover:border-${c}-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
              >
                <div className={`relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-${c}-500/10 border border-${c}-500/20 transition-all group-hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]`}>
                  <div className={`absolute inset-0 rounded-2xl bg-${c}-400/20 blur-md opacity-0 transition-opacity group-hover:opacity-100`} />
                  <Icon className={`relative h-6 w-6 text-${c}-400`} />
                </div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Step {item.step}</div>
                <h3 className={`mb-3 text-xl font-bold text-white ${syne.className}`}>{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#0a1020] to-[#0d1530] p-10 text-center sm:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]"
          />
          <h2 className={`relative mb-4 text-3xl font-bold text-white sm:text-4xl ${syne.className}`}>
            Ready to unlock AI's full potential?
          </h2>
          <p className="relative mx-auto mb-8 max-w-xl text-slate-400">
            Every great AI output starts with a great prompt. Start enhancing yours —
            free, fast, and powerful.
          </p>
          <button
            onClick={scrollToTool}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-8 py-3.5 text-base font-bold text-slate-900 shadow-lg shadow-cyan-500/30 transition-all hover:shadow-[0_0_50px_rgba(34,211,238,0.7)] active:scale-[0.98]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
            <Zap className="relative h-5 w-5" fill="currentColor" />
            <span className="relative">Start Enhancing Free</span>
            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-slate-800/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/30 to-teal-500/20 border border-cyan-400/40">
              <div className="absolute inset-0 rounded-lg bg-cyan-400/20 blur-md" />
              <Zap className="relative h-3.5 w-3.5 text-cyan-300" fill="currentColor" />
            </div>
            <span className={`text-sm font-bold ${syne.className}`}>
              Prompt<span className="bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">Forge</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">Transform your prompts. Unlock AI's full potential.</p>
          <p className="text-xs text-slate-500">© 2026 PromptForge. All rights reserved.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes moveRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 400px)); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 40px) scale(1.08); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 50px) scale(1.04); }
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 211, 238, 0.4) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(34, 211, 238, 0.5),
            rgba(45, 212, 191, 0.3)
          );
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.6);
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(34, 211, 238, 0.8),
            rgba(45, 212, 191, 0.5)
          );
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.5);
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(
            180deg,
            rgba(103, 232, 249, 0.9),
            rgba(34, 211, 238, 0.6)
          );
          box-shadow: 0 0 16px rgba(34, 211, 238, 0.7);
        }

        /* Firefox support */
        .custom-scrollbar:hover {
          scrollbar-color: rgba(34, 211, 238, 0.6) transparent;
        }
      `}</style>
    </div>
  );
}