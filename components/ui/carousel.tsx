"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CarouselProps {
  children: React.ReactNode[]
  className?: string
  itemsPerView?: number
  gap?: string
}

export function Carousel({ 
  children, 
  className,
  itemsPerView = 1,
  gap = "gap-4"
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const maxIndex = Math.max(0, children.length - itemsPerView)

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const canGoNext = currentIndex < maxIndex
  const canGoPrev = currentIndex > 0

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden">
        <div 
          className={cn("flex transition-transform duration-300 ease-in-out", gap)}
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {children.map((child, index) => (
            <div 
              key={index}
              className={cn("flex-shrink-0", {
                'w-full': itemsPerView === 1,
                'w-1/2': itemsPerView === 2,
                'w-1/3': itemsPerView === 3,
                'w-1/4': itemsPerView === 4,
              })}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        onClick={prev}
        disabled={!canGoPrev}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        onClick={next}
        disabled={!canGoNext}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next</span>
      </Button>

      {/* Dots indicator */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentIndex 
                ? "bg-primary" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            onClick={() => setCurrentIndex(index)}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}