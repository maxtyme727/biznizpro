
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Business, AnalysisReport, ImageSize, AspectRatio } from "../types";

export class GeminiService {
  private getAi() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async findBusinesses(industry: string, location: string, latLng?: { latitude: number, longitude: number }): Promise<{ businesses: Business[], rawResponse: string }> {
    const ai = this.getAi();
    const prompt = `Find 3 to 5 real businesses in the "${industry}" industry located in "${location}" that currently have poor reviews (ratings generally below 3.8 stars). 
    Use Google Maps grounding to ensure the locations are real and ratings are up to date.
    For each business, include:
    1. Business Name
    2. Current rating
    3. Top 3 specific common complaints.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: latLng ? {
          retrievalConfig: { latLng }
        } : undefined
      },
    });

    const text = response.text || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
      if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
      if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
      return { title: 'Source', uri: '#' };
    }) || [];

    const extractionResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract businesses from this text: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businesses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  location: { type: Type.STRING },
                  rating: { type: Type.NUMBER },
                  complaints: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "location", "rating", "complaints"]
              }
            }
          }
        }
      }
    });

    const rawJson = JSON.parse(extractionResponse.text || '{"businesses":[]}');
    return { 
      businesses: rawJson.businesses.map((b: any, i: number) => ({ ...b, id: `biz-${i}`, sources })), 
      rawResponse: text 
    };
  }

  async analyzeBusiness(business: Business): Promise<AnalysisReport> {
    const ai = this.getAi();
    const prompt = `Analyze "${business.name}" in "${business.location}". They have a rating of ${business.rating}/5. Issues: ${business.complaints.join(', ')}.
    Use Google Search to verify recent negative review themes and top 3 direct competitors.
    Provide a deep strategic turnaround plan including concrete recommendations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recurringThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
            competitorAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            painPoints: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { area: { type: Type.STRING }, description: { type: Type.STRING }, severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] } } } },
            improvementSteps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.STRING }, impact: { type: Type.STRING }, timeline: { type: Type.STRING } } } },
            customerSentiment: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, score: { type: Type.NUMBER } } } },
            competitorBenchmark: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async generateVisualReport(businessName: string, themes: string[], size: ImageSize): Promise<string> {
    const ai = this.getAi();
    const prompt = `A professional photorealistic rendering of a modern, clean, and highly successful business storefront for "${businessName}". The image should showcase high-quality customer service, a welcoming atmosphere, and premium quality, representing the successful turnaround of the business based on these improvements: ${themes.join(', ')}. Cinematic lighting, 8k resolution, architectural photography style.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "16:9", imageSize: size }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated");
  }

  async generateExplanationVideo(businessName: string, summary: string, ratio: AspectRatio): Promise<string> {
    const ai = this.getAi();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A high-quality business consultation presentation about "${businessName}". Showing clean modern office interiors, satisfied customers, and data charts on screens. Professional corporate documentary style. The video represents: ${summary}`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: ratio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}
