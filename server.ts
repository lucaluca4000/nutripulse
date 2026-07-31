import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '20mb' }));

// CORS & Headers for external crawlers (PWABuilder, Google Play, etc.)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Direct APK Download Endpoint
app.get('/api/download-apk', (_req, res) => {
  const apkPath = path.join(process.cwd(), 'public', 'downloads', 'NutriPulse-AI-v1.0.apk');
  if (fs.existsSync(apkPath)) {
    return res.download(apkPath, 'NutriPulse-AI-v1.0.apk', (err) => {
      if (err && !res.headersSent) {
        console.error('Error serving APK download:', err);
        res.status(500).send('Erreur lors du téléchargement');
      }
    });
  }
  return res.status(404).json({ error: 'Fichier APK non disponible' });
});

// Serve public directory explicitly (manifest.json, icons, sw.js)
app.use(express.static(path.join(process.cwd(), 'public'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'text/javascript');
    } else if (filePath.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="NutriPulse-AI-v1.0.apk"');
    }
  }
}));

// Serve Digital Asset Links for native Android TWA / WebAPK integration
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(process.cwd(), 'public', '.well-known', 'assetlinks.json'));
});

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY process env is missing! AI features will use fallback or error.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Health Endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. AI Meal Photo Analysis Endpoint
app.post('/api/nutrition/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userHint, targetLanguage = 'fr' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Une image est requise' });
    }

    // Clean base64 if data URI prefix included
    const cleanedBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const ai = getGenAI();

    const promptText = `Tu es un nutritionniste et ingénieur de précision alimentaire d'élite. Analyse visuellement cette photo de repas avec une extrême précision diététique${
      userHint ? ` (Précisions fournies par l'utilisateur: "${userHint}")` : ''
    }. 
Directives de haute précision :
1. Décompose minutieusement l'assiette ingrédient par ingrédient (ex: féculents, légumes, viande/poisson, sauces, huiles de cuisson visibles ou supposées).
2. Estime le poids réel de chaque ingrédient en grammes à partir du volume et de la taille de l'assiette.
3. Calcule rigoureusement le total calorique et la ventilation exacte des macronutriments (Protéines, Glucides, Lipides, Fibres, Sucres, Sodium) en utilisant les tables nutritionnelles officielles (CIQUAL/USDA).
4. Évalue la confiance globale (0 à 100%) et attribue un Nutri-Score précis (A, B, C, D, E).
5. Fournis toute l'analyse détaillée et les textes (dishName, description, servingSize, healthAdvice, ingredient names) dans la langue cible: ${targetLanguage}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanedBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: `Tu es un assistant nutritionnel ultra-précis et scientifique. Réponds en JSON structuré dans la langue suivante: ${targetLanguage}.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishName: { type: Type.STRING, description: 'Nom du plat en français' },
            description: { type: Type.STRING, description: 'Brève description des éléments observés' },
            servingSize: { type: Type.STRING, description: 'Portion estimée (ex: 1 assiette moyenne, 300g)' },
            estimatedWeightGrams: { type: Type.NUMBER, description: 'Poids total estimé en g' },
            calories: { type: Type.NUMBER, description: 'Calories totales en kcal' },
            protein: { type: Type.NUMBER, description: 'Protéines totales en grammes' },
            carbs: { type: Type.NUMBER, description: 'Glucides totaux en grammes' },
            fat: { type: Type.NUMBER, description: 'Lipides totaux en grammes' },
            fiber: { type: Type.NUMBER, description: 'Fibres alimentaires en g' },
            sugar: { type: Type.NUMBER, description: 'Sucres simples en g' },
            sodiumMg: { type: Type.NUMBER, description: 'Sodium en mg' },
            nutriScore: { type: Type.STRING, description: 'Lettre Nutri-Score estimée: A, B, C, D ou E' },
            confidenceScore: { type: Type.NUMBER, description: 'Indice de confiance de 0 à 100' },
            healthAdvice: { type: Type.STRING, description: 'Conseil diététique personnalisé' },
            itemsBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Nom de l’ingrédient' },
                  portion: { type: Type.STRING, description: 'Portion estimée (ex: 150g)' },
                  calories: { type: Type.NUMBER, description: 'Calories de cet ingrédient' },
                  protein: { type: Type.NUMBER, description: 'Protéines (g)' },
                  carbs: { type: Type.NUMBER, description: 'Glucides (g)' },
                  fat: { type: Type.NUMBER, description: 'Lipides (g)' },
                },
                required: ['name', 'portion', 'calories', 'protein', 'carbs', 'fat'],
              },
            },
          },
          required: ['dishName', 'calories', 'protein', 'carbs', 'fat', 'nutriScore', 'healthAdvice', 'itemsBreakdown'],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Pas de réponse de l'IA Gemini");
    }

    const jsonResult = JSON.parse(resultText);
    res.json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de l’analyse visuelle par l’IA',
    });
  }
});

// 3. AI Meal Text Analysis Endpoint
app.post('/api/nutrition/analyze-text', async (req, res) => {
  try {
    const { text, targetLanguage = 'fr' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'La description du repas est requise' });
    }

    const ai = getGenAI();

    const promptText = `L'utilisateur décrit ce qu'il a mangé: "${text}".
Analyse cette description pour estimer précisément le contenu nutritionnel total et la liste des aliments.
Fournis le résultat au format JSON structuré avec le nom du repas, la portion, les calories (kcal), protéines (g), glucides (g), lipides (g), fibres (g), sucres (g), sodium (mg), Nutri-Score estimé (A-E), et un conseil nutritionnel.
TOUS les champs textuels (dishName, description, servingSize, healthAdvice, names des items) doivent être écrits dans la langue suivante: ${targetLanguage}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction: `Tu es un nutritionniste expert. Réponds en JSON structuré dans la langue suivante: ${targetLanguage}.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishName: { type: Type.STRING, description: 'Nom synthétique du repas' },
            description: { type: Type.STRING, description: 'Résumé des aliments indiqués' },
            servingSize: { type: Type.STRING, description: 'Portion globale estimée' },
            estimatedWeightGrams: { type: Type.NUMBER, description: 'Poids approximatif en g' },
            calories: { type: Type.NUMBER, description: 'Calories totales en kcal' },
            protein: { type: Type.NUMBER, description: 'Protéines totales (g)' },
            carbs: { type: Type.NUMBER, description: 'Glucides totaux (g)' },
            fat: { type: Type.NUMBER, description: 'Lipides totaux (g)' },
            fiber: { type: Type.NUMBER, description: 'Fibres (g)' },
            sugar: { type: Type.NUMBER, description: 'Sucres (g)' },
            sodiumMg: { type: Type.NUMBER, description: 'Sodium (mg)' },
            nutriScore: { type: Type.STRING, description: 'Nutri-Score estimé: A, B, C, D ou E' },
            confidenceScore: { type: Type.NUMBER, description: 'Confiance 0 à 100' },
            healthAdvice: { type: Type.STRING, description: 'Remarque nutritionnelle' },
            itemsBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  portion: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                },
                required: ['name', 'portion', 'calories', 'protein', 'carbs', 'fat'],
              },
            },
          },
          required: ['dishName', 'calories', 'protein', 'carbs', 'fat', 'nutriScore', 'healthAdvice', 'itemsBreakdown'],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Pas de réponse de l'IA Gemini");
    }

    const jsonResult = JSON.parse(resultText);
    res.json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error('Error analyzing text:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de l’analyse par l’IA' });
  }
});

// 3.5 AI Personalized Food & Meal Recommendations Endpoint
app.post('/api/nutrition/recommendations', async (req, res) => {
  try {
    const {
      mealType = 'any',
      remainingCalories = 500,
      remainingProtein = 30,
      remainingCarbs = 50,
      remainingFat = 20,
      goal = 'maintain',
      dietaryPreference = 'all',
      customHint = '',
      targetLanguage = 'fr',
    } = req.body;

    const ai = getGenAI();

    const promptText = `Tu es un nutritionniste et chef cuisinier d'élite.
L'utilisateur recherche des recommandations de repas/collations adaptées à ses objectifs du jour.

Profil et besoins actuels de l'utilisateur:
- Type de repas souhaité: ${mealType === 'any' ? 'N’importe quel repas ou collation' : mealType}
- Objectif de santé: ${goal} (ex: perte de poids, prise de muscle, maintien)
- Calories restantes disponibles aujourd'hui: ${Math.max(50, Math.round(remainingCalories))} kcal
- Protéines restantes à consommer: ${Math.max(0, Math.round(remainingProtein))} g
- Glucides restants: ${Math.max(0, Math.round(remainingCarbs))} g
- Lipides restants: ${Math.max(0, Math.round(remainingFat))} g
- Préférence/Contrainte alimentaire: ${dietaryPreference}
${customHint ? `- Remarque/Envie spécifique de l'utilisateur: "${customHint}"` : ''}

Propose 3 idées de repas ou collations variées, délicieuses, réalistes et faciles à préparer.
Chaque option doit combler judicieusement le solde calorique et macronutritionnel restants.

Fournis toutes les réponses et descriptions dans la langue suivante: ${targetLanguage}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction: `Tu es un expert nutritionniste d’élite. Donne des recommandations hyper précises et appétissantes au format JSON dans la langue suivante: ${targetLanguage}.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'Identifiant unique court' },
                  title: { type: Type.STRING, description: 'Titre appétissant du repas' },
                  mealType: { type: Type.STRING, description: 'breakfast, lunch, dinner ou snack' },
                  prepTimeMinutes: { type: Type.NUMBER, description: 'Temps de préparation estimé en min' },
                  calories: { type: Type.NUMBER, description: 'Calories totales en kcal' },
                  protein: { type: Type.NUMBER, description: 'Protéines en g' },
                  carbs: { type: Type.NUMBER, description: 'Glucides en g' },
                  fat: { type: Type.NUMBER, description: 'Lipides en g' },
                  fiber: { type: Type.NUMBER, description: 'Fibres en g' },
                  nutriScore: { type: Type.STRING, description: 'A, B ou C' },
                  whyItFits: { type: Type.STRING, description: 'Explique pourquoi cette option correspond exactement au besoin en prot/cal de l’utilisateur' },
                  description: { type: Type.STRING, description: 'Description rapide du plat' },
                  recipeSummary: { type: Type.STRING, description: 'Étapes ultra-courtes de préparation' },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        portion: { type: Type.STRING },
                        calories: { type: Type.NUMBER },
                        protein: { type: Type.NUMBER },
                        carbs: { type: Type.NUMBER },
                        fat: { type: Type.NUMBER },
                      },
                      required: ['name', 'portion', 'calories', 'protein', 'carbs', 'fat'],
                    },
                  },
                },
                required: [
                  'id',
                  'title',
                  'mealType',
                  'prepTimeMinutes',
                  'calories',
                  'protein',
                  'carbs',
                  'fat',
                  'fiber',
                  'nutriScore',
                  'whyItFits',
                  'description',
                  'ingredients',
                ],
              },
            },
          },
          required: ['recommendations'],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Pas de réponse de l'IA pour les recommandations");
    }

    const jsonResult = JSON.parse(resultText);
    res.json({ success: true, data: jsonResult.recommendations });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la génération des recommandations IA' });
  }
});

// 4. Barcode Lookup Endpoint (OpenFoodFacts API + Gemini Fallback)
app.get('/api/nutrition/barcode/:barcode', async (req, res) => {
  const barcode = req.params.barcode?.trim();
  if (!barcode) {
    return res.status(400).json({ error: 'Code-barres manquant' });
  }

  try {
    // Attempt OpenFoodFacts query
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    const offResponse = await fetch(offUrl, {
      headers: {
        'User-Agent': 'NutriPulseCalorieTracker - WebApp - Version 1.0',
      },
    });

    if (offResponse.ok) {
      const offData = await offResponse.json();
      if (offData.status === 1 && offData.product) {
        const prod = offData.product;
        const nutriments = prod.nutriments || {};

        const calories = Math.round(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 0);
        const protein = Math.round((nutriments.proteins_100g ?? 0) * 10) / 10;
        const carbs = Math.round((nutriments.carbohydrates_100g ?? 0) * 10) / 10;
        const fat = Math.round((nutriments.fat_100g ?? 0) * 10) / 10;
        const fiber = Math.round((nutriments.fiber_100g ?? 0) * 10) / 10;
        const sugar = Math.round((nutriments.sugars_100g ?? 0) * 10) / 10;
        const sodiumMg = Math.round((nutriments.sodium_100g ?? 0) * 1000);

        const nutriScoreGrade = (prod.nutriscore_grade || 'C').toUpperCase();

        return res.json({
          success: true,
          foundInDatabase: true,
          product: {
            code: barcode,
            name: prod.product_name_fr || prod.product_name || `Produit #${barcode}`,
            brand: prod.brands || 'Marque inconnue',
            imageUrl: prod.image_small_url || prod.image_url || '',
            nutriScore: ['A', 'B', 'C', 'D', 'E'].includes(nutriScoreGrade) ? nutriScoreGrade : 'C',
            per100g: {
              calories,
              protein,
              carbs,
              fat,
              fiber,
              sugar,
              sodiumMg,
            },
            servingSize: prod.serving_size || '100g',
            servingWeightGrams: prod.serving_quantity || 100,
            ingredients: prod.ingredients_text ? prod.ingredients_text.split(',').slice(0, 8).map((s: string) => s.trim()) : [],
          },
        });
      }
    }

    // Fallback to Gemini if OpenFoodFacts misses
    const ai = getGenAI();
    const promptText = `Recherche ou estime la valeur nutritionnelle exacte pour 100g du produit ayant le code-barres ou EAN: "${barcode}".
Si tu ne connais pas le code exact, déduis quel type d'aliment de consommation courante cela pourrait être et donne des valeurs représentatives pour 100g.
Formate en JSON avec: productName, brand, calories (kcal pour 100g), protein (g), carbs (g), fat (g), fiber (g), sugar (g), nutriScore (A, B, C, D, E), et servingSize.`;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            brand: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            fiber: { type: Type.NUMBER },
            sugar: { type: Type.NUMBER },
            nutriScore: { type: Type.STRING },
            servingSize: { type: Type.STRING },
          },
          required: ['productName', 'calories', 'protein', 'carbs', 'fat', 'nutriScore'],
        },
      },
    });

    if (aiRes.text) {
      const parsed = JSON.parse(aiRes.text);
      return res.json({
        success: true,
        foundInDatabase: false,
        aiEstimated: true,
        product: {
          code: barcode,
          name: parsed.productName || `Produit ${barcode}`,
          brand: parsed.brand || 'Produit identifié par IA',
          imageUrl: '',
          nutriScore: parsed.nutriScore || 'C',
          per100g: {
            calories: parsed.calories || 0,
            protein: parsed.protein || 0,
            carbs: parsed.carbs || 0,
            fat: parsed.fat || 0,
            fiber: parsed.fiber || 0,
            sugar: parsed.sugar || 0,
            sodiumMg: 0,
          },
          servingSize: parsed.servingSize || '100g',
          servingWeightGrams: 100,
          ingredients: [],
        },
      });
    }

    return res.status(404).json({ error: 'Produit non trouvé' });
  } catch (error: any) {
    console.error('Error fetching barcode:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche du code-barres' });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
