// https://medium.com/@victorhcharry/short-how-to-integrate-google-analytics-and-microsoft-clarity-with-nextjs-6174952f218c
import MicrosoftClarity from "./ms-clarity";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react"

const Metrics = () => (
  <>
    <MicrosoftClarity />
    <VercelAnalytics />
  </>
);

export default Metrics;