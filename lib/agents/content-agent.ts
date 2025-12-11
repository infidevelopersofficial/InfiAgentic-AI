// Content Agent - Generates marketing content using AI

export interface ContentGenerationParams {
  type: "blog" | "social" | "email" | "ad"
  platform?: "twitter" | "linkedin" | "facebook" | "instagram"
  topic: string
  tone?: "professional" | "casual" | "inspiring" | "educational"
  keywords?: string[]
  maxLength?: number
}

export interface GeneratedContent {
  content: string
  title?: string
  hashtags?: string[]
  metadata: {
    word_count: number
    reading_time: number
    seo_score?: number
    sentiment?: string
  }
}

export const CONTENT_AGENT_SYSTEM_PROMPT = `
You are an expert marketing content creator for an AI-powered marketing automation platform.

**Core Guidelines:**
- Always maintain brand voice consistency
- Create value-driven content that educates before selling
- Use relevant hashtags and optimize for each platform's algorithm
- Include clear calls-to-action without being pushy
- Adapt content length and style for each platform:
  - Twitter: Concise, engaging, 280 chars max
  - LinkedIn: Professional, thought-leadership, 1300 chars ideal
  - Instagram: Visual-first, emotional, storytelling
  - Facebook: Community-focused, conversational
  - Email: Personalized, value-packed, scannable

**Content Quality Standards:**
- Readability: Flesch score > 60
- SEO: Include primary keyword in first 100 words
- Engagement: Hook in first line, CTA in last line
- Accuracy: Fact-check all claims
`

export class ContentAgent {
  private systemPrompt: string

  constructor() {
    this.systemPrompt = CONTENT_AGENT_SYSTEM_PROMPT
  }

  async generateContent(params: ContentGenerationParams): Promise<GeneratedContent> {
    // In a real implementation, this would call an LLM API
    const mockContent = this.generateMockContent(params)

    return {
      content: mockContent,
      title: params.type === "blog" ? `${params.topic} - Complete Guide` : undefined,
      hashtags: this.generateHashtags(params.topic, params.platform),
      metadata: {
        word_count: mockContent.split(" ").length,
        reading_time: Math.ceil(mockContent.split(" ").length / 200),
        seo_score: 85,
        sentiment: "positive",
      },
    }
  }

  private generateMockContent(params: ContentGenerationParams): string {
    const { type, topic, platform } = params

    if (type === "social" && platform === "twitter") {
      return `🚀 ${topic}\n\nThis is an exciting development in the industry. Here's why it matters for your business:\n\n#Marketing #AI #Innovation`
    }

    if (type === "social" && platform === "linkedin") {
      return `I've been thinking about ${topic} lately, and here's what I've learned:\n\nThe landscape is changing rapidly. Companies that adapt will thrive.\n\nKey takeaways:\n• Innovation drives growth\n• Customer focus is essential\n• Data-driven decisions win\n\nWhat are your thoughts? Share in the comments.`
    }

    if (type === "email") {
      return `Subject: Discover ${topic}\n\nHi [Name],\n\nI wanted to share something exciting with you about ${topic}.\n\nHere's why this matters:\n- Point 1\n- Point 2\n- Point 3\n\nReady to learn more? Click below.\n\n[CTA Button]\n\nBest,\nThe Team`
    }

    return `# ${topic}\n\nIntroduction to ${topic}...\n\n## Why This Matters\n\nContent explaining the importance...\n\n## Key Points\n\n1. First point\n2. Second point\n3. Third point\n\n## Conclusion\n\nSummary and call to action.`
  }

  private generateHashtags(topic: string, platform?: string): string[] {
    const baseHashtags = ["Marketing", "Business", "AI", "Innovation"]
    const topicWords = topic.toLowerCase().split(" ")

    const hashtags = [...baseHashtags, ...topicWords.slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1))]

    if (platform === "instagram") {
      return hashtags.slice(0, 30) // Instagram allows up to 30
    }

    return hashtags.slice(0, 5) // Most platforms prefer fewer
  }

  async optimizeSEO(content: string, keywords: string[]): Promise<{ content: string; score: number }> {
    // Mock SEO optimization
    const optimizedContent = content
    let score = 70

    // Check for keywords in content
    keywords.forEach((keyword) => {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        score += 5
      }
    })

    // Cap score at 100
    score = Math.min(score, 100)

    return { content: optimizedContent, score }
  }

  async analyzeReadability(content: string): Promise<{ score: number; suggestions: string[] }> {
    const words = content.split(/\s+/).length
    const sentences = content.split(/[.!?]+/).length
    const avgWordsPerSentence = words / sentences

    let score = 100

    if (avgWordsPerSentence > 20) {
      score -= 20
    }
    if (words > 2000) {
      score -= 10
    }

    const suggestions: string[] = []
    if (avgWordsPerSentence > 20) {
      suggestions.push("Consider shorter sentences for better readability")
    }

    return { score, suggestions }
  }
}

export const contentAgent = new ContentAgent()
