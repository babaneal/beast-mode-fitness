import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beef, Leaf, ShoppingCart } from "lucide-react";

type GroceryCategory = {
  category: string;
  items: string[];
};

const NON_VEG_GROCERY: GroceryCategory[] = [
  {
    category: "Proteins",
    items: [
      "Chicken breast (4 lbs)",
      "Lean ground turkey (2 lbs)",
      "Eggs (2 dozen)",
      "Whey protein powder (1 tub)",
      "Casein protein powder (1 tub)",
      "Greek yogurt 0% fat (4 cups)",
    ],
  },
  {
    category: "Carbs & Grains",
    items: [
      "Brown rice (2 lbs)",
      "Old-fashioned oats (1 lb)",
      "Sweet potatoes (4 medium)",
      "Bananas (7)",
      "Whole wheat bread (1 loaf)",
    ],
  },
  {
    category: "Vegetables & Greens",
    items: [
      "Broccoli (2 heads)",
      "Mixed salad greens (2 bags)",
      "Spinach (1 bag)",
      "Bell peppers (4)",
      "Onions (3)",
    ],
  },
  {
    category: "Fats & Extras",
    items: [
      "Natural peanut butter (1 jar)",
      "Almonds (1 bag)",
      "Olive oil",
      "Cinnamon",
      "Garlic",
    ],
  },
];

const VEG_GROCERY: GroceryCategory[] = [
  {
    category: "Proteins",
    items: [
      "Seitan (2 packs, ~1 lb each)",
      "Extra-firm tofu (3 blocks)",
      "Tempeh (2 packs)",
      "Greek yogurt 0% fat (6 cups)",
      "Cottage cheese (2 tubs)",
      "Whey protein powder (1 tub)",
      "Casein protein powder (1 tub)",
      "Paneer (1 block)",
    ],
  },
  {
    category: "Legumes & Grains",
    items: [
      "Red lentils (2 lbs)",
      "Quinoa (1 lb)",
      "Brown rice (2 lbs)",
      "Chickpeas canned (3 cans)",
      "Black beans canned (2 cans)",
      "Edamame frozen (1 bag)",
      "Old-fashioned oats (1 lb)",
    ],
  },
  {
    category: "Vegetables & Greens",
    items: [
      "Broccoli (2 heads)",
      "Spinach (2 bags)",
      "Bell peppers (4)",
      "Cauliflower (1 head)",
      "Tomatoes (6)",
      "Onions (4)",
      "Garlic (1 bulb)",
      "Ginger root",
    ],
  },
  {
    category: "Seeds, Nuts & Extras",
    items: [
      "Hemp seeds (1 bag)",
      "Chia seeds (1 bag)",
      "Almond butter (1 jar)",
      "Walnuts (1 bag)",
      "Nutritional yeast (1 container)",
      "Coconut milk canned (2 cans)",
      "Turmeric powder",
      "Cumin powder",
      "Soy sauce / tamari",
    ],
  },
  {
    category: "Fruits",
    items: [
      "Bananas (7)",
      "Mixed berries frozen (1 bag)",
      "Lemons (3)",
    ],
  },
];

function GroceryList({ categories }: { categories: GroceryCategory[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const checkedCount = checked.size;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {checkedCount} of {totalItems} items checked
        </p>
        {checkedCount > 0 && (
          <button
            onClick={() => setChecked(new Set())}
            className="text-xs text-primary hover:underline"
            data-testid="button-clear-checked"
          >
            Clear all
          </button>
        )}
      </div>
      {categories.map((cat) => (
        <Card key={cat.category}>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {cat.category}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-0">
              {cat.items.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 py-2 cursor-pointer group"
                  data-testid={`grocery-item-${item.slice(0, 20).replace(/\s/g, "-").toLowerCase()}`}
                >
                  <Checkbox
                    checked={checked.has(item)}
                    onCheckedChange={() => toggle(item)}
                  />
                  <span
                    className={`text-sm transition-colors ${
                      checked.has(item)
                        ? "line-through text-muted-foreground"
                        : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Grocery() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight" data-testid="text-page-title">
          Weekly Grocery List
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everything you need for the week
        </p>
      </div>

      <Tabs defaultValue="nonveg">
        <TabsList>
          <TabsTrigger value="nonveg" data-testid="tab-grocery-nonveg" className="gap-1.5">
            <Beef className="w-3.5 h-3.5" /> Non-Veg
          </TabsTrigger>
          <TabsTrigger value="veg" data-testid="tab-grocery-veg" className="gap-1.5">
            <Leaf className="w-3.5 h-3.5" /> Vegetarian
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nonveg" className="mt-4">
          <GroceryList categories={NON_VEG_GROCERY} />
        </TabsContent>

        <TabsContent value="veg" className="mt-4">
          <GroceryList categories={VEG_GROCERY} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
