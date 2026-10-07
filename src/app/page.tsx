"use client";

import { useState } from "react";

type VideoInfo = {
  title: string;
  thumbnail: string;
  resolutions: number[];
  channel?: string;
  channelAvatar?: string;
  subscribers?: number;
  views?: number;
  likes?: number;
  uploadDate?: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("video");
  const [quality, setQuality] = useState("1080");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  // Track if avatar image fails to load so we can fallback to initial
  const [avatarError, setAvatarError] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  const handleFetchInfo = async () => {
    if (!url) return;

    setFetchingInfo(true);
    setInfo(null);
    setAvatarError(false);
    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.resolutions) {
        setInfo(data);
        setQuality(data.resolutions[0].toString());
      } else {
        alert(data.error || "Failed to fetch video info");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching info. Check console.");
    } finally {
      setFetchingInfo(false);
    }
  };

  const handleDownload = () => {
    if (!url || !info) return;
    setLoading(true);
    window.location.href = `/api/download?url=${encodeURIComponent(url)}&quality=${quality}&type=${type}&title=${encodeURIComponent(info.title)}`;
    setTimeout(() => setLoading(false), 3000);
  };

  const handleFormatChange = (val: string) => {
    if (val === "mp3" || val === "flac" || val === "m4a" || val === "wav") {
      setType("audio");
    } else {
      setType("video");
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const channelName = info?.channel || "Unknown Channel";
  const channelInitial = channelName.charAt(0).toUpperCase();
  const subsText = info?.subscribers
    ? `${formatNumber(info.subscribers)} subscribers`
    : "Subscribers hidden";
  const avatarUrl = info?.channelAvatar || "";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-highest/90 shadow-2xl">
        <div className="h-16 w-full max-w-7xl mx-auto px-gutter-lg flex items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-container via-secondary-container to-tertiary flex items-center justify-center shadow-[0_0_16px_rgba(255,81,104,0.35)]">
                <span className="material-symbols-outlined text-[20px] text-on-primary-fixed">
                  bolt
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                  StreamFetch
                </span>
                <span className="font-label-sm text-[11px] px-1.5 py-0.5 rounded bg-primary-container/20 text-primary border border-primary/20 uppercase tracking-widest font-semibold">
                  PRO
                </span>
              </div>
            </div>
            <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high border border-surface-container-highest/90">
              <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_#4cd7f6]"></span>
              <span className="font-label-sm text-label-sm text-tertiary font-code-metric tracking-wide">
                Edge Fast CDN • 24ms
              </span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-1 bg-surface-container-low/80 p-1 rounded-xl border border-surface-container-highest/60">
            <a
              aria-current="page"
              className="px-space-md py-1.5 transition-all bg-primary-container/20 text-primary font-headline-sm text-body-md rounded-lg shadow-sm border border-primary-container/30"
              data-path="downloader"
              href="#"
            >
              Downloader
            </a>
            <a
              className="px-space-md py-1.5 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              data-path="batch-queue"
              href="#"
            >
              Batch Queue
            </a>
            <a
              className="px-space-md py-1.5 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              data-path="history"
              href="#"
            >
              History
            </a>
            <a
              className="px-space-md py-1.5 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              data-path="audio-extractor"
              href="#"
            >
              Audio Extractor
            </a>
            <a
              className="px-space-md py-1.5 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              data-path="api-and-extension"
              href="#"
            >
              API &amp; Extension
            </a>
          </nav>
          <div className="flex items-center gap-space-sm">
            <a
              className="hidden sm:flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-surface-container-highest/60"
              data-path="documentation"
              href="#"
              title="API Docs"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">
                terminal
              </span>
              <span className="hidden md:inline">API Docs</span>
            </a>
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors border border-surface-container-highest/60"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDarkMode ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-secondary flex items-center justify-center shrink-0 shadow-md ring-2 ring-primary-container/30">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)]">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[840px] h-[450px] bg-gradient-to-b from-primary-container/15 via-secondary-container/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10"></div>
          <div className="absolute top-80 right-0 w-[500px] h-[500px] bg-tertiary-container/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
          <div className="relative w-full max-w-7xl mx-auto px-gutter-lg pb-space-xl overflow-hidden">
            <section className="w-full pt-space-xl pb-space-lg flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/90 border border-primary-container/30 mb-space-md shadow-[0_0_16px_rgba(255,81,104,0.15)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="font-label-sm text-label-sm text-primary tracking-wider uppercase font-semibold">
                  V3.0 HYPER-STREAM ENGINE
                </span>
                <span className="text-outline">•</span>
                <span className="font-code-metric text-[11px] text-tertiary">
                  4K 60FPS LOSSLESS READY
                </span>
              </div>

              <div className="w-full max-w-4xl relative">
                <div className="relative flex items-center bg-surface-container-lowest/90 border border-surface-container-highest hover:border-primary-container/50 focus-within:border-primary-container rounded-2xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 focus-within:shadow-[0_0_32px_rgba(255,81,104,0.28)]">
                  <div className="pl-space-md pr-space-sm flex items-center text-primary-container shrink-0">
                    <span className="material-symbols-outlined text-[30px]">
                      play_circle
                    </span>
                  </div>
                  <input
                    className="w-full bg-transparent text-on-surface font-body-md text-[16px] placeholder:text-outline/60 focus:outline-none py-space-sm px-space-xs"
                    id="url-input"
                    placeholder="Paste YouTube URL, Shorts, Vimeo, or playlist..."
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetchInfo()}
                  />
                  <button
                    onClick={() => {
                      setUrl("");
                      setInfo(null);
                    }}
                    aria-label="Clear input"
                    className="p-space-xs text-outline hover:text-on-surface rounded-lg transition-colors mr-space-xs flex items-center justify-center"
                    id="clear-btn"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      close
                    </span>
                  </button>
                  <button
                    onClick={handleFetchInfo}
                    disabled={fetchingInfo}
                    className="relative inline-flex items-center gap-space-xs bg-gradient-to-r from-primary-container via-primary-container to-secondary-container hover:opacity-95 text-on-primary-fixed px-space-xl py-3 rounded-xl font-headline-sm text-body-md transition-all duration-200 active:scale-95 shadow-[0_0_24px_rgba(255,81,104,0.45)] shrink-0 disabled:opacity-50"
                    id="fetch-btn"
                    type="button"
                  >
                    {fetchingInfo ? (
                      <span className="material-symbols-outlined text-[20px] animate-spin">
                        refresh
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">
                        bolt
                      </span>
                    )}
                    <span className="font-bold tracking-tight">
                      {fetchingInfo ? "Fetching..." : "Convert & Fetch"}
                    </span>
                  </button>
                </div>

                <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-sm px-space-xs">
                  <div className="flex items-center gap-space-sm flex-wrap">
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                      Quick Source:
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setUrl(text);
                        } catch (e) {}
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-high/80 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all border border-surface-container-highest/60"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px] text-tertiary">
                        content_paste
                      </span>
                      <span>Paste Clipboard</span>
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-high/80 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all border border-surface-container-highest/60"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        local_fire_department
                      </span>
                      <span>Trending 4K</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-space-xs font-code-metric text-label-sm text-outline">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">
                      lock
                    </span>
                    <span>End-to-End TLS Multiplexing</span>
                  </div>
                </div>
              </div>
            </section>

            {info && (
              <section className="mt-space-md w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg animate-in fade-in zoom-in duration-300">
                <div className="lg:col-span-8 flex flex-col gap-space-lg">
                  <div className="bg-surface-container-low/90 rounded-2xl p-space-lg shadow-2xl relative overflow-hidden backdrop-blur-xl border border-surface-container-highest/70">
                    <div className="flex flex-col md:flex-row gap-space-lg items-start">
                      <div className="relative w-full md:w-5/12 aspect-[16/9] rounded-xl overflow-hidden shrink-0 group bg-surface-container-lowest border border-surface-container-highest shadow-xl">
                        <img
                          alt="Preview"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          src={info.thumbnail}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-primary-container text-on-primary font-code-metric text-label-sm tracking-wider uppercase font-bold shadow-md">
                            4K 60FPS HDR
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-surface-container-highest/90 text-tertiary font-code-metric text-label-sm backdrop-blur-sm border border-tertiary/30">
                            AV1 / VP9
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-lowest/50 backdrop-blur-[2px]">
                          <button
                            aria-label="Play preview"
                            className="w-14 h-14 rounded-full bg-primary-container hover:bg-primary-container/90 text-on-primary flex items-center justify-center shadow-[0_0_24px_rgba(255,81,104,0.6)] transform scale-90 group-hover:scale-100 transition-transform"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[32px]">
                              play_arrow
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-tertiary mb-1.5 font-semibold">
                            <span className="material-symbols-outlined text-[16px] text-tertiary">
                              verified
                            </span>
                            <span>
                              STREAM ANALYZED &amp; VERIFIED COMPLIANT
                            </span>
                          </div>
                          <h2
                            className="font-headline-sm text-[20px] text-on-surface leading-snug line-clamp-2 font-bold"
                            title={info.title}
                          >
                            {info.title}
                          </h2>

                          <div className="mt-space-sm flex items-center gap-space-sm flex-wrap">
                            <div className="flex items-center gap-2">
                              {avatarUrl && !avatarError ? (
                                <img
                                  src={avatarUrl}
                                  alt={channelName}
                                  className="w-6 h-6 rounded-full bg-surface-container-highest border border-surface-container-highest object-cover shadow-sm"
                                  onError={() => setAvatarError(true)}
                                />
                              ) : (
                                <span className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center font-bold text-[11px] shadow-sm">
                                  {channelInitial}
                                </span>
                              )}
                              <span className="font-headline-sm text-body-md text-on-surface font-semibold">
                                {channelName}
                              </span>
                              <span className="material-symbols-outlined text-[16px] text-tertiary">
                                verified
                              </span>
                            </div>
                            <span className="text-outline">•</span>
                            <span className="font-body-sm text-body-sm text-outline">
                              {subsText}
                            </span>

                            {info.views && (
                              <>
                                <span className="text-outline">•</span>
                                <span className="font-body-sm text-body-sm text-outline">
                                  {formatNumber(info.views)} views
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-low/90 rounded-2xl p-space-lg shadow-2xl relative backdrop-blur-xl border border-surface-container-highest/70">
                    <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-surface-container-highest/60">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined text-[20px]">
                            tune
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Codec &amp; Extraction Configuration
                        </h3>
                      </div>
                      <span className="font-code-metric text-label-sm px-2.5 py-1 rounded-md bg-surface-container-high text-tertiary border border-tertiary/20 font-bold">
                        DIRECT FAST-MUX PIPELINE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="font-label-md text-label-md text-outline uppercase tracking-wider flex items-center justify-between"
                          htmlFor="format-select"
                        >
                          <span className="font-semibold">
                            1. Target Output Format
                          </span>
                          <span className="text-tertiary font-code-metric text-label-sm">
                            CONTAINER
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            onChange={(e) => handleFormatChange(e.target.value)}
                            className="w-full appearance-none bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-md text-body-md rounded-xl py-3 pl-space-md pr-10 focus:outline-none focus:ring-2 focus:ring-secondary transition-colors cursor-pointer border border-surface-container-highest"
                            id="format-select"
                          >
                            <optgroup label="Video Formats (Audio Merged)">
                              <option value="mp4">
                                MP4 Video (.mp4) - Maximum Universal Playback
                              </option>
                              <option value="mkv">
                                MKV Container (.mkv) - Multi-Track Lossless
                              </option>
                              <option value="webm">
                                WebM (.webm) - High Efficiency AV1/VP9
                              </option>
                            </optgroup>
                            <optgroup label="Audio Only Master Formats">
                              <option value="mp3">
                                MP3 Audio (.mp3) - Studio 320 kbps
                              </option>
                              <option value="flac">
                                FLAC Lossless (.flac) - Hi-Fi Studio Master
                              </option>
                              <option value="m4a">
                                M4A / AAC (.m4a) - Apple Native Audio
                              </option>
                              <option value="wav">
                                WAV (.wav) - 24-bit Uncompressed
                              </option>
                            </optgroup>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-space-md pointer-events-none text-outline">
                            <span className="material-symbols-outlined text-[20px]">
                              expand_more
                            </span>
                          </div>
                        </div>
                        <span className="font-body-sm text-body-sm text-outline">
                          Direct muxing retains native H.264/AV1 visual fidelity
                          and dual stereo AAC.
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="font-label-md text-label-md text-outline uppercase tracking-wider flex items-center justify-between"
                          htmlFor="quality-select"
                        >
                          <span className="font-semibold">
                            2. Target Quality &amp; Bitrate
                          </span>
                          <span className="text-primary font-code-metric text-label-sm">
                            RESOLUTION
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            value={quality}
                            onChange={(e) => setQuality(e.target.value)}
                            disabled={type === "audio"}
                            className="w-full appearance-none bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-md text-body-md rounded-xl py-3 pl-space-md pr-10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer border border-surface-container-highest disabled:opacity-50"
                            id="quality-select"
                          >
                            {info.resolutions.map((res) => (
                              <option key={res} value={res}>
                                {res}p (Direct Stream)
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-space-md pointer-events-none text-outline">
                            <span className="material-symbols-outlined text-[20px]">
                              expand_more
                            </span>
                          </div>
                        </div>
                        <span className="font-body-sm text-body-sm text-outline">
                          Zero quality loss through direct stream pass-through.
                        </span>
                      </div>
                    </div>

                    <div className="mt-space-xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
                      <div className="flex items-center gap-space-sm w-full sm:w-auto">
                        <button
                          disabled={loading}
                          onClick={handleDownload}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-xl py-3.5 rounded-xl bg-gradient-to-r from-primary-container via-primary-container to-secondary-container hover:opacity-95 text-on-primary-fixed font-headline-sm text-headline-sm shadow-[0_0_28px_rgba(255,81,104,0.45)] transition-all transform active:scale-95 border border-primary/20 disabled:opacity-50"
                          id="main-download-btn"
                          type="button"
                        >
                          {loading ? (
                            <span className="material-symbols-outlined text-[26px] animate-spin">
                              refresh
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-[26px]">
                              download
                            </span>
                          )}
                          <span className="font-bold">
                            {loading ? "Starting..." : "Download File"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-space-lg">
                  <div className="bg-surface-container-low/90 rounded-2xl p-space-lg shadow-2xl relative backdrop-blur-xl border border-surface-container-highest/70">
                    <div className="flex items-center justify-between mb-space-md">
                      <div className="flex items-center gap-space-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_#4cd7f6]"></span>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Live Pipe Telemetry
                        </h3>
                      </div>
                      <span className="font-code-metric text-label-sm text-tertiary bg-surface-container-high px-2.5 py-0.5 rounded-md border border-tertiary/20 font-bold">
                        1 STREAM ACTIVE
                      </span>
                    </div>
                    <div className="p-space-md rounded-xl bg-surface-container space-y-space-md border border-surface-container-highest/60">
                      <div className="flex items-start justify-between gap-space-sm">
                        <div className="min-w-0">
                          <p className="font-headline-sm text-body-md text-on-surface truncate font-semibold">
                            {info.title}
                          </p>
                          <p className="font-code-metric text-label-sm text-outline mt-0.5">
                            {type === "audio"
                              ? "MP3 Audio"
                              : `MKV / MP4 ${quality}p`}
                          </p>
                        </div>
                      </div>

                      {loading && (
                        <div className="space-y-1.5 animate-in fade-in">
                          <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden p-0.5 border border-surface-container-highest">
                            <div className="bg-gradient-to-r from-primary-container via-secondary to-tertiary h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(76,215,246,0.6)] w-full animate-pulse"></div>
                          </div>
                          <div className="flex items-center justify-between font-code-metric text-label-sm text-on-surface-variant">
                            <span className="text-tertiary font-bold">
                              Stream Active
                            </span>
                            <span>Transferring...</span>
                          </div>
                        </div>
                      )}

                      <div className="pt-space-xs flex items-end justify-between gap-1.5 h-10 px-1 bg-surface-container-lowest/60 rounded-lg">
                        <div className="w-1.5 bg-tertiary/40 rounded-t h-[40%]"></div>
                        <div className="w-1.5 bg-tertiary/40 rounded-t h-[60%]"></div>
                        <div className="w-1.5 bg-tertiary/60 rounded-t h-[50%]"></div>
                        <div className="w-1.5 bg-tertiary/70 rounded-t h-[75%]"></div>
                        <div className="w-1.5 bg-tertiary/80 rounded-t h-[65%]"></div>
                        <div className="w-1.5 bg-tertiary/90 rounded-t h-[85%]"></div>
                        <div className="w-1.5 bg-tertiary rounded-t h-[100%]"></div>
                        <div className="w-1.5 bg-tertiary rounded-t h-[92%]"></div>
                        <div className="w-1.5 bg-tertiary rounded-t h-[88%]"></div>
                        <div className="w-1.5 bg-tertiary rounded-t h-[95%]"></div>
                        <div className="w-1.5 bg-primary-container rounded-t h-[98%] animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {!info && (
              <section className="mt-space-xl pt-space-md w-full animate-in fade-in zoom-in duration-500">
                <div className="flex items-center gap-space-xs mb-space-lg">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                    StreamFetch Core Guarantees
                  </span>
                  <div className="flex-1 h-px bg-surface-container-high"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                  <div className="bg-surface-container-low/80 rounded-2xl p-space-lg shadow-xl hover:bg-surface-container transition-all duration-300 border border-surface-container-highest/60">
                    <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary-container flex items-center justify-center mb-space-md shadow-md">
                      <span className="material-symbols-outlined text-[26px]">
                        speed
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-semibold">
                      No Speed Throttling
                    </h4>
                    <p className="font-body-md text-body-md text-outline">
                      Direct high-capacity parallel chunk downloading bypasses
                      platform rate limiters. Instantaneous gigabit extraction
                      without waiting queues.
                    </p>
                  </div>
                  <div className="bg-surface-container-low/80 rounded-2xl p-space-lg shadow-xl hover:bg-surface-container transition-all duration-300 border border-surface-container-highest/60">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center mb-space-md shadow-md">
                      <span className="material-symbols-outlined text-[26px]">
                        video_settings
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-semibold">
                      Universal Codecs
                    </h4>
                    <p className="font-body-md text-body-md text-outline">
                      Full support for modern AV1, VP9, and H.264 video streams
                      alongside studio standard FLAC lossless, 320k MP3, and AAC
                      audio containers.
                    </p>
                  </div>
                  <div className="bg-surface-container-low/80 rounded-2xl p-space-lg shadow-xl hover:bg-surface-container transition-all duration-300 border border-surface-container-highest/60">
                    <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center mb-space-md shadow-md">
                      <span className="material-symbols-outlined text-[26px]">
                        security
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-semibold">
                      100% Private
                    </h4>
                    <p className="font-body-md text-body-md text-outline">
                      No server logging, client-direct stream fetch, and no
                      shady popups or redirected links. Media is processed
                      cleanly in real-time.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest border-t border-surface-container-highest/30">
        <div className="w-full max-w-7xl mx-auto px-gutter-lg py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg">
          <div className="flex flex-col sm:flex-row items-center gap-space-md text-center sm:text-left">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Supported Protocols:
            </span>
            <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
              <span className="px-space-sm py-space-xs rounded bg-surface-container">
                YouTube
              </span>
              <span className="px-space-sm py-space-xs rounded bg-surface-container">
                Vimeo
              </span>
              <span className="px-space-sm py-space-xs rounded bg-surface-container">
                HLS / DASH
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-space-md font-body-sm text-body-sm text-on-surface-variant">
            <a className="hover:text-on-surface transition-colors" href="#">
              Terms
            </a>
            <a className="hover:text-on-surface transition-colors" href="#">
              API Spec
            </a>
            <span className="font-code-metric text-code-metric text-tertiary px-space-xs py-0.5 rounded bg-surface-container-high">
              v3.0.0-edge
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
