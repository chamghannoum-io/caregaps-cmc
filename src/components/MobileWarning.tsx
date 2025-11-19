import { Smartphone } from 'lucide-react'
import { Card, CardContent } from './ui/card'

export function MobileWarning() {
  return (
    <div className="md:hidden mb-6">
      <Card className="border-l-4 border-l-teal-500 bg-teal-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-teal-900 mb-1">
                Mobile View Active
              </p>
              <p className="text-xs text-teal-800">
                For the best experience, we recommend using a tablet or desktop device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

