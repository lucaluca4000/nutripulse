export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories100g: number;
  p100g: number; // protein
  c100g: number; // carbs
  f100g: number; // fat
  fib100g: number; // fiber
  sug100g?: number; // sugar
  sod100g?: number; // sodium mg
  nutriScore: 'A' | 'B' | 'C' | 'D' | 'E';
  defaultServingGrams: number;
  servingUnitName: string;
  unit?: 'g' | 'ml';
}

export const FOOD_CATEGORIES = [
  'Tous',
  'Viandes & Volailles',
  'Poissons & Mer',
  'Œufs & Produits Laitiers',
  'Fromages',
  'Féculents & Céréales',
  'Légumineuses',
  'Fruits',
  'Légumes',
  'Oléagineux & Huiles',
  'Plats Cuisinés & Fast-Food',
  'Boissons & Protéines',
  'Snacks & Desserts',
  'Sauces & Condiments',
] as const;

export function isLiquidFood(name: string, category?: string): boolean {
  if (category === 'Boissons & Protéines') return true;
  const n = name.toLowerCase();
  const liquidKeywords = [
    'lait', 'jus', 'eau', 'soda', 'coca', 'café', 'thé', 'boisson', 'shaker',
    'smoothie', 'soupe', 'velouté', 'bouillon', 'huile', 'sirop', 'bière', 'vin',
    'cidre', 'kombucha', 'gazeuse', 'tisane', 'gazouse'
  ];
  return liquidKeywords.some(kw => n.includes(kw));
}

export const FOOD_DATABASE: FoodItem[] = [
  // --- VIANDES & VOLAILLES ---
  { id: 'v1', name: 'Filet de poulet grillé', category: 'Viandes & Volailles', calories100g: 165, p100g: 31, c100g: 0, f100g: 3.6, fib100g: 0, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 filet' },
  { id: 'v2', name: 'Cuisse de poulet rôtie (sans peau)', category: 'Viandes & Volailles', calories100g: 180, p100g: 25, c100g: 0, f100g: 8.5, fib100g: 0, nutriScore: 'A', defaultServingGrams: 180, servingUnitName: '1 cuisse' },
  { id: 'v3', name: 'Steak haché 5% MG', category: 'Viandes & Volailles', calories100g: 125, p100g: 21, c100g: 0, f100g: 4.5, fib100g: 0, nutriScore: 'A', defaultServingGrams: 125, servingUnitName: '1 steak' },
  { id: 'v4', name: 'Steak haché 15% MG', category: 'Viandes & Volailles', calories100g: 215, p100g: 19, c100g: 0, f100g: 15, fib100g: 0, nutriScore: 'B', defaultServingGrams: 125, servingUnitName: '1 steak' },
  { id: 'v5', name: 'Escalope de dinde', category: 'Viandes & Volailles', calories100g: 135, p100g: 29, c100g: 0, f100g: 1.8, fib100g: 0, nutriScore: 'A', defaultServingGrams: 140, servingUnitName: '1 escalope' },
  { id: 'v6', name: 'Escalope de veau', category: 'Viandes & Volailles', calories100g: 110, p100g: 22, c100g: 0, f100g: 2.2, fib100g: 0, nutriScore: 'A', defaultServingGrams: 130, servingUnitName: '1 escalope' },
  { id: 'v7', name: 'Rôti de bœuf cuit', category: 'Viandes & Volailles', calories100g: 155, p100g: 28, c100g: 0, f100g: 4.8, fib100g: 0, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '2 tranches' },
  { id: 'v8', name: 'Filet mignon de porc', category: 'Viandes & Volailles', calories100g: 140, p100g: 26, c100g: 0, f100g: 3.8, fib100g: 0, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 morceau' },
  { id: 'v9', name: 'Côte de porc grillée', category: 'Viandes & Volailles', calories100g: 220, p100g: 24, c100g: 0, f100g: 13.5, fib100g: 0, nutriScore: 'B', defaultServingGrams: 160, servingUnitName: '1 côte' },
  { id: 'v10', name: 'Magret de canard (sans peau)', category: 'Viandes & Volailles', calories100g: 190, p100g: 24, c100g: 0, f100g: 10.2, fib100g: 0, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1/2 magret' },
  { id: 'v11', name: 'Jambon blanc cuit supérieur', category: 'Viandes & Volailles', calories100g: 115, p100g: 21, c100g: 0.8, f100g: 3.2, fib100g: 0, nutriScore: 'A', defaultServingGrams: 40, servingUnitName: '1 tranche' },
  { id: 'v12', name: 'Jambon cru de Bayonne / Serrano', category: 'Viandes & Volailles', calories100g: 235, p100g: 27, c100g: 0.5, f100g: 14, fib100g: 0, nutriScore: 'D', defaultServingGrams: 35, servingUnitName: '1 tranche' },
  { id: 'v13', name: 'Merguez de bœuf/agneau', category: 'Viandes & Volailles', calories100g: 310, p100g: 14, c100g: 1.2, f100g: 28, fib100g: 0, nutriScore: 'E', defaultServingGrams: 60, servingUnitName: '1 merguez' },
  { id: 'v14', name: 'Saucisse de Toulouse grillée', category: 'Viandes & Volailles', calories100g: 290, p100g: 16, c100g: 1.0, f100g: 25, fib100g: 0, nutriScore: 'E', defaultServingGrams: 100, servingUnitName: '1 saucisse' },
  { id: 'v15', name: 'Bacon grillé (lard fumé)', category: 'Viandes & Volailles', calories100g: 540, p100g: 37, c100g: 1.4, f100g: 42, fib100g: 0, nutriScore: 'E', defaultServingGrams: 20, servingUnitName: '2 tranches' },

  // --- POISSONS & MER ---
  { id: 'p1', name: 'Pavé de saumon frais grillé', category: 'Poissons & Mer', calories100g: 206, p100g: 22, c100g: 0, f100g: 13, fib100g: 0, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 pavé' },
  { id: 'p2', name: 'Saumon fumé', category: 'Poissons & Mer', calories100g: 184, p100g: 23, c100g: 0.5, f100g: 10, fib100g: 0, nutriScore: 'B', defaultServingGrams: 40, servingUnitName: '1 tranche' },
  { id: 'p3', name: 'Dos de cabillaud vapeur', category: 'Poissons & Mer', calories100g: 82, p100g: 18, c100g: 0, f100g: 0.7, fib100g: 0, nutriScore: 'A', defaultServingGrams: 140, servingUnitName: '1 dos' },
  { id: 'p4', name: 'Thon au naturel en boîte', category: 'Poissons & Mer', calories100g: 116, p100g: 26, c100g: 0, f100g: 1.0, fib100g: 0, nutriScore: 'A', defaultServingGrams: 100, servingUnitName: '1 petite boîte' },
  { id: 'p5', name: 'Thon à l\'huile d\'olive', category: 'Poissons & Mer', calories100g: 198, p100g: 27, c100g: 0, f100g: 10, fib100g: 0, nutriScore: 'B', defaultServingGrams: 100, servingUnitName: '1 petite boîte' },
  { id: 'p6', name: 'Crevettes roses cuites décortiquées', category: 'Poissons & Mer', calories100g: 99, p100g: 21, c100g: 0.9, f100g: 1.2, fib100g: 0, nutriScore: 'A', defaultServingGrams: 120, servingUnitName: '10 crevettes' },
  { id: 'p7', name: 'Filet de colin / lieu noir', category: 'Poissons & Mer', calories100g: 85, p100g: 19, c100g: 0, f100g: 0.9, fib100g: 0, nutriScore: 'A', defaultServingGrams: 140, servingUnitName: '1 filet' },
  { id: 'p8', name: 'Sardines à l\'huile en boîte', category: 'Poissons & Mer', calories100g: 208, p100g: 24, c100g: 0, f100g: 12, fib100g: 0, nutriScore: 'B', defaultServingGrams: 85, servingUnitName: '1 boîte' },
  { id: 'p9', name: 'Filet de maquereau grillé', category: 'Poissons & Mer', calories100g: 262, p100g: 24, c100g: 0, f100g: 18, fib100g: 0, nutriScore: 'A', defaultServingGrams: 120, servingUnitName: '1 filet' },
  { id: 'p10', name: 'Truite de rivière poêlée', category: 'Poissons & Mer', calories100g: 148, p100g: 21, c100g: 0, f100g: 6.8, fib100g: 0, nutriScore: 'A', defaultServingGrams: 140, servingUnitName: '1 filet' },
  { id: 'p11', name: 'Moules marinières cuites', category: 'Poissons & Mer', calories100g: 118, p100g: 18, c100g: 4.5, f100g: 2.8, fib100g: 0, nutriScore: 'A', defaultServingGrams: 200, servingUnitName: '1 bol' },
  { id: 'p12', name: 'Noix de Saint-Jacques poêlées', category: 'Poissons & Mer', calories100g: 111, p100g: 20.5, c100g: 3.2, f100g: 1.4, fib100g: 0, nutriScore: 'A', defaultServingGrams: 120, servingUnitName: '6 noix' },

  // --- ŒUFS & PRODUITS LAITIERS ---
  { id: 'ol1', name: 'Œuf frais entier (1 moyen = 50g)', category: 'Œufs & Produits Laitiers', calories100g: 143, p100g: 12.6, c100g: 0.7, f100g: 9.5, fib100g: 0, nutriScore: 'A', defaultServingGrams: 50, servingUnitName: '1 œuf' },
  { id: 'ol2', name: 'Blanc d\'œuf liquide / cuit', category: 'Œufs & Produits Laitiers', calories100g: 52, p100g: 11, c100g: 0.7, f100g: 0.2, fib100g: 0, nutriScore: 'A', defaultServingGrams: 100, servingUnitName: '3 blancs' },
  { id: 'ol3', name: 'Skyr Nature 0% (Islande)', category: 'Œufs & Produits Laitiers', calories100g: 57, p100g: 10, c100g: 4.0, f100g: 0.2, fib100g: 0, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 pot' },
  { id: 'ol4', name: 'Fromage blanc 0% MG', category: 'Œufs & Produits Laitiers', calories100g: 48, p100g: 8.0, c100g: 3.8, f100g: 0.1, fib100g: 0, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 ramequin' },
  { id: 'ol5', name: 'Yaourt Grec authentique nature', category: 'Œufs & Produits Laitiers', calories100g: 125, p100g: 5.5, c100g: 3.5, f100g: 10, fib100g: 0, nutriScore: 'B', defaultServingGrams: 150, servingUnitName: '1 pot' },
  { id: 'ol6', name: 'Yaourt nature basique', category: 'Œufs & Produits Laitiers', calories100g: 61, p100g: 3.5, c100g: 4.7, f100g: 3.3, fib100g: 0, nutriScore: 'A', defaultServingGrams: 125, servingUnitName: '1 pot' },
  { id: 'ol7', name: 'Lait demi-écrémé', category: 'Œufs & Produits Laitiers', calories100g: 46, p100g: 3.3, c100g: 4.8, f100g: 1.6, fib100g: 0, nutriScore: 'A', defaultServingGrams: 200, servingUnitName: '1 grand verre', unit: 'ml' },
  { id: 'ol8', name: 'Lait d\'amande sans sucre (bio)', category: 'Œufs & Produits Laitiers', calories100g: 15, p100g: 0.5, c100g: 0.3, f100g: 1.2, fib100g: 0.3, nutriScore: 'A', defaultServingGrams: 200, servingUnitName: '1 verre', unit: 'ml' },
  { id: 'ol9', name: 'Lait d\'avoine', category: 'Œufs & Produits Laitiers', calories100g: 45, p100g: 1.0, c100g: 6.5, f100g: 1.5, fib100g: 0.8, nutriScore: 'B', defaultServingGrams: 200, servingUnitName: '1 verre', unit: 'ml' },
  { id: 'ol10', name: 'Lait de soja nature', category: 'Œufs & Produits Laitiers', calories100g: 38, p100g: 3.6, c100g: 1.8, f100g: 1.8, fib100g: 0.5, nutriScore: 'A', defaultServingGrams: 200, servingUnitName: '1 verre', unit: 'ml' },
  { id: 'ol11', name: 'Beurre doux pasteurisé', category: 'Œufs & Produits Laitiers', calories100g: 717, p100g: 0.8, c100g: 0.6, f100g: 81, fib100g: 0, nutriScore: 'E', defaultServingGrams: 10, servingUnitName: '1 noisette' },
  { id: 'ol12', name: 'Crème fraîche épaisse 30% MG', category: 'Œufs & Produits Laitiers', calories100g: 292, p100g: 2.3, c100g: 3.0, f100g: 30, fib100g: 0, nutriScore: 'D', defaultServingGrams: 30, servingUnitName: '1 cuillère à soupe' },
  { id: 'ol13', name: 'Crème fluide légère 15% MG', category: 'Œufs & Produits Laitiers', calories100g: 162, p100g: 2.8, c100g: 4.2, f100g: 15, fib100g: 0, nutriScore: 'C', defaultServingGrams: 30, servingUnitName: '1 cuillère à soupe' },

  // --- FROMAGES ---
  { id: 'f1', name: 'Mozzarella di Bufala / Fiov di Latte', category: 'Fromages', calories100g: 280, p100g: 18, c100g: 1.0, f100g: 22, fib100g: 0, nutriScore: 'D', defaultServingGrams: 125, servingUnitName: '1 boule' },
  { id: 'f2', name: 'Emmental râpé', category: 'Fromages', calories100g: 370, p100g: 28, c100g: 0.4, f100g: 29, fib100g: 0, nutriScore: 'D', defaultServingGrams: 30, servingUnitName: '1 poignée' },
  { id: 'f3', name: 'Comté AOP 18 mois', category: 'Fromages', calories100g: 417, p100g: 27, c100g: 0.5, f100g: 34, fib100g: 0, nutriScore: 'D', defaultServingGrams: 30, servingUnitName: '1 portion' },
  { id: 'f4', name: 'Camembert de Normandie', category: 'Fromages', calories100g: 285, p100g: 20, c100g: 0.5, f100g: 23, fib100g: 0, nutriScore: 'D', defaultServingGrams: 30, servingUnitName: '1/8 part' },
  { id: 'f5', name: 'Parmigiano Reggiano AOP (Parmesan)', category: 'Fromages', calories100g: 402, p100g: 32, c100g: 0, f100g: 30, fib100g: 0, nutriScore: 'D', defaultServingGrams: 20, servingUnitName: '1 cuillère d\'émulsion' },
  { id: 'f6', name: 'Feta Grecque AOP', category: 'Fromages', calories100g: 264, p100g: 14, c100g: 4.0, f100g: 21, fib100g: 0, nutriScore: 'D', defaultServingGrams: 50, servingUnitName: '1 bloc' },
  { id: 'f7', name: 'Chèvre frais en bûche', category: 'Fromages', calories100g: 230, p100g: 13, c100g: 2.0, f100g: 19, fib100g: 0, nutriScore: 'C', defaultServingGrams: 30, servingUnitName: '1 rondelle' },
  { id: 'f8', name: 'Cottage Cheese 2% MG', category: 'Fromages', calories100g: 85, p100g: 12, c100g: 3.2, f100g: 2.0, fib100g: 0, nutriScore: 'A', defaultServingGrams: 100, servingUnitName: '1/2 pot' },
  { id: 'f9', name: 'Ricotta', category: 'Fromages', calories100g: 174, p100g: 11, c100g: 3.0, f100g: 13, fib100g: 0, nutriScore: 'C', defaultServingGrams: 60, servingUnitName: '2 cuillères' },
  { id: 'f10', name: 'Roquefort AOP', category: 'Fromages', calories100g: 369, p100g: 21.5, c100g: 2.0, f100g: 31, fib100g: 0, nutriScore: 'E', defaultServingGrams: 30, servingUnitName: '1 portion' },

  // --- FÉCULENTS & CÉRÉALES ---
  { id: 'fc1', name: 'Riz basmati cuit', category: 'Féculents & Céréales', calories100g: 130, p100g: 2.7, c100g: 28, f100g: 0.3, fib100g: 0.4, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 bol' },
  { id: 'fc2', name: 'Riz complet cuit', category: 'Féculents & Céréales', calories100g: 123, p100g: 2.7, c100g: 25.6, f100g: 1.0, fib100g: 1.8, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 bol' },
  { id: 'fc3', name: 'Pâtes blanches cuites (al dente)', category: 'Féculents & Céréales', calories100g: 140, p100g: 5.0, c100g: 28, f100g: 0.7, fib100g: 1.8, nutriScore: 'A', defaultServingGrams: 180, servingUnitName: '1 assiette' },
  { id: 'fc4', name: 'Pâtes complètes cuites', category: 'Féculents & Céréales', calories100g: 124, p100g: 5.3, c100g: 23, f100g: 0.8, fib100g: 4.5, nutriScore: 'A', defaultServingGrams: 180, servingUnitName: '1 assiette' },
  { id: 'fc5', name: 'Flocons d\'avoine complets (crus)', category: 'Féculents & Céréales', calories100g: 375, p100g: 13.5, c100g: 58, f100g: 7.0, fib100g: 10, nutriScore: 'A', defaultServingGrams: 40, servingUnitName: '1 portion' },
  { id: 'fc6', name: 'Patate douce cuite au four', category: 'Féculents & Céréales', calories100g: 90, p100g: 2.0, c100g: 21, f100g: 0.15, fib100g: 3.3, nutriScore: 'A', defaultServingGrams: 200, servingUnitName: '1 patate moyenne' },
  { id: 'fc7', name: 'Pomme de terre vapeur / eau', category: 'Féculents & Céréales', calories100g: 87, p100g: 1.9, c100g: 20, f100g: 0.1, fib100g: 1.8, nutriScore: 'A', defaultServingGrams: 200, servingUnitName: '2 pdt moyennes' },
  { id: 'fc8', name: 'Frites de pomme de terre au four', category: 'Féculents & Céréales', calories100g: 195, p100g: 3.2, c100g: 30, f100g: 6.8, fib100g: 3.0, nutriScore: 'B', defaultServingGrams: 150, servingUnitName: '1 grande portion' },
  { id: 'fc9', name: 'Pain complet au levain', category: 'Féculents & Céréales', calories100g: 247, p100g: 9.0, c100g: 41, f100g: 3.4, fib100g: 7.0, nutriScore: 'A', defaultServingGrams: 60, servingUnitName: '2 tranches' },
  { id: 'fc10', name: 'Baguette de tradition française', category: 'Féculents & Céréales', calories100g: 275, p100g: 8.5, c100g: 56, f100g: 1.2, fib100g: 3.2, nutriScore: 'B', defaultServingGrams: 80, servingUnitName: '1/3 de baguette' },
  { id: 'fc11', name: 'Pain de mie complet', category: 'Féculents & Céréales', calories100g: 252, p100g: 8.8, c100g: 45, f100g: 3.5, fib100g: 5.5, nutriScore: 'A', defaultServingGrams: 50, servingUnitName: '2 tranches' },
  { id: 'fc12', name: 'Quinoa cuit', category: 'Féculents & Céréales', calories100g: 120, p100g: 4.4, c100g: 21, f100g: 1.9, fib100g: 2.8, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 bol' },
  { id: 'fc13', name: 'Semoule de couscous cuite', category: 'Féculents & Céréales', calories100g: 112, p100g: 3.8, c100g: 23, f100g: 0.2, fib100g: 1.4, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 bol' },
  { id: 'fc14', name: 'Gnocchis de pomme de terre cuits', category: 'Féculents & Céréales', calories100g: 162, p100g: 4.1, c100g: 34, f100g: 0.8, fib100g: 2.2, nutriScore: 'A', defaultServingGrams: 200, servingUnitName: '1 assiette' },
  { id: 'fc15', name: 'Tortilla de blé (Wrap)', category: 'Féculents & Céréales', calories100g: 300, p100g: 8.0, c100g: 50, f100g: 7.0, fib100g: 3.0, nutriScore: 'B', defaultServingGrams: 60, servingUnitName: '1 galette wrap' },

  // --- LÉGUMINEUSES ---
  { id: 'leg1', name: 'Lentilles vertes cuites', category: 'Légumineuses', calories100g: 116, p100g: 9.0, c100g: 17, f100g: 0.4, fib100g: 7.8, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 ramequin' },
  { id: 'leg2', name: 'Lentilles corail cuites', category: 'Légumineuses', calories100g: 105, p100g: 8.5, c100g: 15, f100g: 0.5, fib100g: 5.0, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 ramequin' },
  { id: 'leg3', name: 'Pois chiches cuits en boîte', category: 'Légumineuses', calories100g: 139, p100g: 7.3, c100g: 20, f100g: 2.6, fib100g: 6.4, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 ramequin' },
  { id: 'leg4', name: 'Haricots rouges cuits', category: 'Légumineuses', calories100g: 127, p100g: 8.7, c100g: 19, f100g: 0.5, fib100g: 6.4, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 ramequin' },
  { id: 'leg5', name: 'Edamame (fèves de soja)', category: 'Légumineuses', calories100g: 122, p100g: 11, c100g: 8.9, f100g: 5.2, fib100g: 5.2, nutriScore: 'A', defaultServingGrams: 100, servingUnitName: '1 poignée' },
  { id: 'leg6', name: 'Tofu ferme nature', category: 'Légumineuses', calories100g: 83, p100g: 10, c100g: 1.2, f100g: 4.8, fib100g: 1.0, nutriScore: 'A', defaultServingGrams: 125, servingUnitName: '1 pavé' },
  { id: 'leg7', name: 'Tofu fumé', category: 'Légumineuses', calories100g: 140, p100g: 16, c100g: 2.0, f100g: 7.5, fib100g: 1.5, nutriScore: 'A', defaultServingGrams: 125, servingUnitName: '1 pavé' },

  // --- FRUITS ---
  { id: 'fr1', name: 'Banane fraîche', category: 'Fruits', calories100g: 89, p100g: 1.1, c100g: 23, f100g: 0.3, fib100g: 2.6, nutriScore: 'A', defaultServingGrams: 120, servingUnitName: '1 banane moyenne' },
  { id: 'fr2', name: 'Pomme (Gala / Golden)', category: 'Fruits', calories100g: 52, p100g: 0.3, c100g: 14, f100g: 0.2, fib100g: 2.4, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 pomme moyenne' },
  { id: 'fr3', name: 'Orange fraîche', category: 'Fruits', calories100g: 47, p100g: 0.9, c100g: 11.7, f100g: 0.1, fib100g: 2.4, nutriScore: 'A', defaultServingGrams: 140, servingUnitName: '1 orange' },
  { id: 'fr4', name: 'Fraises fraîches', category: 'Fruits', calories100g: 32, p100g: 0.7, c100g: 7.7, f100g: 0.3, fib100g: 2.0, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 ramequin' },
  { id: 'fr5', name: 'Framboises fraîches', category: 'Fruits', calories100g: 52, p100g: 1.2, c100g: 11.9, f100g: 0.7, fib100g: 6.5, nutriScore: 'A', defaultServingGrams: 125, servingUnitName: '1 barquette' },
  { id: 'fr6', name: 'Myrtilles fraîches', category: 'Fruits', calories100g: 57, p100g: 0.7, c100g: 14, f100g: 0.3, fib100g: 2.4, nutriScore: 'A', defaultServingGrams: 100, servingUnitName: '1 poignée' },
  { id: 'fr7', name: 'Kiwi vert', category: 'Fruits', calories100g: 61, p100g: 1.1, c100g: 15, f100g: 0.5, fib100g: 3.0, nutriScore: 'A', defaultServingGrams: 80, servingUnitName: '1 kiwi' },
  { id: 'fr8', name: 'Ananas frais en tranches', category: 'Fruits', calories100g: 50, p100g: 0.5, c100g: 13, f100g: 0.1, fib100g: 1.4, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '2 tranches' },
  { id: 'fr9', name: 'Mangue fraîche', category: 'Fruits', calories100g: 60, p100g: 0.8, c100g: 15, f100g: 0.4, fib100g: 1.6, nutriScore: 'A', defaultServingGrams: 160, servingUnitName: '1/2 mangue' },
  { id: 'fr10', name: 'Avocat frais', category: 'Fruits', calories100g: 160, p100g: 2.0, c100g: 8.5, f100g: 14.7, fib100g: 6.7, nutriScore: 'A', defaultServingGrams: 100, servingUnitName: '1/2 avocat' },
  { id: 'fr11', name: 'Dattes séchées (Medjool)', category: 'Fruits', calories100g: 277, p100g: 1.8, c100g: 75, f100g: 0.2, fib100g: 6.7, nutriScore: 'B', defaultServingGrams: 30, servingUnitName: '2 dattes' },

  // --- LÉGUMES ---
  { id: 'legu1', name: 'Brocoli cuit vapeur', category: 'Légumes', calories100g: 35, p100g: 2.4, c100g: 7.0, f100g: 0.4, fib100g: 3.3, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 portion' },
  { id: 'legu2', name: 'Courgette cuite', category: 'Légumes', calories100g: 17, p100g: 1.2, c100g: 3.1, f100g: 0.3, fib100g: 1.0, nutriScore: 'A', defaultServingGrams: 180, servingUnitName: '1 courgette' },
  { id: 'legu3', name: 'Haricots verts cuits', category: 'Légumes', calories100g: 31, p100g: 1.8, c100g: 7.0, f100g: 0.1, fib100g: 3.4, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 portion' },
  { id: 'legu4', name: 'Carotte crue râpée', category: 'Légumes', calories100g: 41, p100g: 0.9, c100g: 9.6, f100g: 0.2, fib100g: 2.8, nutriScore: 'A', defaultServingGrams: 120, servingUnitName: '1 ramequin' },
  { id: 'legu5', name: 'Épinards frais cuits', category: 'Légumes', calories100g: 23, p100g: 2.9, c100g: 3.6, f100g: 0.4, fib100g: 2.2, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 portion' },
  { id: 'legu6', name: 'Tomate fraîche', category: 'Légumes', calories100g: 18, p100g: 0.9, c100g: 3.9, f100g: 0.2, fib100g: 1.2, nutriScore: 'A', defaultServingGrams: 120, servingUnitName: '1 tomate' },
  { id: 'legu7', name: 'Concombre frais avec peau', category: 'Légumes', calories100g: 15, p100g: 0.7, c100g: 3.6, f100g: 0.1, fib100g: 0.5, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1/2 concombre' },
  { id: 'legu8', name: 'Poivron rouge grillé', category: 'Légumes', calories100g: 31, p100g: 1.0, c100g: 6.0, f100g: 0.3, fib100g: 2.1, nutriScore: 'A', defaultServingGrams: 120, servingUnitName: '1 poivron' },
  { id: 'legu9', name: 'Champignons de Paris sautés', category: 'Légumes', calories100g: 22, p100g: 3.1, c100g: 3.3, f100g: 0.3, fib100g: 1.0, nutriScore: 'A', defaultServingGrams: 100, servingUnitName: '1 poignée' },
  { id: 'legu10', name: 'Chou-fleur cuit', category: 'Légumes', calories100g: 25, p100g: 1.9, c100g: 5.0, f100g: 0.3, fib100g: 2.0, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '1 portion' },

  // --- OLÉAGINEUX & HUILES ---
  { id: 'oh1', name: 'Amandes brutes non salées', category: 'Oléagineux & Huiles', calories100g: 579, p100g: 21, c100g: 22, f100g: 50, fib100g: 12.5, nutriScore: 'A', defaultServingGrams: 30, servingUnitName: '1 poignée' },
  { id: 'oh2', name: 'Noix de Grenoble', category: 'Oléagineux & Huiles', calories100g: 654, p100g: 15, c100g: 13.7, f100g: 65, fib100g: 6.7, nutriScore: 'A', defaultServingGrams: 30, servingUnitName: '1 poignée' },
  { id: 'oh3', name: 'Noix de cajou grillées', category: 'Oléagineux & Huiles', calories100g: 553, p100g: 18, c100g: 30, f100g: 44, fib100g: 3.3, nutriScore: 'B', defaultServingGrams: 30, servingUnitName: '1 poignée' },
  { id: 'oh4', name: 'Beurre de cacahuète 100% pur', category: 'Oléagineux & Huiles', calories100g: 588, p100g: 25, c100g: 20, f100g: 50, fib100g: 8.0, nutriScore: 'A', defaultServingGrams: 20, servingUnitName: '1 cuillère à soupe' },
  { id: 'oh5', name: 'Huile d\'olive extra vierge', category: 'Oléagineux & Huiles', calories100g: 884, p100g: 0, c100g: 0, f100g: 100, fib100g: 0, nutriScore: 'B', defaultServingGrams: 10, servingUnitName: '1 cuillère à soupe', unit: 'ml' },
  { id: 'oh6', name: 'Graines de chia bio', category: 'Oléagineux & Huiles', calories100g: 486, p100g: 16.5, c100g: 42, f100g: 30.7, fib100g: 34.4, nutriScore: 'A', defaultServingGrams: 15, servingUnitName: '1 cuillère à soupe' },

  // --- PLATS CUISINÉS & FAST-FOOD ---
  { id: 'ff1', name: 'Pizza Margherita classique', category: 'Plats Cuisinés & Fast-Food', calories100g: 220, p100g: 9.5, c100g: 28, f100g: 7.5, fib100g: 2.1, nutriScore: 'C', defaultServingGrams: 350, servingUnitName: '1 pizza entière' },
  { id: 'ff2', name: 'Burger Bœuf Cheeseburger', category: 'Plats Cuisinés & Fast-Food', calories100g: 260, p100g: 14, c100g: 26, f100g: 11, fib100g: 1.5, nutriScore: 'D', defaultServingGrams: 200, servingUnitName: '1 burger' },
  { id: 'ff3', name: 'Kebab Pita Viande & Crudités', category: 'Plats Cuisinés & Fast-Food', calories100g: 215, p100g: 13, c100g: 22, f100g: 8.5, fib100g: 2.0, nutriScore: 'C', defaultServingGrams: 350, servingUnitName: '1 sandwich kebab' },
  { id: 'ff4', name: 'Sushi Nigiri Saumon', category: 'Plats Cuisinés & Fast-Food', calories100g: 180, p100g: 7.5, c100g: 30, f100g: 3.5, fib100g: 0.8, nutriScore: 'A', defaultServingGrams: 150, servingUnitName: '6 pièces' },
  { id: 'ff5', name: 'California Roll Saumon Avocat', category: 'Plats Cuisinés & Fast-Food', calories100g: 195, p100g: 6.0, c100g: 32, f100g: 5.0, fib100g: 1.2, nutriScore: 'B', defaultServingGrams: 180, servingUnitName: '6 maki rolls' },
  { id: 'ff6', name: 'Lasagnes Bolognaise maison', category: 'Plats Cuisinés & Fast-Food', calories100g: 165, p100g: 8.5, c100g: 16, f100g: 7.2, fib100g: 1.5, nutriScore: 'C', defaultServingGrams: 300, servingUnitName: '1 part' },
  { id: 'ff7', name: 'Quiche Lorraine artisanale', category: 'Plats Cuisinés & Fast-Food', calories100g: 275, p100g: 9.0, c100g: 18, f100g: 18.5, fib100g: 1.0, nutriScore: 'D', defaultServingGrams: 180, servingUnitName: '1/4 de quiche' },
  { id: 'ff8', name: 'Poké Bowl Saumon Mangue Riz', category: 'Plats Cuisinés & Fast-Food', calories100g: 150, p100g: 7.8, c100g: 20, f100g: 4.5, fib100g: 2.2, nutriScore: 'A', defaultServingGrams: 380, servingUnitName: '1 grand bol' },

  // --- BOISSONS & PROTÉINES ---
  { id: 'b1', name: 'Shaker Protéine Whey (Isolate)', category: 'Boissons & Protéines', calories100g: 370, p100g: 85, c100g: 3.5, f100g: 1.5, fib100g: 0, nutriScore: 'A', defaultServingGrams: 300, servingUnitName: '1 shaker (300ml)', unit: 'ml' },
  { id: 'b2', name: 'Jus d\'orange pur jus pressé', category: 'Boissons & Protéines', calories100g: 45, p100g: 0.7, c100g: 10, f100g: 0.1, fib100g: 0.2, nutriScore: 'C', defaultServingGrams: 200, servingUnitName: '1 verre (200ml)', unit: 'ml' },
  { id: 'b3', name: 'Coca-Cola Zéro / Max', category: 'Boissons & Protéines', calories100g: 0.5, p100g: 0, c100g: 0, f100g: 0, fib100g: 0, nutriScore: 'B', defaultServingGrams: 330, servingUnitName: '1 canette (330ml)', unit: 'ml' },
  { id: 'b4', name: 'Café noir sans sucre', category: 'Boissons & Protéines', calories100g: 2, p100g: 0.1, c100g: 0.2, f100g: 0, fib100g: 0, nutriScore: 'A', defaultServingGrams: 100, servingUnitName: '1 espresso (100ml)', unit: 'ml' },
  { id: 'b5', name: 'Thé vert infusé bio', category: 'Boissons & Protéines', calories100g: 1, p100g: 0, c100g: 0.2, f100g: 0, fib100g: 0, nutriScore: 'A', defaultServingGrams: 250, servingUnitName: '1 grande tasse (250ml)', unit: 'ml' },
  { id: 'b6', name: 'Eau minérale naturelle', category: 'Boissons & Protéines', calories100g: 0, p100g: 0, c100g: 0, f100g: 0, fib100g: 0, nutriScore: 'A', defaultServingGrams: 250, servingUnitName: '1 verre (250ml)', unit: 'ml' },
  { id: 'b7', name: 'Smoothie Fruits Rouges & Banane', category: 'Boissons & Protéines', calories100g: 58, p100g: 1.2, c100g: 13, f100g: 0.4, fib100g: 1.8, nutriScore: 'A', defaultServingGrams: 250, servingUnitName: '1 verre (250ml)', unit: 'ml' },
  { id: 'b8', name: 'Soupe / Velouté de légumes variés', category: 'Boissons & Protéines', calories100g: 35, p100g: 1.1, c100g: 5.8, f100g: 0.8, fib100g: 1.5, nutriScore: 'A', defaultServingGrams: 300, servingUnitName: '1 bol (300ml)', unit: 'ml' },
  { id: 'b9', name: 'Bière blonde classique 5°', category: 'Boissons & Protéines', calories100g: 43, p100g: 0.5, c100g: 3.5, f100g: 0, fib100g: 0, nutriScore: 'D', defaultServingGrams: 330, servingUnitName: '1 demi / canette (330ml)', unit: 'ml' },
  { id: 'b10', name: 'Vin rouge 12°', category: 'Boissons & Protéines', calories100g: 85, p100g: 0.1, c100g: 2.6, f100g: 0, fib100g: 0, nutriScore: 'D', defaultServingGrams: 125, servingUnitName: '1 verre de vin (125ml)', unit: 'ml' },

  // --- SNACKS & DESSERTS ---
  { id: 'sn1', name: 'Chocolat noir 85% cacao', category: 'Snacks & Desserts', calories100g: 580, p100g: 9.5, c100g: 19, f100g: 46, fib100g: 12.5, nutriScore: 'C', defaultServingGrams: 20, servingUnitName: '2 carrés' },
  { id: 'sn2', name: 'Barre protéinée gourmande', category: 'Snacks & Desserts', calories100g: 360, p100g: 33, c100g: 30, f100g: 11, fib100g: 8.5, nutriScore: 'A', defaultServingGrams: 60, servingUnitName: '1 barre' },
  { id: 'sn3', name: 'Croissant au beurre frais', category: 'Snacks & Desserts', calories100g: 406, p100g: 8.2, c100g: 45, f100g: 21, fib100g: 2.3, nutriScore: 'D', defaultServingGrams: 50, servingUnitName: '1 croissant' },
  { id: 'sn4', name: 'Pain au chocolat / Chocolatine', category: 'Snacks & Desserts', calories100g: 414, p100g: 7.5, c100g: 47, f100g: 22, fib100g: 2.5, nutriScore: 'E', defaultServingGrams: 60, servingUnitName: '1 pain au chocolat' },
  { id: 'sn5', name: 'Compote de pomme allégée en sucre', category: 'Snacks & Desserts', calories100g: 62, p100g: 0.3, c100g: 14.5, f100g: 0.1, fib100g: 1.5, nutriScore: 'A', defaultServingGrams: 100, servingUnitName: '1 gourde' },

  // --- SAUCES & CONDIMENTS ---
  { id: 'sau1', name: 'Sauce soja salée Kikkoman', category: 'Sauces & Condiments', calories100g: 53, p100g: 8.0, c100g: 4.9, f100g: 0, fib100g: 0, nutriScore: 'D', defaultServingGrams: 15, servingUnitName: '1 cuillère à soupe' },
  { id: 'sau2', name: 'Moutarde de Dijon traditionnelle', category: 'Sauces & Condiments', calories100g: 150, p100g: 7.0, c100g: 5.0, f100g: 11, fib100g: 3.0, nutriScore: 'C', defaultServingGrams: 10, servingUnitName: '1 cuillère à café' },
  { id: 'sau3', name: 'Hummus de pois chiches classique', category: 'Sauces & Condiments', calories100g: 166, p100g: 7.9, c100g: 14.3, f100g: 9.6, fib100g: 6.0, nutriScore: 'B', defaultServingGrams: 40, servingUnitName: '2 cuillères à soupe' },
  { id: 'sau4', name: 'Guacamole artisanal', category: 'Sauces & Condiments', calories100g: 155, p100g: 1.9, c100g: 8.0, f100g: 13.5, fib100g: 5.0, nutriScore: 'A', defaultServingGrams: 40, servingUnitName: '2 cuillères à soupe' },
  { id: 'sau5', name: 'Pesto Verde au basilic', category: 'Sauces & Condiments', calories100g: 450, p100g: 5.2, c100g: 6.5, f100g: 44, fib100g: 2.0, nutriScore: 'D', defaultServingGrams: 20, servingUnitName: '1 cuillère à soupe' },
];
