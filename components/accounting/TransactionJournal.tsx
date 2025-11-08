'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Edit, HelpCircle, Plus, Save, Trash2, TrendingUp, AlertCircle, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { JournalEntry } from './JournalEntry';
import type { AccountType, JournalEntryLine } from './accounting-types';

export interface TransactionEntry {
  id: string
  entryNumber: string
  date: string
  description: string
  clientFocus: string
  lines: JournalEntryLine[]
  reference?: string
  isBalanced: boolean
}

interface TransactionJournalProps {
  className?: string
  title?: string
  clientTypes?: string[]
  initialTransactions?: TransactionEntry[]
  maxTransactions?: number
  showAnalytics?: boolean
}

const DEFAULT_CLIENT_TYPES = [
  'Tech Startup',
  'E-commerce Business',
  'Service Provider',
  'Manufacturing',
  'Retail Store',
  'Consulting Firm',
  'Restaurant/Food Service',
  'Creative Agency'
]

const COMMON_ACCOUNTS = [
  { name: 'Cash', type: 'asset' as const },
  { name: 'Accounts Receivable', type: 'asset' as const },
  { name: 'Inventory', type: 'asset' as const },
  { name: 'Equipment', type: 'asset' as const },
  { name: 'Accounts Payable', type: 'liability' as const },
  { name: 'Notes Payable', type: 'liability' as const },
  { name: 'Owner\'s Equity', type: 'equity' as const },
  { name: 'Service Revenue', type: 'revenue' as const },
  { name: 'Sales Revenue', type: 'revenue' as const },
  { name: 'Rent Expense', type: 'expense' as const },
  { name: 'Utilities Expense', type: 'expense' as const },
  { name: 'Supplies Expense', type: 'expense' as const }
]

export function TransactionJournal({
  className,
  title = "Startup Transaction Journal",
  clientTypes = DEFAULT_CLIENT_TYPES,
  initialTransactions = [],
  maxTransactions = 10,
  showAnalytics = true
}: TransactionJournalProps) {
  const [transactions, setTransactions] = useState<TransactionEntry[]>(initialTransactions)
  const [selectedClientFocus, setSelectedClientFocus] = useState<string>(clientTypes[0])
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  
  // New transaction form state
  const [newTransaction, setNewTransaction] = useState<Partial<TransactionEntry>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    clientFocus: selectedClientFocus,
    lines: []
  })

  const generateEntryNumber = () => {
    const nextNumber = transactions.length + 1
    return `JE${String(nextNumber).padStart(3, '0')}`
  }

  const calculateBalance = (lines: JournalEntryLine[]) => {
    const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
    return Math.abs(totalDebits - totalCredits) < 0.01
  }

  const addJournalLine = () => {
    const newLine: JournalEntryLine = {
      id: Date.now().toString(),
      account: '',
      accountType: 'asset',
      debit: undefined,
      credit: undefined,
      description: ''
    }
    setNewTransaction(prev => ({
      ...prev,
      lines: [...(prev.lines || []), newLine]
    }))
  }

  const updateJournalLine = (lineId: string, updates: Partial<JournalEntryLine>) => {
    setNewTransaction(prev => ({
      ...prev,
      lines: prev.lines?.map(line => 
        line.id === lineId ? { ...line, ...updates } : line
      )
    }))
  }

  const removeJournalLine = (lineId: string) => {
    setNewTransaction(prev => ({
      ...prev,
      lines: prev.lines?.filter(line => line.id !== lineId)
    }))
  }

  const saveTransaction = () => {
    if (!newTransaction.description || !newTransaction.lines?.length) return

    const transaction: TransactionEntry = {
      id: Date.now().toString(),
      entryNumber: generateEntryNumber(),
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      description: newTransaction.description,
      clientFocus: newTransaction.clientFocus || selectedClientFocus,
      lines: newTransaction.lines,
      isBalanced: calculateBalance(newTransaction.lines)
    }

    setTransactions(prev => [...prev, transaction])
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      clientFocus: selectedClientFocus,
      lines: []
    })
    setIsAddingTransaction(false)
  }

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId))
  }

  const getAnalytics = () => {
    const totalTransactions = transactions.length
    const balancedTransactions = transactions.filter(t => t.isBalanced).length
    const unbalancedTransactions = totalTransactions - balancedTransactions
    const balanceRate = totalTransactions > 0 ? (balancedTransactions / totalTransactions) * 100 : 0
    
    const accountsUsed = new Set()
    transactions.forEach(t => t.lines.forEach(l => accountsUsed.add(l.account)))
    
    return {
      totalTransactions,
      balancedTransactions,
      unbalancedTransactions,
      balanceRate,
      uniqueAccounts: accountsUsed.size
    }
  }

  const analytics = getAnalytics()

  return (
    <div className={cn("w-full max-w-6xl space-y-6", className)}>
      {/* Header with Client Focus Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {title}
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                How to Use
                {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Badge variant="outline" className="text-sm">
                {selectedClientFocus}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientFocus">Client Focus</Label>
              <select
                id="clientFocus"
                value={selectedClientFocus}
                onChange={(e) => setSelectedClientFocus(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {clientTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-1">
                {"Choose your startup's business focus to tailor transaction examples and account suggestions."}
              </p>
            </div>

            {showAnalytics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalTransactions}</div>
                  <div className="text-sm text-gray-600">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.balancedTransactions}</div>
                  <div className="text-sm text-gray-600">Balanced</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analytics.unbalancedTransactions}</div>
                  <div className="text-sm text-gray-600">Unbalanced</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.balanceRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions Panel */}
      {showInstructions && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              How to Use the Transaction Journal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Objective */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Learning Objective</h4>
              <p className="text-blue-700">
                {'Master the fundamentals of double-entry bookkeeping by recording and validating business transactions for your chosen startup type. Build a self-auditing ledger system that demonstrates "clean books" for potential angel investors in Unit 1: Smart Ledger Launch.'}
              </p>
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">📋 Step-by-Step Instructions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <h5 className="font-medium text-blue-800">Choose Your Client Focus</h5>
                    </div>
                    <p className="text-xs text-blue-600">Select your startup type from the dropdown to get tailored account suggestions and realistic transaction examples.</p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <h5 className="font-medium text-blue-800">Add New Transaction</h5>
                    </div>
                    <p className="text-xs text-blue-600">{'Click "Add New Transaction" button and fill in the date, description, and transaction details.'}</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <h5 className="font-medium text-blue-800">Create Journal Lines</h5>
                    </div>
                    <p className="text-xs text-blue-600">Add journal entry lines by selecting accounts, account types, and entering debit or credit amounts.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <h5 className="font-medium text-blue-800">Validate Balance</h5>
                    </div>
                    <p className="text-xs text-blue-600">Ensure debits equal credits. The system provides real-time feedback on transaction balance.</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                      <h5 className="font-medium text-blue-800">Track Analytics</h5>
                    </div>
                    <p className="text-xs text-blue-600">Monitor your accuracy rate, total entries, and balanced transactions in the analytics dashboard.</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</div>
                      <h5 className="font-medium text-blue-800">Review & Edit</h5>
                    </div>
                    <p className="text-xs text-blue-600">Edit or delete transactions as needed. Each entry shows detailed journal information with validation.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Learning Outcomes */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">🎓 Key Learning Outcomes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-700">Master double-entry bookkeeping principles and the accounting equation</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-700">Understand how different account types (assets, liabilities, equity, revenue, expenses) behave</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-700">Practice real-world transaction recording for startups</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-700">Develop accuracy in financial record-keeping for investor presentations</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-700">{'Build confidence in maintaining "clean books" from day one'}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-700">Create self-auditing ledger systems with built-in error checking</p>
                </div>
              </div>
            </div>

            {/* Account Types Quick Reference */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">📊 Account Types Quick Reference</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="p-3 bg-white rounded-lg border border-blue-200 text-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full mx-auto mb-2 flex items-center justify-center font-bold">A</div>
                  <h5 className="font-medium text-blue-800 text-sm">Assets</h5>
                  <p className="text-xs text-blue-600 mt-1">↑ Debit<br/>↓ Credit</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-200 text-center">
                  <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full mx-auto mb-2 flex items-center justify-center font-bold">L</div>
                  <h5 className="font-medium text-blue-800 text-sm">Liabilities</h5>
                  <p className="text-xs text-blue-600 mt-1">↓ Debit<br/>↑ Credit</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-200 text-center">
                  <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full mx-auto mb-2 flex items-center justify-center font-bold">E</div>
                  <h5 className="font-medium text-blue-800 text-sm">Equity</h5>
                  <p className="text-xs text-blue-600 mt-1">↓ Debit<br/>↑ Credit</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-200 text-center">
                  <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full mx-auto mb-2 flex items-center justify-center font-bold">R</div>
                  <h5 className="font-medium text-blue-800 text-sm">Revenue</h5>
                  <p className="text-xs text-blue-600 mt-1">↓ Debit<br/>↑ Credit</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-200 text-center">
                  <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full mx-auto mb-2 flex items-center justify-center font-bold">X</div>
                  <h5 className="font-medium text-blue-800 text-sm">Expenses</h5>
                  <p className="text-xs text-blue-600 mt-1">↑ Debit<br/>↓ Credit</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Transaction Section */}
      {isAddingTransaction && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add New Transaction</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingTransaction(false)}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Initial investment from founder"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            {/* Journal Lines */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Journal Entry Lines</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addJournalLine}
                >
                  <Plus className="h-4 w-4" />
                  Add Line
                </Button>
              </div>

              {newTransaction.lines?.map((line) => (
                <div key={line.id} className="grid grid-cols-12 gap-2 p-3 border border-gray-200 rounded-lg">
                  <div className="col-span-3">
                    <select
                      value={line.account}
                      onChange={(e) => updateJournalLine(line.id, { account: e.target.value })}
                      className="w-full p-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="">Select Account</option>
                      {COMMON_ACCOUNTS.map(account => (
                        <option key={account.name} value={account.name}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <select
                      value={line.accountType}
                      onChange={(e) => updateJournalLine(line.id, { accountType: e.target.value as AccountType })}
                      className="w-full p-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="asset">Asset</option>
                      <option value="liability">Liability</option>
                      <option value="equity">Equity</option>
                      <option value="revenue">Revenue</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Debit"
                      value={line.debit || ''}
                      onChange={(e) => updateJournalLine(line.id, { 
                        debit: e.target.value ? parseFloat(e.target.value) : undefined,
                        credit: undefined
                      })}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Credit"
                      value={line.credit || ''}
                      onChange={(e) => updateJournalLine(line.id, { 
                        credit: e.target.value ? parseFloat(e.target.value) : undefined,
                        debit: undefined
                      })}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Description"
                      value={line.description || ''}
                      onChange={(e) => updateJournalLine(line.id, { description: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJournalLine(line.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}

              {newTransaction.lines && newTransaction.lines.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  {calculateBalance(newTransaction.lines) ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Entry is balanced</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Entry is not balanced</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddingTransaction(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={saveTransaction}
                disabled={!newTransaction.description || !newTransaction.lines?.length || !calculateBalance(newTransaction.lines || [])}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Transaction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Transaction Button */}
      {!isAddingTransaction && transactions.length < maxTransactions && (
        <div className="flex justify-center">
          <Button onClick={() => setIsAddingTransaction(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Transaction
          </Button>
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="relative">
            <JournalEntry
              entryNumber={transaction.entryNumber}
              date={transaction.date}
              description={transaction.description}
              lines={transaction.lines}
              reference={transaction.clientFocus}
              showValidation={true}
              showExplanation={false}
              showAccountTypes={true}
              interactive={true}
              title={`Transaction #${transaction.entryNumber}`}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingTransaction(transaction.id)}
                disabled={editingTransaction === transaction.id}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTransaction(transaction.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && !isAddingTransaction && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Transactions Yet</h3>
            <p className="text-gray-500 mb-4">
              {"Start building your startup's financial records by adding your first transaction."}
            </p>
            <Button onClick={() => setIsAddingTransaction(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Transaction
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Educational Notes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Smart Ledger Best Practices</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• Every transaction must be balanced (debits = credits)</div>
            <div>• Use clear, descriptive transaction descriptions</div>
            <div>• Choose the correct account types for your business model</div>
            <div>• Maintain consistent recording practices for investor confidence</div>
            <div>• Review and validate entries before finalizing</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionJournal
