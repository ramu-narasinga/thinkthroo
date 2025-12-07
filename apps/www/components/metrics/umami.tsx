"use client";

import Script from "next/script";

const Umami = () => {
  return (
    <Script 
        defer
        src='https://cloud.umami.is/script.js' 
        data-website-id='baad8bf9-5d53-488a-8603-30967d83405a' 
    />
  );
};

export default Umami;