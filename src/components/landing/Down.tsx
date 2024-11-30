import Head from 'next/head';

export default function Down() {
  return (
    <>
      <Head>
        <title>Site Under Maintenance</title>
        <meta name="description" content="Our site is currently under maintenance. We&apos;ll be back in 24 hours." />
      </Head>
      <div className="flex items-center justify-center w-full h-screen bg-mainWhite">
        <div className="text-center p-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-mainBlack mb-2">
            Site Under Maintenance
          </h1>
          <p className="text-lg md:text-xl text-mainBlack">
            We&apos;ll be back in 24 hours.
          </p>
        </div>
      </div>
    </>
  );
}