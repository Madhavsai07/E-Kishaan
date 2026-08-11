interface Recipe {
  potion: string;
  ingredients: string[];
}

interface Solution {
  minOrbs: number;
  steps: string[];
  explanation: string;
}

export function solveFrankensteinProblem(recipesText: string, targetPotion: string): Solution {
  try {
    // Parse recipes from text input
    const recipes: Recipe[] = [];
    const lines = recipesText.trim().split('\n');
    
    for (const line of lines) {
      if (line.trim()) {
        const parts = line.split('=');
        if (parts.length !== 2) {
          throw new Error(`Invalid recipe format: ${line}`);
        }
        
        const potion = parts[0].trim();
        const ingredientsPart = parts[1].trim();
        const ingredients = ingredientsPart.split('+').map(ing => ing.trim());
        
        recipes.push({ potion, ingredients });
      }
    }

    // Build recipe map for quick lookup
    const recipeMap = new Map<string, string[]>();
    for (const recipe of recipes) {
      recipeMap.set(recipe.potion, recipe.ingredients);
    }

    // Memoization cache
    const memo = new Map<string, number>();
    const solutionSteps: string[] = [];

    // Recursive function to calculate minimum orbs
    function calculateMinOrbs(potion: string, depth: number = 0): number {
      // Base case: if it's a basic ingredient (not in recipes), it costs 1 orb
      if (!recipeMap.has(potion)) {
        return 1;
      }

      // Check memoization cache
      if (memo.has(potion)) {
        return memo.get(potion)!;
      }

      // Get ingredients for this potion
      const ingredients = recipeMap.get(potion)!;
      let totalOrbs = 0;

      // Calculate orbs needed for each ingredient
      for (const ingredient of ingredients) {
        totalOrbs += calculateMinOrbs(ingredient, depth + 1);
      }

      // Add 1 orb for combining the ingredients
      totalOrbs += 1;

      // Store in memo and add to solution steps
      memo.set(potion, totalOrbs);
      
      if (depth === 0) {
        solutionSteps.push(`Create ${potion} using ${ingredients.join(' + ')} (${totalOrbs} orbs total)`);
      } else {
        solutionSteps.push(`  ${'  '.repeat(depth - 1)}Create ${potion} from ${ingredients.join(' + ')} (${totalOrbs} orbs)`);
      }

      return totalOrbs;
    }

    // Calculate minimum orbs for target potion
    const minOrbs = calculateMinOrbs(targetPotion);

    // Generate explanation
    const explanation = generateExplanation(targetPotion, recipeMap, minOrbs);

    return {
      minOrbs,
      steps: solutionSteps.reverse(), // Reverse to show creation order
      explanation
    };

  } catch (error) {
    return {
      minOrbs: -1,
      steps: [],
      explanation: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
    };
  }
}

function generateExplanation(targetPotion: string, recipeMap: Map<string, string[]>, minOrbs: number): string {
  const hasRecipe = recipeMap.has(targetPotion);
  
  if (!hasRecipe) {
    return `${targetPotion} is a basic ingredient that costs 1 magical orb.`;
  }

  const ingredients = recipeMap.get(targetPotion)!;
  const basicIngredients = ingredients.filter(ing => !recipeMap.has(ing));
  const complexIngredients = ingredients.filter(ing => recipeMap.has(ing));

  let explanation = `To create ${targetPotion}, we need ${ingredients.join(' and ')}.`;
  
  if (basicIngredients.length > 0) {
    explanation += ` Basic ingredients (${basicIngredients.join(', ')}) cost 1 orb each.`;
  }
  
  if (complexIngredients.length > 0) {
    explanation += ` Complex ingredients (${complexIngredients.join(', ')}) require their own recipes.`;
  }
  
  explanation += ` The total cost includes ingredient orbs plus 1 orb for the combination process, resulting in ${minOrbs} magical orbs.`;

  return explanation;
}

// Additional utility functions for agricultural calculations
export function calculateCropYield(
  baseYield: number,
  weatherFactor: number,
  soilHealth: number,
  fertilizerEfficiency: number
): number {
  // Simple yield prediction model
  const weatherMultiplier = Math.max(0.5, Math.min(1.5, weatherFactor));
  const soilMultiplier = soilHealth / 100;
  const fertilizerMultiplier = Math.max(0.8, Math.min(1.3, fertilizerEfficiency));
  
  return baseYield * weatherMultiplier * soilMultiplier * fertilizerMultiplier;
}

export function calculateROI(investment: number, revenue: number): number {
  if (investment <= 0) return 0;
  return ((revenue - investment) / investment) * 100;
}

export function predictOptimalHarvestDate(
  plantingDate: Date,
  cropDuration: number,
  weatherConditions: string[]
): Date {
  // Simple harvest date prediction
  const baseHarvestDate = new Date(plantingDate);
  baseHarvestDate.setDate(baseHarvestDate.getDate() + cropDuration);
  
  // Adjust for weather conditions
  let adjustment = 0;
  for (const condition of weatherConditions) {
    switch (condition.toLowerCase()) {
      case 'drought':
        adjustment += 7; // Delay harvest by 7 days
        break;
      case 'excessive_rain':
        adjustment += 3; // Delay harvest by 3 days
        break;
      case 'optimal':
        adjustment -= 2; // Earlier harvest by 2 days
        break;
    }
  }
  
  baseHarvestDate.setDate(baseHarvestDate.getDate() + adjustment);
  return baseHarvestDate;
}

export function calculateFertilizerRecommendation(
  soilNPK: { nitrogen: number; phosphorus: number; potassium: number },
  cropRequirements: { nitrogen: number; phosphorus: number; potassium: number },
  fieldSize: number
): { nitrogen: number; phosphorus: number; potassium: number } {
  // Calculate fertilizer needs based on soil deficiency
  const nitrogenNeeded = Math.max(0, (cropRequirements.nitrogen - soilNPK.nitrogen) * fieldSize / 100);
  const phosphorusNeeded = Math.max(0, (cropRequirements.phosphorus - soilNPK.phosphorus) * fieldSize / 100);
  const potassiumNeeded = Math.max(0, (cropRequirements.potassium - soilNPK.potassium) * fieldSize / 100);
  
  return {
    nitrogen: Math.round(nitrogenNeeded * 10) / 10,
    phosphorus: Math.round(phosphorusNeeded * 10) / 10,
    potassium: Math.round(potassiumNeeded * 10) / 10
  };
}