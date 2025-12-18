"use client";

import Script from "next/script";

const Umami = () => {
  return (
    <Script 
        defer
        src='https://cloud.umami.is/script.js' 
        data-website-id='19239d7c-7e66-43b8-9dae-e5e9a162dad3' 
    />
  );
};

export default Umami;
