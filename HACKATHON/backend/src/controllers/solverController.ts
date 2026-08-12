import { Request, Response } from 'express';

interface Recipe {
  potion: string;
  ingredients: string[];
}

function solveFrankensteinProblemServer(recipesText: string, targetPotion: string) {
  try {
    const recipes: Recipe[] = [];
    const lines = recipesText.trim().split('\n');

    for (const line of lines) {
      if (line.trim()) {
        const parts = line.split('=');
        if (parts.length !== 2) throw new Error(`Invalid recipe format: ${line}`);
        const potion = parts[0].trim();
        const ingredients = parts[1].split('+').map((ing) => ing.trim());
        recipes.push({ potion, ingredients });
      }
    }

    const recipeMap = new Map<string, string[]>();
    for (const r of recipes) {
      recipeMap.set(r.potion, r.ingredients);
    }

    const memo = new Map<string, number>();
    const solutionSteps: string[] = [];

    function calculateMinOrbs(potion: string, depth: number = 0): number {
      if (!recipeMap.has(potion)) return 1;
      if (memo.has(potion)) return memo.get(potion)!;

      const ingredients = recipeMap.get(potion)!;
      let totalOrbs = 0;

      for (const ingredient of ingredients) {
        totalOrbs += calculateMinOrbs(ingredient, depth + 1);
      }
      totalOrbs += 1;
      memo.set(potion, totalOrbs);

      if (depth === 0) {
        solutionSteps.push(`Create ${potion} using ${ingredients.join(' + ')} (${totalOrbs} orbs total)`);
      } else {
        solutionSteps.push(`  ${'  '.repeat(depth - 1)}Create ${potion} from ${ingredients.join(' + ')} (${totalOrbs} orbs)`);
      }

      return totalOrbs;
    }

    const minOrbs = calculateMinOrbs(targetPotion);

    return {
      minOrbs,
      steps: solutionSteps.reverse(),
      explanation: `To create ${targetPotion}, we need ${recipeMap.get(targetPotion)?.join(' and ') || 'ingredients'}. Total minimum cost: ${minOrbs} magical orbs.`,
    };
  } catch (error: any) {
    return {
      minOrbs: -1,
      steps: [],
      explanation: `Error: ${error.message || 'Unable to solve recipe.'}`,
    };
  }
}

export async function solvePotionHandler(req: Request, res: Response) {
  const { recipes, targetPotion } = req.body;
  if (!recipes || !targetPotion) {
    return res.status(400).json({ success: false, error: 'Both recipes and targetPotion are required.' });
  }

  const result = solveFrankensteinProblemServer(recipes, targetPotion);
  return res.json({ success: true, solution: result });
}
