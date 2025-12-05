import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageIcon, Sparkles, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">ImageGen</span>
          </div>
          <Link href="/dashboard">
            <Button variant="default">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Sparkles className="h-4 w-4" />
            Create stunning social media graphics
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Generate Beautiful Images
            <span className="block text-blue-600">In Seconds</span>
          </h1>

          <p className="mb-10 text-xl text-slate-600">
            Professional image generation with custom text styling, rich templates,
            and advanced design features. No design skills required.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Start Creating Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard/editor">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Try Editor
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-24 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<ImageIcon className="h-6 w-6" />}
            title="Multiple Templates"
            description="Choose from professional templates designed for social media, marketing, and more."
          />
          <FeatureCard
            icon={<Sparkles className="h-6 w-6" />}
            title="Rich Text Styling"
            description="Advanced text styling with custom fonts, colors, gradients, and effects."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Instant Generation"
            description="Generate high-quality images in seconds with our optimized rendering engine."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t bg-white/80 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          <p>&copy; 2025 ImageGen. Built with Next.js and Puppeteer.</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-blue-50 p-3 text-blue-600">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
