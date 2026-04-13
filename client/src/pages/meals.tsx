import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beef, Leaf } from "lucide-react";

type Meal = {
  time: string;
  name: string;
  items: string;
  protein: string;
  calories: string;
};

const NON_VEG_MEALS: Meal[] = [
  {
    time: "7:00 AM",
    name: "Meal 1 — Breakfast",
    items: "6 egg whites + 1 whole egg scrambled, 1/2 cup oats with cinnamon",
    protein: "32g",
    calories: "310",
  },
  {
    time: "10:00 AM",
    name: "Meal 2 — Snack",
    items: "1 cup Greek yogurt (0% fat), 15 almonds",
    protein: "25g",
    calories: "250",
  },
  {
    time: "1:00 PM",
    name: "Meal 3 — Lunch",
    items: "8 oz grilled chicken breast, 1 cup brown rice, 1 cup steamed broccoli",
    protein: "52g",
    calories: "480",
  },
  {
    time: "4:00 PM",
    name: "Meal 4 — Pre-Workout",
    items: "1 scoop whey protein, 1 banana",
    protein: "28g",
    calories: "220",
  },
  {
    time: "7:00 PM",
    name: "Meal 5 — Dinner",
    items: "8 oz lean ground turkey, 1 medium sweet potato, mixed greens salad",
    protein: "42g",
    calories: "420",
  },
  {
    time: "9:30 PM",
    name: "Meal 6 — Before Bed",
    items: "1 scoop casein protein, 1 tbsp natural peanut butter",
    protein: "30g",
    calories: "210",
  },
];

const VEG_MEALS: Meal[] = [
  {
    time: "7:00 AM",
    name: "Meal 1 — Power Bowl",
    items: "1 cup Greek yogurt, 1 scoop whey protein mixed in, 1/2 cup oats, berries",
    protein: "42g",
    calories: "380",
  },
  {
    time: "10:00 AM",
    name: "Meal 2 — Cottage Combo",
    items: "1 cup cottage cheese, 2 tbsp hemp seeds, sliced cucumber",
    protein: "34g",
    calories: "280",
  },
  {
    time: "1:00 PM",
    name: "Meal 3 — Seitan & Quinoa",
    items: "6 oz seitan stir-fry, 1 cup quinoa, 1/2 cup edamame, vegetables",
    protein: "52g",
    calories: "460",
  },
  {
    time: "4:00 PM",
    name: "Meal 4 — Pre-Workout",
    items: "1 scoop whey protein, 1 banana",
    protein: "28g",
    calories: "220",
  },
  {
    time: "7:00 PM",
    name: "Meal 5 — Tofu & Lentils",
    items: "6 oz baked tofu, 1 cup cooked lentils, brown rice, nutritional yeast",
    protein: "40g",
    calories: "450",
  },
  {
    time: "9:30 PM",
    name: "Meal 6 — Before Bed",
    items: "1 scoop casein protein, 1 tbsp almond butter",
    protein: "28g",
    calories: "200",
  },
];

const VEG_ROTATION = [
  { day: "Day 1", meal: "Tofu Scramble Bowl", desc: "Firm tofu scrambled with turmeric, spinach, peppers, served with whole wheat toast" },
  { day: "Day 2", meal: "Protein Oatmeal", desc: "Oats cooked with whey protein, topped with chia seeds, banana slices, and walnuts" },
  { day: "Day 3", meal: "Smoothie Bowl", desc: "Blended Greek yogurt, berries, protein powder, topped with granola and hemp seeds" },
  { day: "Day 4", meal: "Tempeh Stir-Fry", desc: "Marinated tempeh with broccoli, bell peppers, soy sauce, over brown rice" },
  { day: "Day 5", meal: "Lentil Power Bowl", desc: "Red lentil dal with spinach, tomatoes, and cumin, served with basmati rice" },
  { day: "Day 6", meal: "Chickpea Curry", desc: "Spiced chickpeas in tomato-coconut sauce with cauliflower and brown rice" },
  { day: "Day 7", meal: "Paneer Tikka", desc: "Grilled paneer with peppers and onions, mint chutney, with quinoa" },
];

function MealCard({ meal, index }: { meal: Meal; index: number }) {
  return (
    <div
      className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
      data-testid={`meal-item-${index}`}
    >
      <div className="w-16 shrink-0">
        <span className="text-xs font-medium text-muted-foreground">{meal.time}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold mb-0.5">{meal.name}</p>
        <p className="text-sm text-muted-foreground">{meal.items}</p>
      </div>
      <div className="text-right shrink-0">
        <Badge variant="secondary" className="font-mono text-xs tabular-nums mb-1">
          {meal.protein}
        </Badge>
        <p className="text-[10px] text-muted-foreground font-mono">{meal.calories} cal</p>
      </div>
    </div>
  );
}

export default function Meals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight" data-testid="text-page-title">
          Meal Plans
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          ~1,850 cal / ~190g protein daily — cutting phase
        </p>
      </div>

      <Tabs defaultValue="nonveg">
        <TabsList>
          <TabsTrigger value="nonveg" data-testid="tab-nonveg" className="gap-1.5">
            <Beef className="w-3.5 h-3.5" /> Non-Veg
          </TabsTrigger>
          <TabsTrigger value="veg" data-testid="tab-veg" className="gap-1.5">
            <Leaf className="w-3.5 h-3.5" /> Vegetarian
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nonveg" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Daily Plan</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-primary/15 text-primary border-primary/20 text-xs">
                    ~190g protein
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ~1,890 cal
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {NON_VEG_MEALS.map((meal, i) => (
                  <MealCard key={i} meal={meal} index={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="veg" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Daily Plan (No Eggs, No Meat)</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs">
                    ~190g protein
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ~1,990 cal
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {VEG_MEALS.map((meal, i) => (
                  <MealCard key={i} meal={meal} index={i} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">7-Day Lunch/Dinner Rotation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {VEG_ROTATION.map((r, i) => (
                  <div key={i} className="flex gap-3" data-testid={`rotation-${i}`}>
                    <Badge variant="outline" className="shrink-0 text-[10px] w-12 justify-center">
                      {r.day}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{r.meal}</p>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
