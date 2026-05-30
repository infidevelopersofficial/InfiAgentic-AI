import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bot, Zap, BarChart3, Users, Mail, FileText, ArrowRight, CheckCircle } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "Multi-Agent AI",
    description: "Orchestrate multiple AI agents that work together to create, optimize, and publish content.",
  },
  {
    icon: FileText,
    title: "Content Studio",
    description: "Generate high-quality blog posts, social media content, and email copy with AI assistance.",
  },
  {
    icon: Mail,
    title: "Email Automation",
    description: "Create personalized email campaigns with AI-driven content and smart scheduling.",
  },
  {
    icon: Users,
    title: "CRM & Lead Scoring",
    description: "Manage leads with AI-powered scoring and automated nurture sequences.",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Build powerful automation workflows with drag-and-drop simplicity.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track performance across all channels with real-time insights and reporting.",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Agentic AI</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="#docs" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Docs
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            AI-Powered Marketing
            <span className="block text-primary">Automation Platform</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Orchestrate multiple AI agents to create content, manage campaigns, nurture leads, and grow your business on
            autopilot.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo">Watch Demo</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              14-day free trial
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to automate marketing</h2>
            <p className="mt-4 text-lg text-muted-foreground">Powerful features designed for modern marketing teams</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to transform your marketing?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of marketers using Agentic AI to grow their business.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/dashboard">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Agentic AI</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Agentic AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
