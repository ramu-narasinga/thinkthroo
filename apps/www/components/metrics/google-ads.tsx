import Script from "next/script";

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/** Loads gtag.js. No-op entirely if NEXT_PUBLIC_GOOGLE_ADS_ID isn't set. */
const GoogleAds = () => {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-ads-gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
            window.gtag = gtag;
          `,
        }}
      />
    </>
  );
};

export default GoogleAds;
