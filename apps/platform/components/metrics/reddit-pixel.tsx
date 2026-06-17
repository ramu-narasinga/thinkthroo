"use client";

import Script from "next/script";

const RedditPixel = () => {
  return (
    <Script
      id="reddit-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=a2_j6lmz3ppxdqy",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_j6lmz3ppxdqy');rdt('track', 'PageVisit');`,
      }}
    />
  );
};

export default RedditPixel;
