import { Smartphone } from 'lucide-react'
import { Card, CardContent } from './ui/card'

export function MobileWarning() {
  return (
    <div className="md:hidden mb-6">
      <Card className="border-l-4 border-l-[#1e2951] bg-[#1e2951]/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 flex-shrink-0 mt-0.5 text-[#1e2951]" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium mb-1 text-foreground">
                Mobile View Active
              </p>
              <p className="text-xs text-muted-foreground">
                For the best experience, we recommend using a tablet or desktop device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

