import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
} from "remotion";

const fontFamily =
  "'Raleway', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const GOLD = "#C9A84C";
const BLACK = "#0A0A0A";
const WHITE = "#FFFFFF";
const MUTED = "rgba(255,255,255,0.65)";

const FPS = 30;

export const DEMO_EXPLAINER_DURATION = 70 * FPS;

const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 30%, ${"#161310"} 0%, ${BLACK} 65%)`,
      }}
    />
  );
};

const FadeUp: React.FC<{
  delay?: number;
  durationInFrames?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, durationInFrames = 20, children, style }) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const progress = spring({
    frame: local,
    fps: FPS,
    config: { damping: 200, stiffness: 120, mass: 0.7 },
    durationInFrames,
  });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [24, 0]);

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)`, ...style }}>
      {children}
    </div>
  );
};

const FadeOutWrapper: React.FC<{
  totalDuration: number;
  fadeFrames?: number;
  children: React.ReactNode;
}> = ({ totalDuration, fadeFrames = 12, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [totalDuration - fadeFrames, totalDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <div style={{ opacity, height: "100%" }}>{children}</div>;
};

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      color: GOLD,
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: 4,
      textTransform: "uppercase",
      marginBottom: 24,
    }}
  >
    {children}
  </div>
);

const CenteredScene: React.FC<{
  duration: number;
  children: React.ReactNode;
}> = ({ duration, children }) => (
  <FadeOutWrapper totalDuration={duration}>
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "0 160px",
      }}
    >
      {children}
    </AbsoluteFill>
  </FadeOutWrapper>
);

// ---- Scene 1: Hook (0:00 - 0:06) ----
const HookScene: React.FC<{ duration: number }> = ({ duration }) => (
  <CenteredScene duration={duration}>
    <FadeUp delay={4}>
      <div style={{ fontSize: 72, fontWeight: 800, color: WHITE, lineHeight: 1.15 }}>
        Your landing page should be
      </div>
    </FadeUp>
    <FadeUp delay={16}>
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: GOLD,
          lineHeight: 1.15,
          marginTop: 8,
        }}
      >
        selling while you sleep.
      </div>
    </FadeUp>
  </CenteredScene>
);

// ---- Scene 2: Problem (0:06 - 0:14) ----
const ProblemScene: React.FC<{ duration: number }> = ({ duration }) => (
  <CenteredScene duration={duration}>
    <FadeUp delay={4}>
      <Eyebrow>The Problem</Eyebrow>
    </FadeUp>
    <FadeUp delay={12}>
      <div style={{ fontSize: 56, fontWeight: 700, color: WHITE, lineHeight: 1.35 }}>
        Most coaches and consultants have no landing page —
        <br />
        or one that isn&apos;t generating leads.
      </div>
    </FadeUp>
  </CenteredScene>
);

// ---- Scene 3: Solution reveal (0:14 - 0:22) ----
const SolutionScene: React.FC<{ duration: number }> = ({ duration }) => (
  <CenteredScene duration={duration}>
    <FadeUp delay={4}>
      <Eyebrow>The AI Docs Lab</Eyebrow>
    </FadeUp>
    <FadeUp delay={12}>
      <div style={{ fontSize: 64, fontWeight: 800, color: WHITE, lineHeight: 1.25 }}>
        A custom, AI-powered landing page
        <br />
        <span style={{ color: GOLD }}>built and delivered in 48 hours.</span>
      </div>
    </FadeUp>
  </CenteredScene>
);

// ---- Scene 4: Feature list (0:22 - 0:40) ----
const FEATURES = [
  "A 24/7 AI chatbot trained on your business",
  "Built to be found by ChatGPT, Claude, and Perplexity — not just Google",
  "Lead capture and booking, built in from day one",
];

const FeatureRow: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const progress = spring({
    frame: local,
    fps: FPS,
    config: { damping: 200, stiffness: 120, mass: 0.7 },
  });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateX = interpolate(progress, [0, 1], [-40, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        marginBottom: 36,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          background: GOLD,
          flexShrink: 0,
        }}
      />
      <div style={{ fontSize: 42, fontWeight: 600, color: WHITE, textAlign: "left" }}>
        {text}
      </div>
    </div>
  );
};

const FeatureScene: React.FC<{ duration: number }> = ({ duration }) => (
  <CenteredScene duration={duration}>
    <div style={{ marginBottom: 40 }}>
      <FadeUp delay={2}>
        <Eyebrow>What You Get</Eyebrow>
      </FadeUp>
    </div>
    <div style={{ width: "100%" }}>
      {FEATURES.map((text, i) => (
        <FeatureRow key={text} text={text} delay={8 + i * 16} />
      ))}
    </div>
  </CenteredScene>
);

// ---- Scene 5: Proof (0:40 - 0:50) ----
const ProofScene: React.FC<{ duration: number }> = ({ duration }) => (
  <CenteredScene duration={duration}>
    <FadeUp delay={4}>
      <Eyebrow>See It Live</Eyebrow>
    </FadeUp>
    <FadeUp delay={12}>
      <div style={{ fontSize: 56, fontWeight: 700, color: WHITE, lineHeight: 1.35 }}>
        A real, working page with a real AI chatbot
        <br />
        you can talk to right now.
      </div>
    </FadeUp>
    <FadeUp delay={22}>
      <div
        style={{
          marginTop: 40,
          fontSize: 44,
          fontWeight: 800,
          color: GOLD,
          letterSpacing: 1,
        }}
      >
        demo.theaidocslab.com
      </div>
    </FadeUp>
  </CenteredScene>
);

// ---- Scene 6: Offer (0:50 - 1:00) ----
const OfferScene: React.FC<{ duration: number }> = ({ duration }) => (
  <CenteredScene duration={duration}>
    <FadeUp delay={4}>
      <Eyebrow>The Offer</Eyebrow>
    </FadeUp>
    <FadeUp delay={12}>
      <div style={{ fontSize: 120, fontWeight: 800, color: GOLD, lineHeight: 1 }}>
        $497
      </div>
    </FadeUp>
    <FadeUp delay={22}>
      <div style={{ fontSize: 40, fontWeight: 600, color: WHITE, marginTop: 20 }}>
        One-time. No monthly software fees. You own it.
      </div>
    </FadeUp>
    <FadeUp delay={32}>
      <div style={{ fontSize: 32, fontWeight: 500, color: MUTED, marginTop: 16 }}>
        Every application is reviewed personally within 24 hours.
      </div>
    </FadeUp>
  </CenteredScene>
);

// ---- Scene 7: CTA (1:00 - 1:10) ----
const CtaScene: React.FC<{ duration: number }> = ({ duration }) => (
  <CenteredScene duration={duration}>
    <FadeUp delay={4}>
      <div style={{ fontSize: 68, fontWeight: 800, color: WHITE, lineHeight: 1.25 }}>
        Apply today. See your page
        <br />
        in <span style={{ color: GOLD }}>48 hours.</span>
      </div>
    </FadeUp>
    <FadeUp delay={20}>
      <div
        style={{
          marginTop: 48,
          fontSize: 44,
          fontWeight: 800,
          color: BLACK,
          background: GOLD,
          padding: "20px 56px",
          borderRadius: 8,
          display: "inline-block",
        }}
      >
        demo.theaidocslab.com
      </div>
    </FadeUp>
  </CenteredScene>
);

const sceneDurations = {
  hook: 6 * FPS,
  problem: 8 * FPS,
  solution: 8 * FPS,
  features: 18 * FPS,
  proof: 10 * FPS,
  offer: 10 * FPS,
  cta: 10 * FPS,
};

export const DemoExplainer: React.FC = () => {
  let cursor = 0;
  const seq = (name: keyof typeof sceneDurations) => {
    const from = cursor;
    cursor += sceneDurations[name];
    return { from, duration: sceneDurations[name] };
  };

  const hook = seq("hook");
  const problem = seq("problem");
  const solution = seq("solution");
  const features = seq("features");
  const proof = seq("proof");
  const offer = seq("offer");
  const cta = seq("cta");

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />
      <Sequence from={hook.from} durationInFrames={hook.duration}>
        <HookScene duration={hook.duration} />
      </Sequence>
      <Sequence from={problem.from} durationInFrames={problem.duration}>
        <ProblemScene duration={problem.duration} />
      </Sequence>
      <Sequence from={solution.from} durationInFrames={solution.duration}>
        <SolutionScene duration={solution.duration} />
      </Sequence>
      <Sequence from={features.from} durationInFrames={features.duration}>
        <FeatureScene duration={features.duration} />
      </Sequence>
      <Sequence from={proof.from} durationInFrames={proof.duration}>
        <ProofScene duration={proof.duration} />
      </Sequence>
      <Sequence from={offer.from} durationInFrames={offer.duration}>
        <OfferScene duration={offer.duration} />
      </Sequence>
      <Sequence from={cta.from} durationInFrames={cta.duration}>
        <CtaScene duration={cta.duration} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const demoExplainerTotalDuration = Object.values(sceneDurations).reduce(
  (a, b) => a + b,
  0,
);
