'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Coffee,
  Package,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Truck,
  History,
  CheckCircle
} from 'lucide-react'

export interface InventoryBatch {
  id: string
  quantity: number
  costPerUnit: number
  dayArrived: number
}

export interface CafeSupplyChaosResult {
  day: number
  revenue: number
  cogs: number
  profit: number
  stockouts: number
}

export interface CafeSupplyChaosProps {
  activity: {
    title?: string
    description?: string
    props: {
      days: number
      shipments: { day: number; quantity: number; costPerUnit: number }[]
      orders: { day: number; quantity: number; pricePerUnit: number }[]
    }
  }
  onComplete?: (results: { method: 'FIFO' | 'LIFO'; sales: CafeSupplyChaosResult[] }) => void
}

export function CafeSupplyChaos({ activity, onComplete }: CafeSupplyChaosProps) {
  const { days, shipments, orders } = activity.props
  const [currentDay, setCurrentDay] = useState(1)
  const [inventory, setInventory] = useState<InventoryBatch[]>([])
  const [method, setMethod] = useState<'FIFO' | 'LIFO' | null>(null)
  const [sales, setSales] = useState<CafeSupplyChaosResult[]>([])
  const [isComplete, setIsComplete] = useState(false)

  // Start the simulation by picking a method
  const startSimulation = (selectedMethod: 'FIFO' | 'LIFO') => {
    setMethod(selectedMethod)
    // Add Day 1 shipment if it exists
    const day1Ship = shipments.find(s => s.day === 1)
    if (day1Ship) {
      setInventory([{
        id: `ship-1`,
        quantity: day1Ship.quantity,
        costPerUnit: day1Ship.costPerUnit,
        dayArrived: 1
      }])
    }
  }

  const handleNextDay = () => {
    if (!method) {
      return
    }

    const dayOrder = orders.find(o => o.day === currentDay)
    let remainingToFill = dayOrder?.quantity || 0
    let costOfGoodsSold = 0
    const tempInventory = [...inventory]

    // Process order based on method
    if (method === 'FIFO') {
      // Oldest first (start of array)
      while (remainingToFill > 0 && tempInventory.length > 0) {
        const batch = tempInventory[0]
        const amountFromBatch = Math.min(batch.quantity, remainingToFill)
        costOfGoodsSold += amountFromBatch * batch.costPerUnit
        remainingToFill -= amountFromBatch
        batch.quantity -= amountFromBatch
        if (batch.quantity === 0) tempInventory.shift()
      }
    } else {
      // Newest first (end of array)
      while (remainingToFill > 0 && tempInventory.length > 0) {
        const batch = tempInventory[tempInventory.length - 1]
        const amountFromBatch = Math.min(batch.quantity, remainingToFill)
        costOfGoodsSold += amountFromBatch * batch.costPerUnit
        remainingToFill -= amountFromBatch
        batch.quantity -= amountFromBatch
        if (batch.quantity === 0) tempInventory.pop()
      }
    }

    const revenue = (dayOrder?.quantity || 0) * (dayOrder?.pricePerUnit || 0)
    const dailyResult = {
      day: currentDay,
      revenue,
      cogs: costOfGoodsSold,
      profit: revenue - costOfGoodsSold,
      stockouts: remainingToFill
    }

    const nextDay = currentDay + 1
    const nextShip = shipments.find(s => s.day === nextDay)
    if (nextShip) {
      tempInventory.push({
        id: `ship-${nextDay}`,
        quantity: nextShip.quantity,
        costPerUnit: nextShip.costPerUnit,
        dayArrived: nextDay
      })
    }

    setSales(prev => [...prev, dailyResult])
    setInventory(tempInventory)

    if (nextDay > days) {
      setIsComplete(true)
      onComplete?.({ method, sales: [...sales, dailyResult] })
    } else {
      setCurrentDay(nextDay)
    }
  }

  const totals = useMemo(() => {
    return sales.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      cogs: acc.cogs + curr.cogs,
      profit: acc.profit + curr.profit
    }), { revenue: 0, cogs: 0, profit: 0 })
  }, [sales])

  const reset = () => {
    setCurrentDay(1)
    setInventory([])
    setMethod(null)
    setSales([])
    setIsComplete(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <Card className="bg-gradient-to-r from-orange-100 to-amber-100 border-orange-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Coffee className="w-8 h-8 text-orange-700" />
            {activity.title || 'Cafe Supply Chaos'}
          </CardTitle>
          <CardDescription className="text-orange-900 text-lg">
            Prices for coffee beans are rising fast! How will you track your costs?
          </CardDescription>
        </CardHeader>
      </Card>

      {!method && (
        <div className="grid md:grid-cols-2 gap-6 py-10">
          <Card className="border-2 hover:border-orange-500 cursor-pointer transition-all" onClick={() => startSimulation('FIFO')}>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Package className="text-orange-600" />
              </div>
              <CardTitle>Method A: FIFO</CardTitle>
              <CardDescription>(First-In, First-Out)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Use the <strong>oldest</strong> beans on the shelf first. Traditional and simple.</p>
              <Button className="w-full mt-4 bg-orange-600">Choose FIFO</Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-500 cursor-pointer transition-all" onClick={() => startSimulation('LIFO')}>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Truck className="text-blue-600" />
              </div>
              <CardTitle>Method B: LIFO</CardTitle>
              <CardDescription>(Last-In, First-Out)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Use the <strong>newest</strong> beans that just arrived. Often used when prices are rising.</p>
              <Button className="w-full mt-4 bg-blue-600">Choose LIFO</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {method && !isComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-slate-200">
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">Day {currentDay} of {days}</Badge>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <History className="w-4 h-4" />
                    Method: <strong className={method === 'FIFO' ? 'text-orange-600' : 'text-blue-600'}>{method}</strong>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-full shadow-sm">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-400 uppercase">Today&apos;s Order</p>
                      <p className="text-2xl font-black text-blue-900">{orders.find(o => o.day === currentDay)?.quantity} Lbs of Coffee</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-blue-400 uppercase">Price</p>
                    <p className="text-2xl font-black text-blue-900">${orders.find(o => o.day === currentDay)?.pricePerUnit}/lb</p>
                  </div>
                </div>

                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Your Shelf (Inventory Batches)
                </h4>
                <div className="space-y-2">
                  {inventory.map((batch, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border flex justify-between items-center ${
                      (method === 'FIFO' && idx === 0) || (method === 'LIFO' && idx === inventory.length - 1)
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-opacity-20'
                        : 'border-slate-200 bg-white opacity-60'
                    }`}>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">Day {batch.dayArrived}</Badge>
                        <span className="font-bold">{batch.quantity} lbs</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-500">Cost: <strong>${batch.costPerUnit}/lb</strong></span>
                        {(method === 'FIFO' && idx === 0) || (method === 'LIFO' && idx === inventory.length - 1) ? (
                          <Badge className="bg-emerald-600 animate-pulse">NEXT UP</Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-8 h-16 text-xl font-black shadow-lg bg-slate-900" onClick={handleNextDay}>
                  Fill Order & Advance Day
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-900 text-white border-0 shadow-xl overflow-hidden">
              <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Totals</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Revenue</p>
                  <p className="text-3xl font-black">${totals.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Cost of Goods (COGS)</p>
                  <p className="text-3xl font-black text-red-400">${totals.cogs.toLocaleString()}</p>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Profit</p>
                  <p className="text-4xl font-black text-emerald-400">${totals.profit.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex gap-2 text-amber-800 mb-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold uppercase">Strategy Alert</p>
              </div>
              <p className="text-sm text-amber-900 leading-tight">
                Prices are <strong>Rising</strong>. {method === 'FIFO' ? 'FIFO uses old costs first, which might make your profit look bigger right now.' : 'LIFO uses the newest, more expensive beans first, which lowers your current profit.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {isComplete && (
        <Card className="border-4 border-slate-900 bg-white shadow-2xl animate-in zoom-in duration-300">
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-900">SIMULATION COMPLETE</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Using the <strong>{method}</strong> method over {days} days of rising prices, Sarah&apos;s café generated:
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border">
                <p className="text-xs font-bold text-slate-500 uppercase">Revenue</p>
                <p className="text-2xl font-black">${totals.revenue.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs font-bold text-red-600 uppercase">COGS</p>
                <p className="text-2xl font-black text-red-700">${totals.cogs.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase">Total Profit</p>
                <p className="text-2xl font-black text-emerald-700">${totals.profit.toLocaleString()}</p>
              </div>
            </div>

            <p className="text-sm text-slate-500 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <strong>The Inventory Lesson:</strong> Even though you sold the same amount of coffee, your <strong>Profit</strong> changes depending on which batch of beans you &quot;counted&quot; first. 
              This choice is why inventory methods like <strong>FIFO</strong> and <strong>LIFO</strong> are so important for taxes and reporting.
            </p>

            <div className="pt-4 flex justify-center gap-4">
              <Button size="lg" className="bg-slate-900 px-10 h-14 text-xl" onClick={() => setIsComplete(false)}>
                Back to Lesson
              </Button>
              <Button variant="outline" size="lg" className="h-14" onClick={reset}>
                Try Other Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
