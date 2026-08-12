import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Brain, Trophy, Play, RotateCcw, Lightbulb, Target } from 'lucide-react';
import { solveFrankensteinProblem } from '@/lib/algorithms';
import { useUserStats } from '@/contexts/UserStatsContext';

interface Solution {
  minOrbs: number;
  steps: string[];
  explanation: string;
}

interface SampleProblem {
  title: string;
  description: string;
  recipes: string[];
  target: string;
  difficulty: string;
}

const sampleProblems: SampleProblem[] = [
  {
    title: "Basic Awakening Potion",
    description: "Create an awakening potion using the minimum magical orbs",
    recipes: [
      "awakening = snakefangs + wolfbane"
    ],
    target: "awakening",
    difficulty: "Easy"
  },
  {
    title: "Complex Transformation",
    description: "Multi-step potion creation with intermediate ingredients",
    recipes: [
      "strengthening = awakening + moonstone",
      "awakening = snakefangs + wolfbane",
      "healing = moonstone + herbs"
    ],
    target: "strengthening",
    difficulty: "Medium"
  },
  {
    title: "Master Alchemist Challenge",
    description: "Create the ultimate elixir with multiple pathways",
    recipes: [
      "elixir = strengthening + healing + wisdom",
      "strengthening = awakening + moonstone",
      "awakening = snakefangs + wolfbane",
      "healing = moonstone + herbs",
      "wisdom = ancient_scroll + meditation_crystal",
      "meditation_crystal = moonstone + starlight"
    ],
    target: "elixir",
    difficulty: "Hard"
  }
];

export default function FrankensteinSolver() {
  const { stats, recordProblemSolved } = useUserStats();
  const [recipes, setRecipes] = useState<string>('');
  const [targetPotion, setTargetPotion] = useState<string>('');
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<SampleProblem | null>(null);
  const [solvedProblems, setSolvedProblems] = useState<string[]>(['Basic Awakening Potion']);

  const handleSolve = async () => {
    if (!recipes.trim() || !targetPotion.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = solveFrankensteinProblem(recipes, targetPotion);
      setSolution(result);
      
      if (result.minOrbs > 0) {
        const points = selectedProblem?.difficulty === 'Easy' ? 50 : 
                       selectedProblem?.difficulty === 'Medium' ? 100 : 
                       selectedProblem?.difficulty === 'Hard' ? 200 : 75;
        
        recordProblemSolved(points, selectedProblem?.title || targetPotion);
        if (selectedProblem && !solvedProblems.includes(selectedProblem.title)) {
          setSolvedProblems((prev: string[]) => [...prev, selectedProblem.title]);
        }
      }
    } catch (error) {
      setSolution({
        minOrbs: -1,
        steps: [],
        explanation: "Error: Unable to solve the problem. Please check your recipe format."
      });
    }
    
    setIsLoading(false);
  };

  const loadSampleProblem = (problem: SampleProblem) => {
    setSelectedProblem(problem);
    setRecipes(problem.recipes.join('\n'));
    setTargetPotion(problem.target);
    setSolution(null);
  };

  const resetSolver = () => {
    setRecipes('');
    setTargetPotion('');
    setSolution(null);
    setSelectedProblem(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Points */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-500" />
            Frankenstein Orb Challenge
          </h2>
          <p className="text-gray-600">Solve algorithmic puzzles to earn points and improve logical thinking</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-bold">{stats.userPoints} Points</span>
          </div>
          <Badge variant="secondary">Problems Solved: {solvedProblems.length}</Badge>
        </div>
      </div>

      <Tabs defaultValue="solver" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solver">AI Solver</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="tutorial">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="solver" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Problem Input
                </CardTitle>
                <CardDescription>
                  Enter your potion recipes and target potion to find the minimum magical orbs needed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipes">Potion Recipes (one per line)</Label>
                  <Textarea
                    id="recipes"
                    placeholder="awakening = snakefangs + wolfbane&#10;strengthening = awakening + moonstone"
                    value={recipes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRecipes(e.target.value)}
                    className="min-h-32"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: potion_name = ingredient1 + ingredient2
                  </p>
                </div>

                <div>
                  <Label htmlFor="target">Target Potion</Label>
                  <Input
                    id="target"
                    placeholder="awakening"
                    value={targetPotion}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetPotion(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSolve} 
                    disabled={isLoading || !recipes.trim() || !targetPotion.trim()}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Solving...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Solve Problem
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetSolver}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Solution Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Solution
                </CardTitle>
                <CardDescription>
                  AI-powered solution with step-by-step breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {solution ? (
                  <div className="space-y-4">
                    {solution.minOrbs >= 0 ? (
                      <>
                        <div className="text-center p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {solution.minOrbs}
                          </div>
                          <p className="text-gray-700">Minimum Magical Orbs Required</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Solution Steps:</h4>
                          <div className="space-y-2">
                            {solution.steps.map((step: string, index: number) => (
                              <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                <Badge variant="outline" className="min-w-8 h-6 flex items-center justify-center">
                                  {index + 1}
                                </Badge>
                                <span className="text-sm">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Alert>
                          <Lightbulb className="h-4 w-4" />
                          <AlertTitle>Explanation</AlertTitle>
                          <AlertDescription>{solution.explanation}</AlertDescription>
                        </Alert>
                      </>
                    ) : (
                      <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{solution.explanation}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter your problem and click "Solve Problem" to see the solution</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleProblems.map((problem, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{problem.title}</CardTitle>
                    <Badge className={`${getDifficultyColor(problem.difficulty)} text-white`}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{problem.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Recipes:</p>
                      <div className="text-xs bg-gray-50 p-2 rounded">
                        {problem.recipes.slice(0, 2).map((recipe, i) => (
                          <div key={i}>{recipe}</div>
                        ))}
                        {problem.recipes.length > 2 && <div>... and more</div>}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Target: <code className="bg-gray-100 px-1 rounded">{problem.target}</code>
                      </span>
                      {solvedProblems.includes(problem.title) && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ✓ Solved
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => loadSampleProblem(problem)}
                      variant="outline" 
                      className="w-full"
                    >
                      Try This Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tutorial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How the Frankenstein Orb Challenge Works</CardTitle>
              <CardDescription>Understanding the algorithm and problem-solving approach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Problem Overview</h4>
                <p className="text-sm text-gray-600">
                  The Frankenstein Orb Challenge is inspired by graph theory and dynamic programming. 
                  You're given a set of potion recipes (like a dependency graph) and need to find the 
                  minimum number of magical orbs required to create a target potion.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Algorithm Approach</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">1</Badge>
                    <span>Parse recipes to build a dependency graph</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">2</Badge>
                    <span>Use memoization to avoid recalculating subproblems</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">3</Badge>
                    <span>Apply depth-first search with optimization</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">4</Badge>
                    <span>Return minimum orbs and optimal path</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recipe Format</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  <div>potion_name = ingredient1 + ingredient2</div>
                  <div>awakening = snakefangs + wolfbane</div>
                  <div>strengthening = awakening + moonstone</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Educational Value</h4>
                <p className="text-sm text-gray-600">
                  This challenge helps farmers and students understand:
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Graph theory and dependency resolution</li>
                  <li>• Dynamic programming optimization</li>
                  <li>• Resource allocation and planning</li>
                  <li>• Logical thinking and problem decomposition</li>
                </ul>
              </div>

              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Real-world Application</AlertTitle>
                <AlertDescription>
                  Similar algorithms are used in crop rotation planning, supply chain optimization, 
                  and resource allocation in modern agriculture!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}