export interface CostItemMeta { description: string; cost: number }

interface ProductMeta {
  components_text?: string;
  cost_items?: CostItemMeta[];
}



// Funções dummy para compatibilidade com o frontend
export function getProductMeta(id: string): ProductMeta | null {
  console.warn("getProductMeta: Usando backend SQL, esta função é dummy.");
  return null;
}

export function saveProductMeta(id: string, meta: ProductMeta): void {
  console.warn("saveProductMeta: Usando backend SQL, esta função é dummy.");
}

export function parseCostItems(value: any): CostItemMeta[] {
  try {
    if (Array.isArray(value)) return value as CostItemMeta[];
    if (typeof value === 'string') return JSON.parse(value) as CostItemMeta[];
  } catch {}
  return [];
}
