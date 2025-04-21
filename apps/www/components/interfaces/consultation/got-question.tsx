'use client'

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function MyApp() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "quick-chat" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <div className="w-full h-full p-6 ml-2 px-2"> 
      <div className="w-full h-2/5 overflow-scroll rounded-3xl shadow-md">
        <Cal
          namespace="quick-chat"
          calLink="ramu-narasinga/quick-chat"
          style={{ width: "100%", height: "100%" }}
          config={{ layout: "month_view" }}
        />
      </div>
    </div>
  );
}
