'use client';

export default function WaitPageTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Wait Page Test
        </h1>
        <p className="text-xl text-navy-300 mb-8">
          If you can see this, the basic page is working!
        </p>
        <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8">
          <div className="text-2xl font-bold text-cyan-400 mb-4">✅ Success!</div>
          <p className="text-navy-200">
            The page is rendering correctly. NextAuth.js and basic components are working.
          </p>
        </div>
      </div>
    </div>
  );
}
