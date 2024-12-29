"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
export default function MyApp() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "consultation" });
      cal("ui", {
        styles: { branding: { brandColor: "#000000" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);
  return (
    <div className="container relative">
        <section
            className={"mx-auto flex flex-col items-start gap-2 px-4 py-8 md:py-12 md:pb-8 lg:py-12 lg:pb-10"}
        >
            <Cal
                namespace="meeting"
                calLink="ramu-narasinga-rqy5ut/30min"
                style={{ width: "100%", height: "100%", overflow: "scroll" }}
                config={{ layout: "month_view" }}
            />
        </section>
    </div>
  );
}