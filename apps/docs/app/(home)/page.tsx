import type { Metadata } from "next";
import Link from "next/link";
import { PROJECT_NAME } from "@/constants";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: PROJECT_NAME,
  description:
    "A comprehensive, full-stack monorepo starter kit for building modern applications. Start building production-ready applications faster with everything you need: authentication, database integration, and developer-friendly tooling.",
  keywords: [
    "starter kit",
    "monorepo",
    "TypeScript",
    "Next.js",
    "authentication",
    "database",
    "full-stack",
  ],
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    images: [
      {
        url: "/twitter-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-fd-primary/5 via-fd-background to-fd-primary/5" />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                30deg,
                rgba(59, 130, 246, 0.4) 0px,
                rgba(59, 130, 246, 0.4) 1px,
                transparent 1px,
                transparent 24px
              ),
              repeating-linear-gradient(
                150deg,
                rgba(59, 130, 246, 0.4) 0px,
                rgba(59, 130, 246, 0.4) 1px,
                transparent 1px,
                transparent 24px
              )
            `,
            maskImage:
              "radial-gradient(ellipse 120% 80% at center, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 70%, black 85%)",
          }}
        />

        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] max-w-[50vw] max-h-[50vw] bg-fd-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] max-w-[40vw] max-h-[40vw] bg-fd-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 text-center max-w-6xl mx-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-fd-foreground via-fd-primary to-fd-foreground bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {PROJECT_NAME}
          </h1>

          <p className="text-lg md:text-xl font-semibold animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            A comprehensive, full-stack monorepo starter kit for building modern applications
          </p>

          <p className="text-base font-normal max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            Start building production-ready applications faster with everything you need:
            authentication, database integration, and developer-friendly tooling.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <FeatureCard
            icon="🔒"
            title="Secure Authentication"
            description="Decoupled auth server with JWT validation and Better Auth integration"
          />
          <FeatureCard
            icon="⚡"
            title="Type-Safe Stack"
            description="End-to-end TypeScript with Drizzle ORM and Zod validation"
          />
          <FeatureCard
            icon="🚀"
            title="Production Ready"
            description="Monorepo structure with Turborepo, comprehensive docs, and best practices"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
          <Link
            href="/docs"
            className="group relative px-6 py-3 rounded-lg bg-fd-primary text-fd-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-fd-primary to-fd-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          <a
            href="https://github.com/yurisasc/starter-kit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-fd-muted/80 backdrop-blur-sm border border-fd-border font-semibold hover:border-fd-primary hover:bg-fd-muted transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <title>GitHub</title>
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000">
          {["TypeScript", "Hono", "Drizzle", "Better Auth", "Turborepo", "pnpm"].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-full bg-fd-muted/80 backdrop-blur-sm text-sm font-medium text-fd-foreground border border-fd-border hover:border-fd-primary hover:bg-fd-muted transition-colors duration-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative p-5 rounded-xl bg-fd-card/50 backdrop-blur-sm border border-fd-border hover:border-fd-primary/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-base font-semibold mb-1.5 text-fd-foreground group-hover:text-fd-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-fd-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
