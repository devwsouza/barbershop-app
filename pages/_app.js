import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Barbearia Pro</title>

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />

        <meta name="theme-color" content="#0f172a" />
      </Head>

      <Component {...pageProps} />
    </>
  );
}