import { Smartphone } from 'lucide-react'
import { Card, CardContent } from './ui/card'

export function MobileWarning() {
  return (
    <div className="md:hidden mb-6">
      <Card className="border-l-4" style={{ borderLeftColor: '#14b8a6', backgroundColor: '#f0fdfa' }}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#0d9488' }} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: '#134e4a' }}>
                Mobile View Active
              </p>
              <p className="text-xs" style={{ color: '#115e59' }}>
                For the best experience, we recommend using a tablet or desktop device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

