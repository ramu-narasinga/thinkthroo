import React from "react";

import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string | null | undefined;
}

const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
  const previewText = `Learn the techniques used in open-source projects`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 w-[465px] p-5">
            <Text className="mx-0 mb-8 mt-4 p-0 text-center text-2xl font-normal">
              Welcome to{" "}
              <span className="font-bold tracking-tighter">Think Throo</span>
            </Text>
            <Text className="text-sm">
              Thanks for signing up{name && `, ${name}`}!
            </Text>
            <Text className="text-sm">
              My name is Ram, and I&apos;m the creator of Think Throo – the
              open-source learning platform! I&apos;m excited to have you on
              board!
            </Text>
            <Text className="text-sm">
              Here are a few things you can do to get started:
            </Text>
            <Text className="text-sm">
              <ul className="list-inside list-disc text-sm">
                <li>Study the codebase architecture of projects such as Shadcn/ui, Docmost etc.,</li>
                <li>Practice the best practices used in open-source projects</li>
                <li>Learn how to build production-grade projects</li>
                <li>Build Shadcn/ui CLI from scratch</li>
                <li>Tips and techniques used in OSS delivered to your inbox weekly</li>
              </ul>
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-black text-center text-xs font-semibold text-white no-underline"
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/architecture`}
                style={{ padding: "12px 20px" }}
              >
                Get Started
              </Button>
            </Section>
            <Section>
              <Text className="text-sm">
                If you would like to keep up to date, you can:
              </Text>
              <Text className="text-sm">
                <ul className="list-inside list-disc text-sm">
                  <li>
                    Star the repo on{" "}
                    <Link
                      href="https://github.com/ramu-narasinga/thinkthroo"
                      target="_blank"
                    >
                      GitHub
                    </Link>
                  </li>
                  <li>
                    Follow the journey on{" "}
                    <Link href="https://x.com/thinkthroo" target="_blank">
                      Twitter
                    </Link>
                  </li>
                  <li>
                    Got a question?{" "}
                    <Link
                      href="https://thinkthroo.com/consultation/got-question"
                      target="_blank"
                    >
                      Let's talk
                    </Link>
                  </li>
                </ul>
              </Text>
            </Section>
            <Section className="mt-4">
              <Text className="text-sm">
                If you have any questions or feedback just respond to this
                email. I&apos;m always happy to help!
              </Text>
              <Text className="text-sm text-gray-400">Ram from Think Throo</Text>
            </Section>
            <Hr />
            <Section className="mt-8 text-gray-400">
              <Text className="text-xs">
                © {new Date().getFullYear()}{" "}
                <a
                  href="https://app.thinkthroo.com"
                  className="text-gray-400 no-underline visited:text-gray-400 hover:text-gray-400"
                  target="_blank"
                >
                  app.thinkthroo.com
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;