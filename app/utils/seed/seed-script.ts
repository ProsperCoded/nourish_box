import { seedRecipes } from "./recipes.seed";
import { seedRecipesToFirebase } from "../firebase/recipes.firebase";

export async function runSeed() {
  console.log("Starting to seed recipes...");
  await seedRecipesToFirebase(seedRecipes);
  console.log("Seeding completed!");
}
