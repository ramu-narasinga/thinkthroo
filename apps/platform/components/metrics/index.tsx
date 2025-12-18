// https://medium.com/@victorhcharry/short-how-to-integrate-google-analytics-and-microsoft-clarity-with-nextjs-6174952f218c
import MicrosoftClarity from "./ms-clarity";
import Umami from "./umami";

const Metrics = () => (
  <>
    <MicrosoftClarity />
    <Umami />
  </>
);

export default Metrics;
