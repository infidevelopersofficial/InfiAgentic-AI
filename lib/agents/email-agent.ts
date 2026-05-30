/**
 * Email Marketing Agent
 *
 * Responsible for email content creation, campaign optimization,
 * personalization, and A/B testing recommendations.
 */

import { generateText, generateObject } from "ai"
import { z } from "zod"

// Email generation schema
const EmailContentSchema = z.object({
  subject: z.string(),
  preheader: z.string(),
  headline: z.string(),
  body: z.string(),
  callToAction: z.string(),
  ctaUrl: z.string().optional(),
  personalizationTokens: z.array(z.string()),
})

// A/B test variant schema
const ABTestVariantSchema = z.object({
  variantName: z.string(),
  subject: z.string(),
  hypothesis: z.string(),
  expectedImpact: z.number().min(0).max(100),
})

export interface EmailAgentInput {
  campaignType: "promotional" | "newsletter" | "transactional" | "drip" | "winback"
  topic: string
  productContext?: {
    name: string
    description: string
    price?: string
    features?: string[]
  }
  targetAudience?: string
  tone?: "formal" | "casual" | "urgent" | "friendly"
  includeDiscount?: {
    type: "percentage" | "fixed"
    value: number
    code?: string
  }
}

export interface EmailAgentOutput {
  email: {
    subject: string
    preheader: string
    headline: string
    body: string
    callToAction: string
    ctaUrl?: string
  }
  abTestVariants?: Array<{
    variantName: string
    subject: string
    hypothesis: string
  }>
  personalizationSuggestions: string[]
  sendTimeRecommendation: string
}

export class EmailMarketingAgent {
  private systemPrompt: string

  constructor() {
    this.systemPrompt = `You are an expert email marketing specialist with deep knowledge of:
- Email copywriting best practices
- Subject line optimization for open rates
- CTA optimization for click-through rates
- Personalization strategies
- Email deliverability and spam avoidance
- A/B testing methodologies

Guidelines:
- Write compelling subject lines under 50 characters
- Create preheaders that complement (not repeat) subject lines
- Use personalization tokens like {{first_name}}, {{company}}
- Structure emails with clear hierarchy and scannable content
- Include a single, clear call-to-action
- Avoid spam trigger words
- Optimize for mobile reading (short paragraphs)
- Create urgency without being pushy`
  }

  async generateEmail(input: EmailAgentInput): Promise<EmailAgentOutput> {
    const { object: email } = await generateObject({
      model: "openai/gpt-4o",
      schema: EmailContentSchema,
      system: this.systemPrompt,
      prompt: `Create a ${input.campaignType} email about: ${input.topic}

${
  input.productContext
    ? `Product: ${input.productContext.name}
Description: ${input.productContext.description}
${input.productContext.price ? `Price: ${input.productContext.price}` : ""}
${input.productContext.features ? `Features: ${input.productContext.features.join(", ")}` : ""}`
    : ""
}

${input.targetAudience ? `Target audience: ${input.targetAudience}` : ""}
${input.tone ? `Tone: ${input.tone}` : ""}
${input.includeDiscount ? `Include discount: ${input.includeDiscount.value}${input.includeDiscount.type === "percentage" ? "%" : " off"}${input.includeDiscount.code ? ` (code: ${input.includeDiscount.code})` : ""}` : ""}

Generate a high-converting email with:
1. Compelling subject line
2. Engaging preheader
3. Clear headline
4. Persuasive body copy
5. Strong call-to-action`,
    })

    // Generate A/B test variants
    const { object: variants } = await generateObject({
      model: "openai/gpt-4o",
      schema: z.object({ variants: z.array(ABTestVariantSchema) }),
      system: this.systemPrompt,
      prompt: `Generate 2 A/B test subject line variants for this email:
Subject: "${email.subject}"
Campaign type: ${input.campaignType}

Create variants that test different psychological triggers (urgency, curiosity, benefit-focused, etc.)`,
    })

    // Determine optimal send time
    const sendTimeRecommendation = this.getSendTimeRecommendation(input.campaignType, input.targetAudience)

    return {
      email: {
        subject: email.subject,
        preheader: email.preheader,
        headline: email.headline,
        body: email.body,
        callToAction: email.callToAction,
        ctaUrl: email.ctaUrl,
      },
      abTestVariants: variants.variants.map((v) => ({
        variantName: v.variantName,
        subject: v.subject,
        hypothesis: v.hypothesis,
      })),
      personalizationSuggestions: email.personalizationTokens,
      sendTimeRecommendation,
    }
  }

  async generateDripSequence(
    input: EmailAgentInput & { sequenceLength: number; daysBetweenEmails: number },
  ): Promise<EmailAgentOutput[]> {
    const emails: EmailAgentOutput[] = []

    for (let i = 0; i < input.sequenceLength; i++) {
      const emailNumber = i + 1
      const modifiedInput: EmailAgentInput = {
        ...input,
        topic: `${input.topic} - Email ${emailNumber} of ${input.sequenceLength} drip sequence`,
      }

      const email = await this.generateEmail(modifiedInput)
      emails.push(email)
    }

    return emails
  }

  async analyzeEmailPerformance(
    emails: Array<{
      subject: string
      openRate: number
      clickRate: number
      unsubscribeRate: number
    }>,
  ): Promise<{ insights: string[]; recommendations: string[] }> {
    const { text } = await generateText({
      model: "openai/gpt-4o",
      system: this.systemPrompt,
      prompt: `Analyze these email campaign results:

${emails
  .map(
    (e, i) => `Email ${i + 1}: "${e.subject}"
Open Rate: ${e.openRate}%, Click Rate: ${e.clickRate}%, Unsubscribe Rate: ${e.unsubscribeRate}%`,
  )
  .join("\n\n")}

Provide:
1. Key insights about performance patterns
2. Specific recommendations for improvement`,
    })

    const lines = text.split("\n").filter((l) => l.trim())
    const insightStart = lines.findIndex((l) => l.toLowerCase().includes("insight"))
    const recStart = lines.findIndex((l) => l.toLowerCase().includes("recommendation"))

    return {
      insights: lines
        .slice(insightStart + 1, recStart > insightStart ? recStart : undefined)
        .filter((l) => l.startsWith("-") || l.match(/^\d+\./)),
      recommendations: lines.slice(recStart + 1).filter((l) => l.startsWith("-") || l.match(/^\d+\./)),
    }
  }

  private getSendTimeRecommendation(campaignType: string, audience?: string): string {
    const recommendations: Record<string, string> = {
      promotional: "Tuesday or Thursday, 10:00 AM - 11:00 AM local time",
      newsletter: "Tuesday, 9:00 AM - 10:00 AM local time",
      transactional: "Immediately upon trigger event",
      drip: "Varies by sequence position - typically morning hours",
      winback: "Wednesday, 2:00 PM - 3:00 PM local time",
    }

    return recommendations[campaignType] || "Tuesday or Thursday, 10:00 AM local time"
  }
}

export const emailAgent = new EmailMarketingAgent()
