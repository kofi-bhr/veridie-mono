import { Star, StarHalf } from "lucide-react"

interface StarRatingProps {
  rating: number
  className?: string
}

export function StarRating({ rating, className = "" }: StarRatingProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className={`flex items-center ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className="w-4 h-4 fill-primary text-primary" />
        } else if (i === fullStars && hasHalfStar) {
          return <StarHalf key={i} className="w-4 h-4 fill-primary text-primary" />
        } else {
          return <Star key={i} className="w-4 h-4 text-muted-foreground" />
        }
      })}
    </div>
  )
}
