import Head from 'next/head';

export default function Maintenance() {
  return (
    <>
      <Head>
        <title>Maintenance Mode</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-lg w-full backdrop-blur-sm bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="mb-6">
            
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
            We'll be back soon
          </h1>

          <p className="text-lg sm:text-xl text-white/90 mb-4 leading-relaxed">
            <span className="text-yellow-300 font-bold text-2xl">cetmca26</span> is currently undergoing scheduled maintenance.
          </p>

          <p className="text-white/90 mb-8 text-lg">
            Maintenance time: <span className="font-semibold text-yellow-200">Less than 10 minutes</span>
          </p>

          <div className="rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/30 px-6 py-4 text-white/90 shadow-lg">
            <p className="text-base sm:text-lg font-medium">
              Please check back later! 
            </p>
          </div>

          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </>
  );
}
