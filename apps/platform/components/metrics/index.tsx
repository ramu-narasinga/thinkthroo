// https://medium.com/@victorhcharry/short-how-to-integrate-google-analytics-and-microsoft-clarity-with-nextjs-6174952f218c
import { Suspense } from "react";
import Umami from "./umami";
import RedditPixel from "./reddit-pixel";
import { RedditSignupTracker } from "./reddit-signup-tracker";

const Metrics = () => (
  <>
    <Umami />
    <RedditPixel />
    <Suspense>
      <RedditSignupTracker />
    </Suspense>
  </>
);

export default Metrics;
