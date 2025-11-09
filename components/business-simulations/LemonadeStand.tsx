/**
 * LemonadeStand Component
 * 
 * DEVELOPER USAGE:
 * ================
 * Import and use this component in any React page or component:
 * 
 * ```tsx
 * import { LemonadeStand } from '@/components/business-simulations/LemonadeStand'
 * 
 * export default function MyPage() {
 *   return (
 *     <div>
 *       <LemonadeStand />
 *     </div>
 *   )
 * }
 * ```
 * 
 * The component is fully self-contained with its own state management.
 * No props are required - it initializes with default values.
 * 
 * STUDENT INTERACTION & LEARNING OBJECTIVES:
 * ==========================================
 * 
 * OBJECTIVE: Students learn fundamental business concepts through running
 * a lemonade stand: profit/loss, pricing strategy, inventory management,
 * customer satisfaction, and external factors (weather) affecting business.
 * 
 * HOW STUDENTS INTERACT:
 * 1. **Monitor Business Dashboard**: Students see current cash ($50 starting),
 *    day counter, total revenue, and profit/loss calculations.
 * 
 * 2. **Purchase Supplies**: Students buy ingredients with different costs:
 *    - LEMONS: $3.00 for 10 lemons (bag)
 *    - SUGAR: $2.00 for 10 units (bag) 
 *    - CUPS: $1.50 for 20 cups (pack)
 * 
 * 3. **Manage Inventory**: Track remaining supplies:
 *    - Monitor current stock levels of lemons, sugar, and cups
 *    - Calculate maximum lemonade cups possible from current inventory
 *    - Balance purchasing decisions with cash flow
 * 
 * 4. **Create Recipe & Set Pricing**:
 *    - Adjust lemons per cup (1-5, affects taste and cost)
 *    - Adjust sugar per cup (0-3, affects taste and cost)
 *    - Set selling price per cup ($0.25-$5.00)
 *    - Receive real-time feedback on recipe quality and pricing strategy
 * 
 * 5. **React to Weather Conditions**: 
 *    - Weather changes daily and affects customer demand:
 *      * ☀️ Sunny: +50% demand boost
 *      * 🔥 Hot: +100% demand boost  
 *      * ☁️ Cloudy: -20% demand reduction
 *      * 🌧️ Rainy: -70% demand reduction
 * 
 * 6. **Daily Sales Simulation**: Click "Start Selling!" to begin:
 *    - Animated sales progress bar shows customers buying
 *    - Real-time updates of cups sold and revenue earned
 *    - Must have sufficient supplies to make lemonade
 * 
 * 7. **Daily Business Reports**: After each sales day:
 *    - Cups sold vs potential demand
 *    - Total revenue for the day
 *    - Cost of goods sold (ingredient costs per cup)
 *    - Daily profit/loss calculation
 *    - Customer satisfaction feedback
 * 
 * 8. **Strategic Optimization**: Students learn to:
 *    - Balance ingredient costs with selling price for profit
 *    - Adjust pricing based on weather forecasts
 *    - Manage cash flow between purchasing and sales
 *    - Optimize recipe for customer satisfaction vs cost
 * 
 * KEY LEARNING OUTCOMES:
 * - Understanding revenue vs profit concepts
 * - Price elasticity and demand sensitivity
 * - Cost of Goods Sold (COGS) calculations
 * - Inventory management and cash flow
 * - External factors affecting business (weather = market conditions)
 * - Customer satisfaction and repeat business
 * - Strategic decision-making in uncertain conditions
 * - Basic financial statements: revenue, expenses, profit
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  DollarSign, 
  Calendar, 
  TrendingUp,
  ShoppingCart,
  Package,
  Coffee,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Play,
  BarChart3,
  Users,
  Smile,
  Frown
} from 'lucide-react'

import type { Activity } from '@/lib/db/schema/validators'
import type { LemonadeStandActivityProps } from '@/lib/db/schema/activities'

export type LemonadeStandActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'lemonade-stand'
  props: LemonadeStandActivityProps
}

export interface LemonadeStandState {
  cash: number
  day: number
  revenue: number
  expenses: number
  inventory: {
    lemons: number
    sugar: number
    cups: number
  }
  recipe: {
    lemons: number
    sugar: number
    price: number
  }
  weather: string
  customerSatisfaction: number
  isSellingActive: boolean
  dailySales: {
    cupsSold: number
    dailyRevenue: number
    dailyExpenses: number
  }
  gameStatus: 'playing' | 'ended'
}

interface LemonadeStandProps {
  activity: LemonadeStandActivity
  initialState?: Partial<LemonadeStandState>
  onStateChange?: (state: LemonadeStandState) => void
}

type SupplyId = LemonadeStandActivityProps['supplyOptions'][number]['id']

const cloneStateFromConfig = (state: LemonadeStandActivityProps['initialState']): LemonadeStandState => ({
  ...state,
  inventory: { ...state.inventory },
  recipe: { ...state.recipe },
  dailySales: { ...state.dailySales }
})

const mergeState = (base: LemonadeStandState, override?: Partial<LemonadeStandState>): LemonadeStandState => {
  if (!override) {
    return { ...base, inventory: { ...base.inventory }, recipe: { ...base.recipe }, dailySales: { ...base.dailySales } }
  }

  return {
    cash: override.cash ?? base.cash,
    day: override.day ?? base.day,
    revenue: override.revenue ?? base.revenue,
    expenses: override.expenses ?? base.expenses,
    inventory: {
      lemons: override.inventory?.lemons ?? base.inventory.lemons,
      sugar: override.inventory?.sugar ?? base.inventory.sugar,
      cups: override.inventory?.cups ?? base.inventory.cups
    },
    recipe: {
      lemons: override.recipe?.lemons ?? base.recipe.lemons,
      sugar: override.recipe?.sugar ?? base.recipe.sugar,
      price: override.recipe?.price ?? base.recipe.price
    },
    weather: override.weather ?? base.weather,
    customerSatisfaction: override.customerSatisfaction ?? base.customerSatisfaction,
    isSellingActive: override.isSellingActive ?? base.isSellingActive,
    dailySales: {
      cupsSold: override.dailySales?.cupsSold ?? base.dailySales.cupsSold,
      dailyRevenue: override.dailySales?.dailyRevenue ?? base.dailySales.dailyRevenue,
      dailyExpenses: override.dailySales?.dailyExpenses ?? base.dailySales.dailyExpenses
    },
    gameStatus: override.gameStatus ?? base.gameStatus
  }
}

export function LemonadeStand({ activity, initialState, onStateChange }: LemonadeStandProps) {
  const baseState = useMemo(() => cloneStateFromConfig(activity.props.initialState), [activity.props.initialState])
  const [gameState, setGameState] = useState<LemonadeStandState>(() => mergeState(baseState, initialState))
  const [showInstructions, setShowInstructions] = useState(false)
  const [notifications, setNotifications] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'warning' | 'error' | 'info'
  }>>([])
  const [salesProgress, setSalesProgress] = useState(0)
  const salesIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const heroDescription = activity.description ?? activity.props.description
  const supplyOptions = activity.props.supplyOptions
  const supplyLookup = useMemo(
    () => Object.fromEntries(supplyOptions.map((option) => [option.id, option])),
    [supplyOptions]
  )
  const weatherPatterns = activity.props.weatherPatterns
  const weatherLookup = useMemo(
    () => Object.fromEntries(weatherPatterns.map((pattern) => [pattern.id, pattern])),
    [weatherPatterns]
  )
  const ingredientCosts = activity.props.ingredientCosts
  const demandConfig = activity.props.demand
  const recipeGuidance = activity.props.recipeGuidance

  useEffect(() => {
    setGameState(mergeState(baseState, initialState))
    setSalesProgress(0)
    setNotifications([])
    if (salesIntervalRef.current) {
      clearInterval(salesIntervalRef.current)
      salesIntervalRef.current = null
    }
  }, [baseState, initialState])

  useEffect(() => {
    return () => {
      if (salesIntervalRef.current) {
        clearInterval(salesIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    onStateChange?.(gameState)
  }, [gameState, onStateChange])

  const addNotification = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 4000)
  }, [])

  const buySupply = useCallback((supplyId: SupplyId) => {
    const config = supplyLookup[supplyId]
    if (!config) {
      return
    }

    if (gameState.cash < config.cost) {
      addNotification(`Not enough cash! Need $${config.cost.toFixed(2)}`, 'error')
      return
    }

    setGameState(prev => ({
      ...prev,
      cash: prev.cash - config.cost,
      expenses: prev.expenses + config.cost,
      inventory: {
        ...prev.inventory,
        [supplyId]: prev.inventory[supplyId] + config.quantity
      }
    }))

    addNotification(`Bought ${config.quantity} ${config.label} for $${config.cost.toFixed(2)}`, 'success')
  }, [gameState.cash, supplyLookup, addNotification])

  const updateRecipe = useCallback((field: keyof LemonadeStandState['recipe'], value: number) => {
    setGameState(prev => ({
      ...prev,
      recipe: {
        ...prev.recipe,
        [field]: value
      }
    }))
  }, [])

  const getRecipeFeedback = useCallback(() => {
    const { lemons, sugar, price } = gameState.recipe
    const totalIngredients = lemons + sugar

    if (totalIngredients < recipeGuidance.minimumStrength) {
      return { message: "Recipe too weak - customers won't like it!", color: 'text-red-600', icon: <Frown className="w-4 h-4" /> }
    } else if (totalIngredients > recipeGuidance.maximumStrength) {
      return { message: "Recipe too strong - too expensive to make!", color: 'text-red-600', icon: <Frown className="w-4 h-4" /> }
    } else if (price < recipeGuidance.minimumPrice) {
      return { message: "Price too low - you won't make profit!", color: 'text-red-600', icon: <Frown className="w-4 h-4" /> }
    } else if (price > recipeGuidance.maximumPrice) {
      return { message: "Price too high - customers won't buy!", color: 'text-red-600', icon: <Frown className="w-4 h-4" /> }
    } else {
      return { message: "Great recipe and pricing!", color: 'text-green-600', icon: <Smile className="w-4 h-4" /> }
    }
  }, [gameState.recipe, recipeGuidance])

  const getMaxCupsFromInventory = useCallback(() => {
    const { lemons, sugar, cups } = gameState.inventory
    const { lemons: lemonsPerCup, sugar: sugarPerCup } = gameState.recipe
    
    return Math.min(
      cups,
      Math.floor(lemons / lemonsPerCup),
      sugarPerCup > 0 ? Math.floor(sugar / sugarPerCup) : cups
    )
  }, [gameState.inventory, gameState.recipe])

  const generateRandomWeather = useCallback(() => {
    if (weatherPatterns.length === 0) {
      return gameState.weather
    }
    const index = Math.floor(Math.random() * weatherPatterns.length)
    return weatherPatterns[index]?.id ?? gameState.weather
  }, [weatherPatterns, gameState.weather])

  const completeSales = useCallback((cupsSold: number) => {
    const dailyRevenue = cupsSold * gameState.recipe.price
    const ingredientCost =
      cupsSold *
      (gameState.recipe.lemons * ingredientCosts.lemons +
        gameState.recipe.sugar * ingredientCosts.sugar +
        ingredientCosts.cup)

    setGameState(prev => ({
      ...prev,
      revenue: prev.revenue + dailyRevenue,
      inventory: {
        lemons: prev.inventory.lemons - cupsSold * prev.recipe.lemons,
        sugar: prev.inventory.sugar - cupsSold * prev.recipe.sugar,
        cups: prev.inventory.cups - cupsSold
      },
      dailySales: {
        cupsSold,
        dailyRevenue,
        dailyExpenses: ingredientCost
      },
      isSellingActive: false
    }))

    if (cupsSold > 30) {
      addNotification('🎉 Amazing sales day! Customers loved your lemonade!', 'success')
    } else if (cupsSold > 15) {
      addNotification('👍 Good sales! Customers were satisfied.', 'success')
    } else {
      addNotification('😕 Slow sales day. Try adjusting your recipe or pricing.', 'warning')
    }

    addNotification(`Sold ${cupsSold} cups for $${dailyRevenue.toFixed(2)}!`, 'success')
  }, [addNotification, gameState.recipe, ingredientCosts])

  const simulateSales = useCallback(() => {
    const maxCups = getMaxCupsFromInventory()
    if (maxCups <= 0) {
      addNotification('Not enough supplies to make lemonade!', 'error')
      return
    }

    const newWeather = generateRandomWeather()

    setGameState(prev => ({ ...prev, weather: newWeather, isSellingActive: true }))
    setSalesProgress(0)

    const weatherEffect = weatherLookup[newWeather] ?? { multiplier: 1, emoji: '⛅', description: 'Normal demand' }
    let demandMultiplier = weatherEffect.multiplier

    if (gameState.recipe.price > demandConfig.priceSensitivity.highPriceThreshold) {
      demandMultiplier *= demandConfig.priceSensitivity.highPriceMultiplier
    }
    if (gameState.recipe.price < demandConfig.priceSensitivity.lowPriceThreshold) {
      demandMultiplier *= demandConfig.priceSensitivity.lowPriceMultiplier
    }

    const recipeQuality = (gameState.recipe.lemons + gameState.recipe.sugar) / 4
    demandMultiplier *= Math.max(
      demandConfig.recipeQualityRange.min,
      Math.min(demandConfig.recipeQualityRange.max, recipeQuality)
    )

    const customerRange = Math.max(0, demandConfig.baseCustomers.max - demandConfig.baseCustomers.min)
    const potentialCustomers = Math.floor(Math.random() * (customerRange || 1) + demandConfig.baseCustomers.min)
    const actualCustomers = Math.min(maxCups, Math.floor(potentialCustomers * demandMultiplier))

    addNotification(`${weatherEffect.emoji} ${weatherEffect.description}`, 'info')

    if (salesIntervalRef.current) {
      clearInterval(salesIntervalRef.current)
    }

    let progress = 0
    salesIntervalRef.current = setInterval(() => {
      progress += Math.random() * 15 + 5
      setSalesProgress(Math.min(100, progress))

      if (progress >= 100) {
        if (salesIntervalRef.current) {
          clearInterval(salesIntervalRef.current)
        }
        completeSales(actualCustomers)
      }
    }, 300)
  }, [
    addNotification,
    demandConfig,
    gameState.recipe,
    generateRandomWeather,
    getMaxCupsFromInventory,
    weatherLookup,
    completeSales
  ])

  const endDay = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      day: prev.day + 1,
      dailySales: { cupsSold: 0, dailyRevenue: 0, dailyExpenses: 0 }
    }))
    setSalesProgress(0)
  }, [])

  const resetGame = useCallback(() => {
    setGameState(cloneStateFromConfig(activity.props.initialState))
    setSalesProgress(0)
    setNotifications([])
    addNotification('Game reset successfully!', 'info')
  }, [activity.props.initialState, addNotification])

  const profit = gameState.revenue - gameState.expenses
  const recipeFeedback = getRecipeFeedback()
  const maxCups = getMaxCupsFromInventory()
  const weatherInfo = weatherLookup[gameState.weather] ?? { emoji: '⛅', description: 'Normal demand', multiplier: 1 }
  const costPerCup =
    gameState.recipe.lemons * ingredientCosts.lemons +
    gameState.recipe.sugar * ingredientCosts.sugar +
    ingredientCosts.cup
  const profitPerCup = gameState.recipe.price - costPerCup

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            {activity.props.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {heroDescription}
          </CardDescription>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              How to Play
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions Panel */}
      {showInstructions && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              {`How to Play ${activity.props.title}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Objective */}
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">🎯 Objective</h4>
              <p className="text-yellow-700">
                Run a profitable lemonade stand by managing inventory, creating the perfect recipe, 
                setting optimal prices, and adapting to changing weather conditions!
              </p>
            </div>

            {/* Game Flow */}
            <div>
              <h4 className="font-semibold text-yellow-800 mb-3">🔄 Game Flow</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-yellow-700">1. Purchase Supplies:</h5>
                  <ul className="text-sm text-yellow-600 space-y-1">
                    {supplyOptions.map((option) => (
                      <li key={option.id}>
                        • {option.label}: ${option.cost.toFixed(2)} for {option.quantity} {option.unit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-yellow-700">2. Create Recipe:</h5>
                  <ul className="text-sm text-yellow-600 space-y-1">
                    <li>• Adjust lemons per cup (1-5)</li>
                    <li>• Adjust sugar per cup (0-3)</li>
                    <li>• Set selling price ($0.25-$5.00)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Weather Effects */}
            <div>
              <h4 className="font-semibold text-yellow-800 mb-3">🌤️ Weather Impact</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {weatherPatterns.map((pattern) => (
                  <div key={pattern.id} className="p-2 bg-white rounded border text-center text-xs">
                    <div className="text-lg mb-1">{pattern.emoji}</div>
                    <div className="font-medium capitalize">{pattern.id}</div>
                    <div className="text-gray-600">
                      {pattern.multiplier > 1 ? '+' : ''}
                      {((pattern.multiplier - 1) * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Tips */}
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Success Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-800 mb-1">Recipe Balance</h5>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Too few ingredients = weak taste</li>
                    <li>• Too many ingredients = high costs</li>
                    <li>• Sweet spot: 2-4 total ingredients</li>
                  </ul>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-1">Pricing Strategy</h5>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Consider weather for pricing</li>
                    <li>• High prices = fewer customers</li>
                    <li>• Low prices = less profit per cup</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-green-700 font-medium">Cash</p>
            <p className={`text-2xl font-bold ${gameState.cash >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              ${gameState.cash.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700 font-medium">Day</p>
            <p className="text-2xl font-bold text-blue-800">{gameState.day}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-purple-700 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-800">
              ${gameState.revenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm text-orange-700 font-medium">Profit</p>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-orange-800' : 'text-red-800'}`}>
              ${profit.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weather Display */}
      <Card className="bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-4xl">{weatherInfo.emoji}</div>
            <div>
              <h3 className="text-lg font-semibold text-sky-800 capitalize">
                Today&apos;s Weather: {gameState.weather}
              </h3>
              <p className="text-sky-600">{weatherInfo.description}</p>
              <p className="text-sm text-sky-500">
                Customer demand: {weatherInfo.multiplier > 1 ? '+' : ''}{((weatherInfo.multiplier - 1) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supply Shopping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Buy Supplies
            </CardTitle>
            <CardDescription>Purchase ingredients for your lemonade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplyOptions.map((option) => (
              <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{option.label} ({option.unit})</div>
                  <div className="text-sm text-gray-600">
                    {option.quantity} units - ${option.cost.toFixed(2)}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => buySupply(option.id)}
                  disabled={gameState.cash < option.cost}
                >
                  Buy
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventory
            </CardTitle>
            <CardDescription>Current supplies in stock</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl mb-1">🍋</div>
                <div className="font-semibold">{gameState.inventory.lemons}</div>
                <div className="text-xs text-gray-600">Lemons</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl mb-1">🍬</div>
                <div className="font-semibold">{gameState.inventory.sugar}</div>
                <div className="text-xs text-gray-600">Sugar</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-1">🥤</div>
                <div className="font-semibold">{gameState.inventory.cups}</div>
                <div className="text-xs text-gray-600">Cups</div>
              </div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Max cups possible:</div>
              <div className="text-lg font-bold text-gray-800">{maxCups}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipe & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Recipe & Pricing
          </CardTitle>
          <CardDescription>Adjust your lemonade recipe and set the selling price</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="lemons">Lemons per cup</Label>
              <Input
                id="lemons"
                type="number"
                min="1"
                max="5"
                value={gameState.recipe.lemons}
                onChange={(e) => updateRecipe('lemons', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sugar">Sugar per cup</Label>
              <Input
                id="sugar"
                type="number"
                min="0"
                max="3"
                value={gameState.recipe.sugar}
                onChange={(e) => updateRecipe('sugar', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per cup ($)</Label>
              <Input
                id="price"
                type="number"
                min="0.25"
                max="5.00"
                step="0.25"
                value={gameState.recipe.price}
                onChange={(e) => updateRecipe('price', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Recipe Feedback</h4>
              <div className={`flex items-center gap-2 ${recipeFeedback.color}`}>
                {recipeFeedback.icon}
                <span className="text-sm">{recipeFeedback.message}</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Cost Analysis</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Cost per cup:</span>
                  <span className="ml-2 font-semibold text-red-600">
                    ${costPerCup.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Profit per cup:</span>
                  <span className={`ml-2 font-semibold ${profitPerCup >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${profitPerCup.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Section */}
      {gameState.isSellingActive && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Selling Lemonade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={salesProgress} className="h-4" />
              <div className="text-center">
                <div className="text-sm text-blue-600">Sales in progress...</div>
                <div className="text-xs text-blue-500">
                  Customers are trying your lemonade!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Report */}
      {gameState.dailySales.cupsSold > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Daily Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">
                  {gameState.dailySales.cupsSold}
                </div>
                <div className="text-sm text-green-600">Cups Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">
                  ${gameState.dailySales.dailyRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-green-600">Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  ${gameState.dailySales.dailyExpenses.toFixed(2)}
                </div>
                <div className="text-sm text-red-600">Expenses</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${(gameState.dailySales.dailyRevenue - gameState.dailySales.dailyExpenses) >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                  ${(gameState.dailySales.dailyRevenue - gameState.dailySales.dailyExpenses).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Daily Profit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Controls */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={simulateSales}
          size="lg"
          className="bg-yellow-500 hover:bg-yellow-600"
          disabled={gameState.isSellingActive || maxCups <= 0}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Selling!
        </Button>
        
        {gameState.dailySales.cupsSold > 0 && (
          <Button 
            onClick={endDay}
            size="lg"
            variant="outline"
          >
            <Calendar className="w-4 h-4 mr-2" />
            End Day
          </Button>
        )}
        
        <Button 
          onClick={resetGame} 
          variant="outline" 
          size="lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Game
        </Button>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`
              max-w-sm border-l-4 ${
                notification.type === 'success' ? 'border-l-green-500 bg-green-50' :
                notification.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                notification.type === 'error' ? 'border-l-red-500 bg-red-50' :
                'border-l-blue-500 bg-blue-50'
              }
            `}>
              <CardContent className="p-3">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' :
                  notification.type === 'warning' ? 'text-yellow-800' :
                  notification.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
export default LemonadeStand
