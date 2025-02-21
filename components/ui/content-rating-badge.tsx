import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react"

type ContentRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17'

const ratingDescriptions: Record<ContentRating, string> = {
  'G': 'General Audience - Suitable for all ages',
  'PG': 'Parental Guidance - Some material may not be suitable for children',
  'PG-13': 'Some material may be inappropriate for children under 13',
  'R': 'Restricted - Under 18 requires parent/guardian',
  'NC-17': 'Adults Only - No one 17 and under admitted'
}

const ratingColors: Record<ContentRating, string> = {
  'G': 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  'PG': 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  'PG-13': 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  'R': 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  'NC-17': 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
}

const RatingIcon = ({ rating }: { rating: ContentRating }) => {
  switch (rating) {
    case 'G':
      return <ShieldCheck className="h-3 w-3" />
    case 'PG':
    case 'PG-13':
      return <Shield className="h-3 w-3" />
    case 'R':
    case 'NC-17':
      return <ShieldAlert className="h-3 w-3" />
    default:
      return <ShieldQuestion className="h-3 w-3" />
  }
}

interface ContentRatingBadgeProps {
  rating: ContentRating
  className?: string
  showTooltip?: boolean
}

export function ContentRatingBadge({ 
  rating, 
  className,
  showTooltip = true 
}: ContentRatingBadgeProps) {
  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        ratingColors[rating],
        className
      )}
    >
      <RatingIcon rating={rating} />
      <span className="ml-1">{rating}</span>
    </Badge>
  )

  if (!showTooltip) return badge

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>{ratingDescriptions[rating]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
