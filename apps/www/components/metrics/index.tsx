// https://medium.com/@victorhcharry/short-how-to-integrate-google-analytics-and-microsoft-clarity-with-nextjs-6174952f218c
import Umami from "./umami";
import RedditPixel from "./reddit-pixel";
import GoogleAds from "./google-ads";

const Metrics = () => (
  <>
    <Umami />
    <RedditPixel />
    <GoogleAds />
  </>
);

export default Metrics;