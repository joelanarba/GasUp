"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Shield, Users, Gauge, Droplets, Zap, Truck, Clock, MapPin, Scale, Star } from "lucide-react";
import { useRef, useEffect } from "react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Trail icon definitions — these appear at the cursor on mouse move  */
/* ------------------------------------------------------------------ */
interface TrailIcon {
  Icon: LucideIcon;
  color: string;       /* bg color for the circle */
  iconColor: string;   /* icon stroke color */
}

const TRAIL_ICONS: TrailIcon[] = [
  { Icon: Flame,    color: "rgba(245,158,11,0.15)", iconColor: "#f59e0b" },
  { Icon: Shield,   color: "rgba(34,197,94,0.15)",  iconColor: "#22c55e" },
  { Icon: Users,    color: "rgba(168,85,247,0.15)",  iconColor: "#a855f7" },
  { Icon: Gauge,    color: "rgba(245,158,11,0.15)",  iconColor: "#f59e0b" },
  { Icon: Droplets, color: "rgba(59,130,246,0.15)",  iconColor: "#3b82f6" },
  { Icon: Zap,      color: "rgba(234,179,8,0.15)",   iconColor: "#eab308" },
  { Icon: Truck,    color: "rgba(249,115,22,0.15)",  iconColor: "#f97316" },
  { Icon: Clock,    color: "rgba(99,102,241,0.15)",  iconColor: "#6366f1" },
  { Icon: MapPin,   color: "rgba(239,68,68,0.15)",   iconColor: "#ef4444" },
  { Icon: Scale,    color: "rgba(20,184,166,0.15)",  iconColor: "#14b8a6" },
  { Icon: Star,     color: "rgba(245,158,11,0.15)",  iconColor: "#f59e0b" },
  { Icon: Flame,    color: "rgba(249,115,22,0.15)",  iconColor: "#f97316" },
];

/* ------------------------------------------------------------------ */
/*  Utility helpers (ported from Sinqlo's ImageTrail pattern)          */
/* ------------------------------------------------------------------ */
const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
const getMouseDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) =>
  Math.hypot(p2.x - p1.x, p2.y - p1.y);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = trailContainerRef.current;
    const section = sectionRef.current;
    if (!container || !section) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>(".trail-icon"));
    const total = items.length;
    if (total === 0) return;

    let imgPosition = 0;
    let zIndexVal = 1;
    let activeCount = 0;
    let isIdle = true;
    const threshold = 100;

    const mousePos = { x: 0, y: 0 };
    const lastMousePos = { x: 0, y: 0 };
    const cacheMousePos = { x: 0, y: 0 };
    let rafId = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e && e.touches.length > 0) {
        mousePos.x = e.touches[0].pageX;
        mousePos.y = e.touches[0].pageY;
      } else if ("pageX" in e) {
        mousePos.x = (e as MouseEvent).pageX;
        mousePos.y = (e as MouseEvent).pageY;
      }
    };

    const showNextIcon = () => {
      ++zIndexVal;
      const item = items[imgPosition];
      imgPosition = imgPosition < total - 1 ? imgPosition + 1 : 0;
      if (!item) return;

      const size = 64;
      const halfSize = size / 2;

      /* 3D rotation from cursor position */
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const relX = mousePos.x - centerX;
      const relY = mousePos.y - centerY;
      const rotX = -(relY / centerY) * 15;
      const rotY = (relX / centerX) * 15;

      item.getAnimations().forEach((a) => a.cancel());
      activeCount++;
      isIdle = false;

      item.style.zIndex = String(zIndexVal);

      const showKf: Keyframe[] = [
        {
          transform: `translate(${cacheMousePos.x - halfSize}px, ${cacheMousePos.y - halfSize}px) scale(0.3) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          opacity: 0,
          offset: 0,
        },
        {
          transform: `translate(${mousePos.x - halfSize}px, ${mousePos.y - halfSize}px) scale(1) perspective(800px) rotateX(${rotX * 0.5}deg) rotateY(${rotY * 0.5}deg)`,
          opacity: 1,
          offset: 0.25,
        },
        {
          transform: `translate(${mousePos.x - halfSize}px, ${mousePos.y - halfSize}px) scale(1.1) perspective(800px) rotateX(0deg) rotateY(0deg)`,
          opacity: 0.8,
          offset: 0.5,
        },
        {
          transform: `translate(${mousePos.x - halfSize}px, ${mousePos.y - halfSize + 20}px) scale(0.6) perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(-400px)`,
          opacity: 0,
          offset: 1,
        },
      ];

      const anim = item.animate(showKf, {
        duration: 1400,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards",
      });

      anim.onfinish = () => {
        activeCount--;
        if (activeCount === 0) isIdle = true;
        item.style.opacity = "0";
      };
    };

    const render = () => {
      const distance = getMouseDistance(mousePos, lastMousePos);
      cacheMousePos.x = lerp(cacheMousePos.x || mousePos.x, mousePos.x, 0.1);
      cacheMousePos.y = lerp(cacheMousePos.y || mousePos.y, mousePos.y, 0.1);

      if (distance > threshold) {
        showNextIcon();
        lastMousePos.x = mousePos.x;
        lastMousePos.y = mousePos.y;
      }

      if (isIdle && zIndexVal !== 1) zIndexVal = 1;
      rafId = requestAnimationFrame(render);
    };

    let started = false;
    const startRender = () => {
      if (started) return;
      started = true;
      cacheMousePos.x = mousePos.x;
      cacheMousePos.y = mousePos.y;
      lastMousePos.x = mousePos.x;
      lastMousePos.y = mousePos.y;
      rafId = requestAnimationFrame(render);
    };

    section.addEventListener("mousemove", handlePointerMove);
    section.addEventListener("touchmove", handlePointerMove);
    section.addEventListener("mousemove", startRender);
    section.addEventListener("touchmove", startRender);

    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener("mousemove", handlePointerMove);
      section.removeEventListener("touchmove", handlePointerMove);
      section.removeEventListener("mousemove", startRender);
      section.removeEventListener("touchmove", startRender);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100vh] bg-[#141413] overflow-hidden"
    >
      {/* Grid dot texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      {/* Warm radial glow — top-right */}
      <div
        className="absolute -top-32 -right-32 w-[40rem] h-[40rem]"
        style={{
          background:
            "radial-gradient(circle, hsl(15 82% 49% / 0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Ambient bottom-left glow */}
      <div
        className="absolute -bottom-48 -left-48 w-[36rem] h-[36rem]"
        style={{
          background:
            "radial-gradient(circle, hsl(38 92% 50% / 0.06), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* ─── Icon trail container (all icons hidden, revealed by cursor) ─── */}
      <div
        ref={trailContainerRef}
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
        style={{ perspective: "800px" }}
        aria-hidden="true"
      >
        {TRAIL_ICONS.map(({ Icon, color, iconColor }, i) => (
          <div
            key={i}
            className="trail-icon absolute top-0 left-0 flex items-center justify-center rounded-full backdrop-blur-md border border-white/10 shadow-lg will-change-[transform,opacity]"
            style={{
              width: 64,
              height: 64,
              opacity: 0,
              backgroundColor: color,
            }}
          >
            <Icon
              className="w-7 h-7"
              style={{ color: iconColor }}
              strokeWidth={1.8}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-2">
        {/* ─── Left column ─── */}
        <div>
          <p className="reveal text-xs font-medium uppercase tracking-[0.25em] text-amber-400/80">
            Campus Gas Delivery
          </p>

          <h1
            className="reveal mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.08s" }}
          >
            Never run out of
            <br />
            <span className="flame-text">gas</span> again.
          </h1>

          <p
            className="reveal mt-6 max-w-lg text-lg leading-relaxed text-white/60"
            style={{ animationDelay: "0.18s" }}
          >
            GasUp predicts when your cylinder will run low, proves the weight
            you paid for, and pools hostel orders so every refill costs less.
          </p>

          {/* CTAs */}
          <div
            className="reveal mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "0.28s" }}
          >
            <Link
              href="/register"
              className="flame-gradient inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-white shadow-lg shadow-orange-900/25 transition-all hover:scale-[1.02] hover:shadow-orange-900/40 active:scale-[0.98]"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-white/80 transition-all hover:border-white/40 hover:text-white"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* ─── Right column — illustration ─── */}
        <div className="relative hidden lg:block">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full blur-3xl opacity-20"
            style={{
              background:
                "radial-gradient(circle, hsl(38 92% 50% / 0.35), transparent 70%)",
            }}
            aria-hidden="true"
          />

          <Image
            src="/images/hero-illustration.svg"
            alt="Campus gas delivery"
            width={600}
            height={500}
            className="relative z-10"
            style={{
              animation: "float 6s ease-in-out infinite",
            }}
            priority
          />

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-14px); }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}
