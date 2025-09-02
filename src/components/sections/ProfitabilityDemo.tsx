import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const ProfitabilityDemo = () => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentView, setCurrentView] = useState<'before' | 'after'>('before')

  // Sample cafe economics
  const coffeePrice = 4.50
  const beforeCosts = {
    beans: 0.85,
    labor: 1.20,
    overhead: 0.65,
    cupLid: 0.35, // This is what BrandPak eliminates
    other: 0.25
  }

  const afterCosts = {
    beans: 0.85,
    labor: 1.20,
    overhead: 0.65,
    cupLid: 0.00, // BrandPak provides these free
    other: 0.25
  }

  const beforeProfit = coffeePrice - Object.values(beforeCosts).reduce((a, b) => a + b, 0)
  const afterProfit = coffeePrice - Object.values(afterCosts).reduce((a, b) => a + b, 0)
  const profitIncrease = afterProfit - beforeProfit

  const handleAnimation = () => {
    setIsAnimating(true)
    setCurrentView('before')
    
    setTimeout(() => {
      setCurrentView('after')
    }, 2000)
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 4000)
  }

  useEffect(() => {
    // Auto-start animation on mount
    const timer = setTimeout(handleAnimation, 1000)
    
    // Auto-restart animation every 8 seconds
    const interval = setInterval(handleAnimation, 8000)
    
    // Intersection observer to restart when in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAnimating) {
            handleAnimation()
          }
        })
      },
      { threshold: 0.3 }
    )
    
    const section = document.querySelector('#profitability-demo')
    if (section) observer.observe(section)
    
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      observer.disconnect()
    }
  }, [isAnimating])

  const CostBar = ({ label, amount, color, isHighlighted = false }: { 
    label: string
    amount: number
    color: string
    isHighlighted?: boolean 
  }) => (
    <div 
      className={`relative transition-all duration-1000 ease-out ${
        isHighlighted ? 'scale-105 z-10' : ''
      }`}
    >
      <div 
        className={`h-8 ${color} rounded-sm flex items-center justify-center text-white text-xs font-semibold transition-all duration-1000 ${
          isHighlighted ? 'ring-2 ring-accent animate-pulse' : ''
        }`}
        style={{ 
          width: `${(amount / coffeePrice) * 100}%`,
          minWidth: amount > 0 ? '60px' : '0px'
        }}
      >
        {amount > 0 && `$${amount.toFixed(2)}`}
      </div>
      <div className="text-xs text-muted-foreground mt-1 truncate">
        {label}
      </div>
    </div>
  )

  const ProfitDisplay = ({ profit, label }: { profit: number; label: string }) => (
    <div className={`text-center transition-all duration-1000 ${
      currentView === 'after' ? 'animate-bounce' : ''
    }`}>
      <div className={`text-3xl font-bold transition-colors duration-1000 ${
        profit > beforeProfit ? 'text-accent' : 'text-primary'
      }`}>
        ${profit.toFixed(2)}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {currentView === 'after' && (
        <div className="text-accent text-lg font-semibold animate-fade-in">
          +${profitIncrease.toFixed(2)} per coffee!
        </div>
      )}
    </div>
  )

  const costs = currentView === 'before' ? beforeCosts : afterCosts
  const profit = currentView === 'before' ? beforeProfit : afterProfit

  return (
    <section id="profitability-demo" className="section-padding bg-gradient-to-br from-primary/5 to-accent/5 border-t border-border/50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent font-semibold mb-4">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            Live Profitability Calculator
          </div>
          <h2 className="heading-section">See The Impact</h2>
          <p className="text-hero-sub max-w-2xl mx-auto">
            Watch how BrandPak transforms cafe profitability by eliminating cup costs
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-elegant">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Visualization */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    Coffee Sale: <span className="text-accent">${coffeePrice.toFixed(2)}</span>
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-500 ${
                    currentView === 'before' 
                      ? 'bg-destructive/10 text-destructive' 
                      : 'bg-accent/10 text-accent'
                  }`}>
                    {currentView === 'before' ? 'Current Model' : 'With BrandPak'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Cost Breakdown:</div>
                  
                  <CostBar 
                    label="Coffee Beans" 
                    amount={costs.beans} 
                    color="bg-amber-600" 
                  />
                  <CostBar 
                    label="Labor" 
                    amount={costs.labor} 
                    color="bg-blue-600" 
                  />
                  <CostBar 
                    label="Overhead" 
                    amount={costs.overhead} 
                    color="bg-slate-600" 
                  />
                  <CostBar 
                    label="Cup & Lid" 
                    amount={costs.cupLid} 
                    color="bg-destructive" 
                    isHighlighted={currentView === 'before' && costs.cupLid > 0}
                  />
                  <CostBar 
                    label="Other" 
                    amount={costs.other} 
                    color="bg-purple-600" 
                  />
                </div>

                {currentView === 'after' && costs.cupLid === 0 && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 animate-fade-in">
                    <div className="flex items-center gap-2 text-accent font-semibold">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                      Cup costs eliminated by BrandPak!
                    </div>
                  </div>
                )}
              </div>

              {/* Profit Display */}
              <div className="text-center space-y-6">
                <ProfitDisplay 
                  profit={profit} 
                  label="Profit per Coffee"
                />

                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Daily Impact (100 coffees):
                  </div>
                  <div className={`text-2xl font-bold transition-colors duration-1000 ${
                    currentView === 'after' ? 'text-accent' : 'text-primary'
                  }`}>
                    ${(profit * 100).toFixed(0)} profit
                  </div>
                  
                  {currentView === 'after' && (
                    <div className="animate-fade-in">
                      <div className="text-accent font-semibold text-lg">
                        +${(profitIncrease * 100).toFixed(0)} extra daily
                      </div>
                      <div className="text-sm text-muted-foreground">
                        That's ${((profitIncrease * 100) * 365).toFixed(0)} more per year!
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleAnimation}
                  variant="outline"
                  className="w-full"
                  disabled={isAnimating}
                >
                  {isAnimating ? 'Calculating...' : 'Run Demo Again'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            <strong>Real impact:</strong> Cafés save $0.35 per coffee while brands reach customers through premium placement
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProfitabilityDemo