'use client'

import Link from 'next/link'

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-amber-light rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl text-amber-brand">
            ◈
          </div>
          <h1 className="text-3xl font-bold mb-3">Get the Extension</h1>
          <p className="text-gray-600 text-lg">
            Your beacon for finding caches across the web
          </p>
        </div>

        {/* Beta Notice */}
        <div className="bg-amber-light border border-amber-brand/20 rounded-xl p-5 mb-8">
          <div className="flex gap-3">
            <span className="text-2xl">🧪</span>
            <div>
              <h3 className="font-bold text-amber-brand mb-1">Beta Version</h3>
              <p className="text-gray-700 text-sm">
                We're still in early testing! The extension isn't on the Chrome Web Store yet, 
                so you'll need to install it manually. It only takes a minute.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Installation Steps</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {/* Step 1 */}
            <div className="p-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-amber-brand text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-bold mb-2">Download the extension</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Download the zip file containing the extension.
                  </p>
                  <a
                    href="/webcrawl-extension-v2.zip"
                    download
                    className="inline-flex items-center gap-2 bg-amber-brand text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a86b1d] transition"
                  >
                    ⬇️ Download Extension (.zip)
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-amber-brand text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold mb-2">Unzip the file</h3>
                  <p className="text-gray-600 text-sm">
                    Find the downloaded file and unzip it. You should have a folder called 
                    <code className="bg-gray-100 px-1 rounded mx-1">webcrawl-extension-v2</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-amber-brand text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold mb-2">Open Chrome Extensions</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Go to <code className="bg-gray-100 px-2 py-1 rounded">chrome://extensions</code> in your browser.
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('chrome://extensions')
                      alert('Copied! Paste this in your address bar.')
                    }}
                    className="text-sm text-amber-brand hover:underline"
                  >
                    📋 Copy URL
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-amber-brand text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-bold mb-2">Enable Developer Mode</h3>
                  <p className="text-gray-600 text-sm">
                    Toggle the <strong>"Developer mode"</strong> switch in the top-right corner of the extensions page.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-amber-brand text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-bold mb-2">Load the extension</h3>
                  <p className="text-gray-600 text-sm">
                    Click <strong>"Load unpacked"</strong> and select the <code className="bg-gray-100 px-1 rounded">webcrawl-extension-v2</code> folder you unzipped.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="p-6 bg-green-50">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-green-700">You're ready!</h3>
                  <p className="text-gray-600 text-sm">
                    You should see the ◈ icon in your toolbar. Sign in on the dashboard and start hunting!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Having trouble? Email us at <a href="mailto:hello@jointhecrawl.com" className="text-amber-brand hover:underline">hello@jointhecrawl.com</a></p>
        </div>
      </main>
    </div>
  )
}
