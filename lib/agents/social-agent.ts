/**
 * Social Media Agent
 *
 * Responsible for social media content creation, scheduling,
 * and engagement optimization across platforms.
 */

import { generateText, generateObject } from "ai"
import { z } from "zod"

// Social post generation schema
const SocialPostSchema = z.object({
  platform: z.enum(["twitter", "linkedin", "facebook", "instagram"]),
  content: z.string(),
  hashtags: z.array(z.string()),
  mediaPrompt: z.string().optional(),
  bestPostingTime: z.string(),
  engagementPrediction: z.number().min(0).max(100),
})

// Platform-specific constraints
const PLATFORM_LIMITS = {
  twitter: { maxChars: 280, maxHashtags: 5 },
  linkedin: { maxChars: 3000, maxHashtags: 5 },
  facebook: { maxChars: 63206, maxHashtags: 10 },
  instagram: { maxChars: 2200, maxHashtags: 30 },
}

export interface SocialAgentInput {
  topic: string
  platform: "twitter" | "linkedin" | "facebook" | "instagram"
  tone?: string
  targetAudience?: string
  productContext?: {
    name: string
    description: string
    keywords: string[]
  }
  existingContent?: string // To repurpose
}

export interface SocialAgentOutput {
  posts: Array<{
    platform: string
    content: string
    hashtags: string[]
    scheduledTime: string
    mediaPrompt?: string
  }>
  strategy: string
  estimatedReach: number
}

export class SocialMediaAgent {
  private systemPrompt: string

  constructor() {
    this.systemPrompt = `You are an expert social media marketing specialist.
Your role is to create engaging, platform-optimized social media content.

Guidelines:
- Understand platform-specific best practices and constraints
- Create content that drives engagement (likes, comments, shares)
- Use appropriate hashtags and mentions
- Consider optimal posting times for the target audience
- Maintain brand voice while being platform-appropriate
- For Twitter: Be concise, use threads for longer content
- For LinkedIn: Be professional, thought-leadership focused
- For Facebook: Encourage conversation, use calls-to-action
- For Instagram: Focus on visual descriptions, use relevant hashtags`
  }

  async generatePost(input: SocialAgentInput): Promise<SocialAgentOutput> {
    const limits = PLATFORM_LIMITS[input.platform]

    const { object } = await generateObject({
      model: "openai/gpt-4o",
      schema: SocialPostSchema,
      system: this.systemPrompt,
      prompt: `Create a ${input.platform} post about: ${input.topic}
      
Platform constraints:
- Maximum characters: ${limits.maxChars}
- Maximum hashtags: ${limits.maxHashtags}

${input.tone ? `Tone: ${input.tone}` : ""}
${input.targetAudience ? `Target audience: ${input.targetAudience}` : ""}
${input.productContext ? `Product: ${input.productContext.name} - ${input.productContext.description}` : ""}
${input.existingContent ? `Repurpose this content: ${input.existingContent}` : ""}

Generate an engaging post optimized for ${input.platform}.`,
    })

    return {
      posts: [
        {
          platform: object.platform,
          content: object.content,
          hashtags: object.hashtags,
          scheduledTime: object.bestPostingTime,
          mediaPrompt: object.mediaPrompt,
        },
      ],
      strategy: `Optimized for ${input.platform} engagement with ${object.engagementPrediction}% predicted engagement rate`,
      estimatedReach: Math.floor(object.engagementPrediction * 100),
    }
  }

  async generateCrossPost(input: Omit<SocialAgentInput, "platform">): Promise<SocialAgentOutput> {
    const platforms = ["twitter", "linkedin", "facebook", "instagram"] as const
    const posts: SocialAgentOutput["posts"] = []

    for (const platform of platforms) {
      const result = await this.generatePost({ ...input, platform })
      posts.push(...result.posts)
    }

    return {
      posts,
      strategy: "Cross-platform content strategy with platform-specific optimizations",
      estimatedReach: posts.length * 1000,
    }
  }

  async analyzeEngagement(
    posts: Array<{ content: string; likes: number; comments: number; shares: number }>,
  ): Promise<{ insights: string[]; recommendations: string[] }> {
    const { text } = await generateText({
      model: "openai/gpt-4o",
      system: this.systemPrompt,
      prompt: `Analyze these social media posts and their engagement:

${posts
  .map(
    (p, i) => `Post ${i + 1}: "${p.content}"
Likes: ${p.likes}, Comments: ${p.comments}, Shares: ${p.shares}`,
  )
  .join("\n\n")}

Provide:
1. Key insights about what's working
2. Recommendations for improvement`,
    })

    const lines = text.split("\n").filter((l) => l.trim())
    const insightStart = lines.findIndex((l) => l.includes("insight"))
    const recStart = lines.findIndex((l) => l.includes("recommendation"))

    return {
      insights: lines.slice(insightStart + 1, recStart).filter((l) => l.startsWith("-")),
      recommendations: lines.slice(recStart + 1).filter((l) => l.startsWith("-")),
    }
  }
}

export const socialAgent = new SocialMediaAgent()
