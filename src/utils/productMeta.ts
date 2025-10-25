export interface CostItemMeta { description: string; cost: number }

interface ProductMeta {
  components_text?: string;
  cost_items?: CostItemMeta[];
}



export function parseCostItems(value: any): CostItemMeta[] {
  try {
    if (Array.isArray(value)) return value as CostItemMeta[];
    if (typeof value === 'string') return JSON.parse(value) as CostItemMeta[];
  } catch {}
  return [];
}
