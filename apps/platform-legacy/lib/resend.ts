// Pulled from https://github.com/mfts/papermark/blob/main/lib/resend.ts#L12
import { JSXElementConstructor, ReactElement } from "react";

import { render } from "@react-email/components";
import { Resend } from "resend";

import { nanoid } from "@/lib/utils";

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendEmail = async ({
  to,
  subject,
  react,
  from,
  marketing,
  system,
  verify,
  test,
  cc,
  replyTo,
  scheduledAt,
  unsubscribeUrl,
}: {
  to: string;
  subject: string;
  react: ReactElement<any, string | JSXElementConstructor<any>>;
  from?: string;
  marketing?: boolean;
  system?: boolean;
  verify?: boolean;
  test?: boolean;
  cc?: string | string[];
  replyTo?: string;
  scheduledAt?: string;
  unsubscribeUrl?: string;
}) => {
  if (!resend) {
    // Throw an error if resend is not initialized
    throw new Error("Resend not initialized");
  }

  const plainText = await render(react, { plainText: true });

  const fromAddress =
    from ??
    (marketing
      ? "Ram from Think Throo <ramu@thinkthroo.com>"
      : system
        ? "Ram from Think Throo <ramu@thinkthroo.com>"
        : verify
          ? "Ram from Think Throo <ramu@thinkthroo.com>"
          : !!scheduledAt
            ? "Ram from Think Throo <ramu@thinkthroo.com>"
            : "Ram from Think Throo <ramu@thinkthroo.com>");

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: test ? "delivered@resend.dev" : to,
      cc: cc,
      replyTo: marketing ? "ramu@thinkthroo.com" : replyTo,
      subject,
      react,
      scheduledAt,
      text: plainText,
      headers: {
        "X-Entity-Ref-ID": nanoid(),
        ...(unsubscribeUrl ? { "List-Unsubscribe": unsubscribeUrl } : {}),
      },
    });

    // Check if the email sending operation returned an error and throw it
    if (error) {
      console.log(`Resend returned error when sending email: ${error.name} \n\n ${error.message}`);
      throw error;
    }

    // If there's no error, return the data
    return data;
  } catch (exception) {
    // Log and rethrow any caught exceptions for upstream handling
    console.log(`Unexpected error when sending email: ${exception}`);
    throw exception; // Rethrow the caught exception
  }
};