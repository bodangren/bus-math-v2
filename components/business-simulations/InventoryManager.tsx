/**
 * InventoryManager Component (v2 - Database-driven)
 *
 * Migrated from v1 to work with Supabase activity props.
 * Game configurations come from database instead of hardcoded constants.
 */

'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Package,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle,
  XCircle,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Warehouse,
  BarChart3
} from 'lucide-react'
import type { InventoryManagerActivityProps } from '@/lib/db/schema/activities'

interface Product {
  id: string
  name: string
  icon: React.ReactNode
  quantity: number
  cost: number
  price: number
  demand: 'high' | 'medium' | 'low'
  demandHistory: number[]
  totalSold: number
  totalOrdered: number
}

interface MarketEvent {
  id: string
  type: 'demand_spike' | 'demand_drop' | 'price_change' | 'storage_discount'
  message: string
  productId?: string
  effect: Record<string, unknown>
  duration: number
}

interface GameState {
  cash: number
  day: number
  maxDays: number
  totalRevenue: number
  totalExpenses: number
  storageCost: number
  dailyStorageCost: number
  products: Product[]
  marketEvents: MarketEvent[]
  gameStatus: 'playing' | 'won' | 'lost'
  profitTarget: number
}

interface InventoryManagerProps {
  activity: InventoryManagerActivityProps
  onSubmit?: (data: GameState & { finalProfit: number }) => void
}

const getIconForProduct = (iconName: string) => {
  switch (iconName) {
    case 'laptop':
      return <Laptop className="w-5 h-5" />
    case 'smartphone':
      return <Smartphone className="w-5 h-5" />
    case 'tablet':
      return <Tablet className="w-5 h-5" />
    default:
      return <Package className="w-5 h-5" />
  }
}

export function InventoryManager({ activity, onSubmit }: InventoryManagerProps) {
  const [gameState, setGameState] = useState<GameState>({
    cash: activity.initialState.cash,
    day: activity.initialState.day,
    maxDays: activity.initialState.maxDays,
    totalRevenue: activity.initialState.financials.totalRevenue,
    totalExpenses: activity.initialState.financials.totalExpenses,
    storageCost: activity.initialState.financials.storageCost,
    dailyStorageCost: activity.initialState.financials.dailyStorageCost,
    products: activity.products.map((product) => ({
      ...product,
      icon: getIconForProduct(product.icon)
    })),
    marketEvents: [],
    gameStatus: activity.initialState.gameStatus,
    profitTarget: activity.initialState.profitTarget
  })

  const [notifications, setNotifications] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'warning' | 'error' | 'info'
  }>>([])

  const [showInstructions, setShowInstructions] = useState(false)

  const addNotification = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getDemandMultiplier = (demand: string) => {
    switch (demand) {
      case 'high': return 1.5
      case 'medium': return 1.0
      case 'low': return 0.6
      default: return 1.0
    }
  }

  const simulateDemand = useCallback((product: Product) => {
    const baseUnits = product.name === 'Phones' ? 8 : product.name === 'Laptops' ? 3 : 5
    const demandMultiplier = getDemandMultiplier(product.demand)
    const randomFactor = 0.7 + (Math.random() * 0.6) // 70% to 130% of base

    return Math.floor(baseUnits * demandMultiplier * randomFactor)
  }, [])

  const generateMarketEvent = useCallback(() => {
    const eventTypes = ['demand_spike', 'demand_drop', 'price_change', 'storage_discount']
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as MarketEvent['type']
    const productIndex = Math.floor(Math.random() * gameState.products.length)
    const productName = gameState.products[productIndex]?.name || 'Products'
    const productId = gameState.products[productIndex]?.id

    const events: Record<MarketEvent['type'], Omit<MarketEvent, 'id'>> = {
      demand_spike: {
        type: 'demand_spike',
        message: `High demand for ${productName}! Customers are buying more.`,
        productId: productId,
        effect: { demandBoost: 0.5 },
        duration: 3
      },
      demand_drop: {
        type: 'demand_drop',
        message: `Low interest in ${productName}. Demand has decreased.`,
        productId: productId,
        effect: { demandReduction: 0.3 },
        duration: 2
      },
      price_change: {
        type: 'price_change',
        message: `Market prices for ${productName} are fluctuating.`,
        productId: productId,
        effect: { priceChange: Math.random() > 0.5 ? 50 : -50 },
        duration: 4
      },
      storage_discount: {
        type: 'storage_discount',
        message: 'Storage costs reduced due to warehouse efficiency!',
        effect: { storageDiscount: 0.5 },
        duration: 5
      }
    }

    return {
      ...events[eventType],
      id: `event-${Date.now()}`
    }
  }, [gameState.products])

  const orderStock = useCallback((productId: string, quantity: number) => {
    setGameState(prev => {
      const product = prev.products.find(p => p.id === productId)
      if (!product) return prev

      const totalCost = product.cost * quantity
      if (prev.cash < totalCost) {
        addNotification(`Insufficient funds! Need $${totalCost.toLocaleString()}`, 'error')
        return prev
      }

      const updatedProducts = prev.products.map(p =>
        p.id === productId
          ? {
              ...p,
              quantity: p.quantity + quantity,
              totalOrdered: p.totalOrdered + quantity
            }
          : p
      )

      addNotification(
        `Ordered ${quantity} ${product.name} for $${totalCost.toLocaleString()}`,
        'success'
      )

      return {
        ...prev,
        cash: prev.cash - totalCost,
        totalExpenses: prev.totalExpenses + totalCost,
        products: updatedProducts
      }
    })
  }, [addNotification])

  const advanceDay = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return

    setGameState(prev => {
      const newDay = prev.day + 1
      let dayRevenue = 0
      let dayStorageCost = prev.dailyStorageCost
      const salesReport: string[] = []

      // Apply storage cost discount if active
      const storageEvent = prev.marketEvents.find(e => e.type === 'storage_discount')
      if (storageEvent && typeof storageEvent.effect.storageDiscount === 'number') {
        dayStorageCost *= (1 - storageEvent.effect.storageDiscount)
      }

      // Process sales for each product
      const updatedProducts = prev.products.map(product => {
        let demand = simulateDemand(product)

        // Apply market event effects
        const demandEvent = prev.marketEvents.find(e =>
          e.productId === product.id && (e.type === 'demand_spike' || e.type === 'demand_drop')
        )
        if (demandEvent) {
          if (demandEvent.type === 'demand_spike' && typeof demandEvent.effect.demandBoost === 'number') {
            demand = Math.floor(demand * (1 + demandEvent.effect.demandBoost))
          } else if (demandEvent.type === 'demand_drop' && typeof demandEvent.effect.demandReduction === 'number') {
            demand = Math.floor(demand * (1 - demandEvent.effect.demandReduction))
          }
        }

        const unitsSold = Math.min(demand, product.quantity)
        let salePrice = product.price

        // Apply price change effects
        const priceEvent = prev.marketEvents.find(e =>
          e.productId === product.id && e.type === 'price_change'
        )
        if (priceEvent && typeof priceEvent.effect.priceChange === 'number') {
          salePrice += priceEvent.effect.priceChange
        }

        const revenue = unitsSold * salePrice
        dayRevenue += revenue

        if (unitsSold > 0) {
          salesReport.push(`Sold ${unitsSold} ${product.name} for $${revenue.toLocaleString()}`)
        }
        if (demand > product.quantity && product.quantity === 0) {
          salesReport.push(`Stockout: ${demand - unitsSold} ${product.name} lost sales`)
        }

        // Update demand history (last 5 days)
        const newDemandHistory = [...product.demandHistory.slice(1), demand]

        // Randomly update demand level based on recent sales performance
        let newDemand = product.demand
        const avgDemand = newDemandHistory.reduce((a, b) => a + b, 0) / 5
        const fulfillmentRate = unitsSold / Math.max(demand, 1)

        if (Math.random() < 0.3) { // 30% chance of demand change
          if (avgDemand > 8 && fulfillmentRate > 0.8) {
            newDemand = 'high'
          } else if (avgDemand < 4 || fulfillmentRate < 0.5) {
            newDemand = 'low'
          } else {
            newDemand = 'medium'
          }
        }

        return {
          ...product,
          quantity: product.quantity - unitsSold,
          demand: newDemand,
          demandHistory: newDemandHistory,
          totalSold: product.totalSold + unitsSold
        }
      })

      // Deduct storage costs
      const totalInventory = updatedProducts.reduce((sum, p) => sum + p.quantity, 0)
      const storageExpense = totalInventory > 0 ? dayStorageCost : 0

      // Generate random market event (20% chance)
      const newMarketEvents = prev.marketEvents.map(event => ({
        ...event,
        duration: event.duration - 1
      })).filter(event => event.duration > 0)

      if (Math.random() < 0.2 && newMarketEvents.length < 2) {
        const newEvent = generateMarketEvent()
        newMarketEvents.push(newEvent)
        addNotification(newEvent.message, 'info')
      }

      // Calculate new totals
      const newCash = prev.cash + dayRevenue - storageExpense
      const newTotalRevenue = prev.totalRevenue + dayRevenue
      const newTotalExpenses = prev.totalExpenses + storageExpense
      const newStorageCost = prev.storageCost + storageExpense

      // Show day summary
      salesReport.forEach(report => {
        if (report.includes('Sold')) {
          addNotification(report, 'success')
        } else {
          addNotification(report, 'warning')
        }
      })

      if (storageExpense > 0) {
        addNotification(`Storage costs: $${storageExpense.toLocaleString()}`, 'info')
      }

      // Check game status
      let newGameStatus = prev.gameStatus
      const profit = newTotalRevenue - newTotalExpenses

      if (newDay >= prev.maxDays) {
        if (profit >= prev.profitTarget) {
          newGameStatus = 'won'
        } else {
          newGameStatus = 'lost'
        }
      } else if (newCash < 0) {
        newGameStatus = 'lost'
      }

      return {
        ...prev,
        day: newDay,
        cash: newCash,
        totalRevenue: newTotalRevenue,
        totalExpenses: newTotalExpenses,
        storageCost: newStorageCost,
        products: updatedProducts,
        marketEvents: newMarketEvents,
        gameStatus: newGameStatus
      }
    })
  }, [gameState.gameStatus, simulateDemand, generateMarketEvent, addNotification])

  const resetGame = useCallback(() => {
    setGameState({
      cash: activity.initialState.cash,
      day: activity.initialState.day,
      maxDays: activity.initialState.maxDays,
      totalRevenue: activity.initialState.financials.totalRevenue,
      totalExpenses: activity.initialState.financials.totalExpenses,
      storageCost: activity.initialState.financials.storageCost,
      dailyStorageCost: activity.initialState.financials.dailyStorageCost,
      products: activity.products.map((product) => ({
        ...product,
        icon: getIconForProduct(product.icon)
      })),
      marketEvents: [],
      gameStatus: activity.initialState.gameStatus,
      profitTarget: activity.initialState.profitTarget
    })
    setNotifications([])
    addNotification('Game reset successfully', 'info')
  }, [activity, addNotification])

  const handleSubmit = useCallback(() => {
    if (onSubmit && gameState.gameStatus !== 'playing') {
      const finalProfit = gameState.totalRevenue - gameState.totalExpenses
      onSubmit({
        ...gameState,
        finalProfit
      })
      addNotification('Results submitted successfully!', 'success')
    }
  }, [gameState, onSubmit, addNotification])

  const profit = gameState.totalRevenue - gameState.totalExpenses
  const totalInventoryValue = gameState.products.reduce((sum, p) => sum + (p.quantity * p.cost), 0)
  const inventoryTurnover = gameState.totalRevenue > 0 ? gameState.totalRevenue / Math.max(totalInventoryValue, 1) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Package className="w-8 h-8 text-purple-600" />
            {activity.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {activity.description}
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
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-xl text-purple-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              How to Play Inventory Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Objective */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">🎯 Objective</h4>
              <p className="text-purple-700">
                Manage a retail electronics store for {gameState.maxDays} days. Achieve at least ${gameState.profitTarget.toLocaleString()} profit by balancing
                inventory purchases with customer demand while minimizing storage costs.
              </p>
            </div>

            {/* Product Lines */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">📱 Product Lines</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gameState.products.map((product) => (
                  <div key={product.id} className="p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      {product.icon}
                      <h5 className="font-medium">{product.name}</h5>
                    </div>
                    <div className="text-xs space-y-1">
                      <p><strong>Cost:</strong> ${product.cost} | <strong>Sell:</strong> ${product.price}</p>
                      <p><strong>Profit:</strong> ${product.price - product.cost} per unit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Mechanics */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">⚙️ Game Mechanics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-purple-700">Daily Operations:</h5>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Customer demand simulated automatically</li>
                    <li>• Sales processed from available inventory</li>
                    <li>• Storage costs: ${gameState.dailyStorageCost}/day (if you have inventory)</li>
                    <li>• Demand levels change based on performance</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-purple-700">Market Events:</h5>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Demand spikes increase sales temporarily</li>
                    <li>• Price fluctuations affect profit margins</li>
                    <li>• Storage discounts reduce daily costs</li>
                    <li>• Stockouts result in lost sales</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Strategies */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">💡 Winning Strategies</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-800 mb-1">Conservative Approach</h5>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Start with high-demand products</li>
                    <li>• Keep low inventory to minimize storage costs</li>
                    <li>• Order frequently in small quantities</li>
                    <li>• Focus on inventory turnover rate</li>
                  </ul>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h5 className="font-medium text-orange-800 mb-1">Aggressive Approach</h5>
                  <ul className="text-xs text-orange-700 space-y-1">
                    <li>• Stock up on high-profit margin items</li>
                    <li>• Maintain diverse inventory mix</li>
                    <li>• Take advantage of demand spikes</li>
                    <li>• Build cash reserves for opportunities</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">📊 Key Performance Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-white rounded text-center border">
                  <div className="font-medium">Profit Target</div>
                  <div className="text-purple-600">${gameState.profitTarget.toLocaleString()}</div>
                </div>
                <div className="p-2 bg-white rounded text-center border">
                  <div className="font-medium">Storage Cost</div>
                  <div className="text-orange-600">${gameState.dailyStorageCost}/day</div>
                </div>
                <div className="p-2 bg-white rounded text-center border">
                  <div className="font-medium">Inventory Turnover</div>
                  <div className="text-blue-600">Higher = Better</div>
                </div>
                <div className="p-2 bg-white rounded text-center border">
                  <div className="font-medium">Cash Management</div>
                  <div className="text-green-600">Stay Positive</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Status */}
      {gameState.gameStatus !== 'playing' && (
        <Card className={`border-2 ${gameState.gameStatus === 'won' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {gameState.gameStatus === 'won' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <h3 className={`text-2xl font-bold ${gameState.gameStatus === 'won' ? 'text-green-800' : 'text-red-800'}`}>
                {gameState.gameStatus === 'won' ? 'Business Success!' : 'Game Over'}
              </h3>
            </div>
            <p className={`text-lg ${gameState.gameStatus === 'won' ? 'text-green-700' : 'text-red-700'}`}>
              {gameState.gameStatus === 'won'
                ? `Achieved $${profit.toLocaleString()} profit! Target was $${gameState.profitTarget.toLocaleString()}.`
                : profit < gameState.profitTarget
                  ? `Only made $${profit.toLocaleString()} profit. Target was $${gameState.profitTarget.toLocaleString()}.`
                  : 'Ran out of cash! Better inventory management needed.'
              }
            </p>
            {onSubmit && (
              <Button onClick={handleSubmit} className="mt-4" size="lg">
                Submit Results
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-green-700 font-medium">Cash</p>
            <p className={`text-2xl font-bold ${gameState.cash >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              ${gameState.cash.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700 font-medium">Day</p>
            <p className="text-2xl font-bold text-blue-800">
              {gameState.day} / {gameState.maxDays}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-purple-700 font-medium">Profit</p>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-purple-800' : 'text-red-800'}`}>
              ${profit.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Warehouse className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm text-orange-700 font-medium">Inventory Value</p>
            <p className="text-2xl font-bold text-orange-800">
              ${totalInventoryValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Events */}
      {gameState.marketEvents.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Active Market Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gameState.marketEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="text-sm text-yellow-800">{event.message}</span>
                  <Badge variant="outline" className="text-xs">
                    {event.duration} days left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Inventory
          </CardTitle>
          <CardDescription>
            Monitor stock levels and manage orders for each product line
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gameState.products.map((product) => (
              <Card key={product.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {product.icon}
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </div>
                    <Badge className={getDemandColor(product.demand)}>
                      {product.demand} demand
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stock Level */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">In Stock</p>
                    <p className="text-3xl font-bold text-gray-900">{product.quantity}</p>
                  </div>

                  <Separator />

                  {/* Pricing Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Cost</p>
                      <p className="font-semibold text-red-600">${product.cost}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Price</p>
                      <p className="font-semibold text-green-600">${product.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Profit</p>
                      <p className="font-semibold text-blue-600">${product.price - product.cost}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Margin</p>
                      <p className="font-semibold text-blue-600">
                        {(((product.price - product.cost) / product.price) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Total Sold</p>
                      <p className="font-semibold">{product.totalSold}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Ordered</p>
                      <p className="font-semibold">{product.totalOrdered}</p>
                    </div>
                  </div>

                  {/* Order Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => orderStock(product.id, 5)}
                      disabled={gameState.gameStatus !== 'playing' || gameState.cash < product.cost * 5}
                    >
                      Order 5
                      <span className="text-xs block">
                        ${(product.cost * 5).toLocaleString()}
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => orderStock(product.id, 10)}
                      disabled={gameState.gameStatus !== 'playing' || gameState.cash < product.cost * 10}
                    >
                      Order 10
                      <span className="text-xs block">
                        ${(product.cost * 10).toLocaleString()}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Revenue</p>
              <p className="text-xl font-bold text-blue-800">
                ${gameState.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Expenses</p>
              <p className="text-xl font-bold text-red-800">
                ${gameState.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Storage Costs</p>
              <p className="text-xl font-bold text-orange-800">
                ${gameState.storageCost.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Turnover Rate</p>
              <p className="text-xl font-bold text-purple-800">
                {inventoryTurnover.toFixed(1)}x
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress to Target</span>
              <span className="text-sm text-gray-600">
                ${profit.toLocaleString()} / ${gameState.profitTarget.toLocaleString()}
              </span>
            </div>
            <Progress
              value={Math.min(100, Math.max(0, (profit / gameState.profitTarget) * 100))}
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={advanceDay}
          size="lg"
          className="bg-purple-600 hover:bg-purple-700"
          disabled={gameState.gameStatus !== 'playing'}
        >
          <Calendar className="w-4 h-4 mr-2" />
          End Day
        </Button>
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

export default InventoryManager
