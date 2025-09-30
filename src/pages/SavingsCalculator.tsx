import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Coffee, Calculator, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SavingsCalculator = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [cupsPerWeek, setCupsPerWeek] = useState(1000) // Default Australian café average
  const costPerCup = 0.18 // $0.18 per cup + lid

  // Calculate savings
  const weeklySavings = cupsPerWeek * costPerCup
  const monthlySavings = weeklySavings * 4.33 // Average weeks per month
  const annualSavings = weeklySavings * 52

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCupsPerWeek(parseInt(e.target.value))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setCupsPerWeek(Math.max(0, Math.min(10000, value))) // Limit between 0-10,000
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="flex items-center text-primary hover:text-accent transition-colors mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Café Savings Calculator</h1>
              <p className="text-muted-foreground mt-1">Discover how much your café could save with CupSpace</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calculator */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <Card className="p-8 bg-card shadow-elegant hover:shadow-accent transition-all duration-300 border-0">
            <div className="text-center mb-8">
              <Coffee className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">How many takeaway cups do you use?</h2>
              <p className="text-muted-foreground">Adjust the slider or enter your weekly cup usage</p>
            </div>

            {/* Slider */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="cups-slider" className="text-lg font-medium text-foreground mb-4 block">
                  Cups per week
                </Label>
                <div className="relative">
                  <input
                    id="cups-slider"
                    type="range"
                    min="50"
                    max="5000"
                    step="50"
                    value={cupsPerWeek}
                    onChange={handleSliderChange}
                    className="w-full h-3 bg-primary/10 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((cupsPerWeek - 50) / (5000 - 50)) * 100}%, hsl(var(--primary) / 0.1) ${((cupsPerWeek - 50) / (5000 - 50)) * 100}%, hsl(var(--primary) / 0.1) 100%)`
                    }}
                  />
                  <style>{`
                    .slider::-webkit-slider-thumb {
                      appearance: none;
                      height: 24px;
                      width: 24px;
                      border-radius: 50%;
                      background: hsl(var(--primary));
                      cursor: pointer;
                      box-shadow: 0 4px 12px hsl(var(--primary) / 0.4);
                      border: 3px solid white;
                    }
                    .slider::-moz-range-thumb {
                      height: 24px;
                      width: 24px;
                      border-radius: 50%;
                      background: hsl(var(--primary));
                      cursor: pointer;
                      box-shadow: 0 4px 12px hsl(var(--primary) / 0.4);
                      border: 3px solid white;
                    }
                  `}</style>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>50</span>
                  <span>5,000</span>
                </div>
              </div>

              {/* Number Input */}
              <div>
                <Label htmlFor="cups-input" className="text-lg font-medium text-foreground mb-2 block">
                  Or enter exact number
                </Label>
                <Input
                  id="cups-input"
                  type="number"
                  min="0"
                  max="10000"
                  value={cupsPerWeek}
                  onChange={handleInputChange}
                  className="text-xl text-center font-semibold border-2 border-primary/20 focus:border-primary rounded-xl h-14"
                  placeholder="1000"
                />
              </div>

              {/* Current Selection Display */}
              <div className="bg-primary/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary">{cupsPerWeek.toLocaleString()}</div>
                <div className="text-accent font-medium">cups per week</div>
                <div className="text-sm text-primary mt-1">
                  That's about {Math.round(cupsPerWeek / 7)} cups per day
                </div>
              </div>
            </div>
          </Card>

          {/* Results Section */}
          <Card className="p-8 bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-accent transition-all duration-300 border-0">
            <div className="text-center mb-8">
              <TrendingUp className="w-16 h-16 text-primary-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your Potential Savings</h2>
              <p className="text-primary-foreground/90">With CupSpace providing cups for free</p>
            </div>

            <div className="space-y-6">
              {/* Weekly Savings */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-primary-foreground/80 text-sm font-medium">Weekly Savings</div>
                <div className="text-2xl font-bold transition-all duration-300">
                  ${weeklySavings.toFixed(0)}
                </div>
              </div>

              {/* Monthly Savings */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-primary-foreground/80 text-sm font-medium">Monthly Savings</div>
                <div className="text-2xl font-bold transition-all duration-300">
                  ${monthlySavings.toFixed(0)}
                </div>
              </div>

              {/* Annual Savings - Highlighted */}
              <div className="bg-background rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-primary text-sm font-semibold uppercase tracking-wide mb-2">
                  🎉 Annual Savings
                </div>
                <div className="text-4xl font-black text-primary mb-2 transition-all duration-300">
                  ${annualSavings.toLocaleString()}
                </div>
                <div className="text-accent font-bold text-lg leading-tight">
                  You could save ${annualSavings.toLocaleString()} every year just on cups and lids!
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-primary-foreground/80 text-xs mb-2">Calculation based on:</div>
                <div className="text-sm space-y-1">
                  <div>• ${costPerCup.toFixed(2)} per cup + lid</div>
                  <div>• {cupsPerWeek.toLocaleString()} cups per week</div>
                  <div>• 52 weeks per year</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="inline-block p-8 bg-card shadow-elegant border-0">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to start saving?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Join CupSpace and transform your takeaway cups into advertising revenue while cutting costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cafe-form">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full text-lg font-semibold shadow-accent hover:shadow-lg transition-all duration-300">
                  Partner as a Café
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 rounded-full text-lg font-semibold">
                  Learn More
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SavingsCalculator