const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const reportSchema = {
    type: SchemaType.OBJECT,
    properties: {
      theme_mode: { type: SchemaType.STRING, description: "THEME_SUCCESS_GLOW, THEME_ALERT_DARK, ou THEME_NEUTRAL_GLASS" },
      ui_blueprint: {
        type: SchemaType.OBJECT,
        properties: {
          slides: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                component_type: { type: SchemaType.STRING, description: "HeroHighlight, TimelineCrisis, ou StandardGrid" },
                title: { type: SchemaType.STRING },
                properties: { 
                  type: SchemaType.OBJECT, 
                  description: "Dados estruturados do bloco",
                  properties: {
                    metric: { type: SchemaType.STRING },
                    label: { type: SchemaType.STRING },
                    delta: { type: SchemaType.STRING },
                    narrative: { type: SchemaType.STRING },
                    severity: { type: SchemaType.STRING },
                    steps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    recommendation: { type: SchemaType.STRING },
                    kpis: { 
                      type: SchemaType.ARRAY, 
                      items: { 
                        type: SchemaType.OBJECT, 
                        properties: {
                          title: { type: SchemaType.STRING },
                          value: { type: SchemaType.STRING },
                          trend: { type: SchemaType.STRING }
                        }
                      }
                    }
                  }
                }
              },
              required: ["component_type", "title", "properties"]
            }
          }
        },
        required: ["slides"]
      }
    },
    required: ["theme_mode", "ui_blueprint"]
  };

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: reportSchema,
    },
  });

  try {
    const result = await model.generateContent("Teste simples. 10 seguidores");
    console.log(result.response.text());
  } catch (e) {
    console.error("ERRO:", e);
  }
}

run();
