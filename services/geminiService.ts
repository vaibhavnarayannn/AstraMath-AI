
import { GoogleGenAI, Type } from "@google/genai";
import { SolverMode, MathResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (mode: SolverMode, precision: number) => `
You are AstraMath AI, the world's most friendly and clear expert mathematics tutor.
Current Mode: ${mode}.
Decimal Precision Goal: ${precision} decimal places (rounding).

Your task is to solve the user's input problem and provide a JSON response.

CRITICAL INSTRUCTION FOR STEPS:
- You MUST write the steps in simple, plain, and easy-to-understand language.
- Act like a patient teacher explaining to a student who finds math difficult.
- Avoid dry, overly academic jargon where possible.
- Explain the "WHY" and "HOW" of each step clearly.
- Instead of just saying "Differentiate", say "Now, we find the derivative to check the slope..."
- Break complex logic into smaller, digestible sentences.

CRITICAL OUTPUT REQUIREMENTS:
1. "exactResult": You MUST provide the mathematically exact form.
   - Example: \\frac{\\sqrt{5}}{2}, 2\\pi, \\ln(5).
   - Use standard LaTeX notation.
   - If the result is a simple integer, strictly repeat it (e.g., "5").

2. "decimalResult": You MUST provide the numeric approximate value.
   - Example: 1.1180, 6.2831, 1.6094.
   - Round strictly to ${precision} decimal places.

3. "latex": The final answer formatted in LaTeX for display (e.g., "x = \\frac{-b \\pm \\sqrt{D}}{2a}").

4. "standardForm": IF this is an equation solver task (Quadratic, Cubic, Linear System, etc.), strictly provide the standard form of the equation.
   - Example: "2x^2 - 5x + 3 = 0" or "x + y = 10".
   - Use LaTeX format.
   - If not applicable (e.g. arithmetic, expression simplification), return null or empty string.

5. "steps": An array of easy-to-understand, conversational steps.
   - Use LaTeX (wrapped in $) for math expressions within the text.
   - Example: "First, to simplify this, we need to move all $x$ terms to one side."

6. "graphData":
   - If the problem involves a function y=f(x), quadratic, cubic, linear, or calculus curve, generate an array of 40-60 points ({x, y}).
   - Range: usually -10 to 10 unless the function features (roots/intersections) are outside this.
   - If not applicable (e.g., matrix, number theory), return empty array.

7. "explanation": A helpful, teacher-like summary of the concept and strategy used.

If the user provides an image:
- It might be a handwritten equation, a textbook photo, or a shape.
- Transcribe it, solve it, and strictly follow the format.

JSON RESPONSE ONLY.
`;

export const solveMathProblem = async (
  query: string,
  mode: SolverMode,
  precision: number,
  imageBase64?: string
): Promise<MathResponse> => {
  try {
    // gemini-2.5-flash is excellent for both text and vision/multimodal tasks
    const modelId = 'gemini-2.5-flash';
    
    const parts: any[] = [];
    
    if (imageBase64) {
      // Clean base64 string if it contains data URI prefix
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Assuming png for canvas, or general compat
          data: cleanBase64
        }
      });
      parts.push({ text: `Analyze this math problem image. Solve it. Context: ${query || "Solve the equation in the image."}` });
    } else {
      parts.push({ text: query });
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: getSystemInstruction(mode, precision),
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            latex: { type: Type.STRING, description: "Final display answer in LaTeX" },
            exactResult: { type: Type.STRING, description: "Exact mathematical value" },
            decimalResult: { type: Type.STRING, description: "Approximated decimal value" },
            standardForm: { type: Type.STRING, description: "The equation in standard form (ax^2+bx+c=0)" },
            steps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Step by step solution strings"
            },
            explanation: { type: Type.STRING, description: "Teacher explanation" },
            graphLabel: { type: Type.STRING, description: "Label for the graph" },
            graphData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER }
                }
              }
            },
            relatedConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["latex", "exactResult", "decimalResult", "steps", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as MathResponse;

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      latex: "\\text{Error}",
      exactResult: "Error",
      decimalResult: "Error",
      steps: ["An error occurred while processing your request.", "Please ensure your input is clear."],
      explanation: "We couldn't solve this problem. Please try again.",
      relatedConcepts: []
    };
  }
};