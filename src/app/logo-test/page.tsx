import CoolPixLogo from '@/components/CoolPixLogo';

export default function LogoTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-slate-800">
          CoolPix Logo Testing Suite
        </h1>
        
        {/* Size Testing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Size Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Small</h3>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <CoolPixLogo variant="horizontal" theme="light" size="sm" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Medium</h3>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <CoolPixLogo variant="horizontal" theme="light" size="md" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Large</h3>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <CoolPixLogo variant="horizontal" theme="light" size="lg" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Extra Large</h3>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <CoolPixLogo variant="horizontal" theme="light" size="xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Variant Testing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Logo Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Horizontal</h3>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <CoolPixLogo variant="horizontal" theme="light" size="md" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Stacked</h3>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <CoolPixLogo variant="stacked" theme="light" size="md" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Icon Only</h3>
              <div className="bg-white p-6 rounded-lg shadow-sm border flex justify-center">
                <CoolPixLogo variant="icon-only" theme="light" size="lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Theme Testing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Theme Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Light Theme (Light Background)</h3>
              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <CoolPixLogo variant="horizontal" theme="light" size="lg" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Dark Theme (Dark Background)</h3>
              <div className="bg-slate-900 p-8 rounded-lg shadow-sm border">
                <CoolPixLogo variant="horizontal" theme="dark" size="lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Testing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Responsive Behavior</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Mobile Header Simulation (320px width)</h3>
              <div className="w-80 mx-auto bg-slate-900 p-4 rounded-lg">
                <div className="flex items-center justify-center">
                  <CoolPixLogo variant="horizontal" theme="dark" size="sm" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Tablet Header Simulation (768px width)</h3>
              <div className="max-w-3xl mx-auto bg-slate-900 p-4 rounded-lg">
                <div className="flex items-center justify-center">
                  <CoolPixLogo variant="horizontal" theme="dark" size="md" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contrast Testing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Contrast & Accessibility Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Pure White</h3>
              <div className="bg-white p-6 rounded-lg border">
                <CoolPixLogo variant="horizontal" theme="light" size="md" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Light Gray</h3>
              <div className="bg-gray-100 p-6 rounded-lg border">
                <CoolPixLogo variant="horizontal" theme="light" size="md" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Medium Gray</h3>
              <div className="bg-gray-400 p-6 rounded-lg border">
                <CoolPixLogo variant="horizontal" theme="dark" size="md" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Dark Gray</h3>
              <div className="bg-gray-700 p-6 rounded-lg border">
                <CoolPixLogo variant="horizontal" theme="dark" size="md" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Pure Black</h3>
              <div className="bg-black p-6 rounded-lg border">
                <CoolPixLogo variant="horizontal" theme="dark" size="md" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Brand Navy</h3>
              <div className="bg-navy-900 p-6 rounded-lg border">
                <CoolPixLogo variant="horizontal" theme="dark" size="md" />
              </div>
            </div>
          </div>
        </section>

        {/* Animation Testing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Animation & Interaction Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Hover Effects</h3>
              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <CoolPixLogo 
                  variant="horizontal" 
                  theme="light" 
                  size="lg"
                  className="transition-all duration-300 hover:scale-110 hover:drop-shadow-lg cursor-pointer" 
                />
                <p className="text-xs text-slate-500 mt-2">Hover to test</p>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-4 text-slate-600">Loading Animation</h3>
              <div className="bg-slate-900 p-8 rounded-lg shadow-sm border">
                <CoolPixLogo 
                  variant="icon-only" 
                  theme="dark" 
                  size="xl"
                  className="animate-pulse" 
                />
                <p className="text-xs text-slate-300 mt-2">Pulse animation</p>
              </div>
            </div>
          </div>
        </section>

        {/* Print Testing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Print Testing</h2>
          <div className="bg-white p-8 rounded-lg shadow-sm border print:shadow-none">
            <h3 className="text-sm font-medium mb-4 text-slate-600">Print Preview (Use browser print preview)</h3>
            <div className="space-y-6">
              <CoolPixLogo variant="horizontal" theme="light" size="lg" />
              <CoolPixLogo variant="stacked" theme="light" size="md" />
              <CoolPixLogo variant="icon-only" theme="light" size="lg" />
            </div>
          </div>
        </section>

        {/* Testing Instructions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Testing Checklist</h2>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-4 text-blue-900">Manual Testing Steps:</h3>
            <ul className="space-y-2 text-blue-800">
              <li>✓ Test on Chrome, Firefox, Safari, Edge</li>
              <li>✓ Test on mobile devices (iOS Safari, Android Chrome)</li>
              <li>✓ Test responsive breakpoints (320px, 768px, 1024px, 1440px)</li>
              <li>✓ Verify logo clarity at all sizes</li>
              <li>✓ Check color accuracy and gradients</li>
              <li>✓ Test hover and focus states</li>
              <li>✓ Verify accessibility (screen readers, keyboard navigation)</li>
              <li>✓ Test print styles</li>
              <li>✓ Check loading performance</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
