'use client';

import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/interfaces/page/header";
import { LocalizationBanner } from "@/components/interfaces/upgrade/localization-banner";
import { Pricing } from "@/components/interfaces/upgrade/pricing";
import { useUserInfo } from "@/hooks/use-user-info";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function UpgradePage() {

    const supabase = createClient();
  const { user } = useUserInfo(supabase);
  const [country, setCountry] = useState('US');

    return (
        <div className="container relative">

            <PageHeader>
                <PageHeaderHeading>Choose your Think Throo membership.</PageHeaderHeading>
                <PageHeaderDescription>
                    Start for free and upgrade to learn advanced patterns and techniques.
                </PageHeaderDescription>
            </PageHeader>

            {/* TODO: Fix the localized banner */}
            {/* <LocalizationBanner country={country} onCountryChange={setCountry} /> */}
            
            <Pricing country={country} />
        </div>
    )
}