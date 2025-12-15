import { useState } from "react";
import { Button } from "@thinkthroo/ui/components/components/button";
import { Input } from "@thinkthroo/ui/components/components/input";
import { Label } from "@thinkthroo/ui/components/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@thinkthroo/ui/components/components/card";
import { CheckCircle } from "lucide-react";
import { Icons } from "@/components/icons";
import { subscribeToNewsLetter } from '@/utils/newsletter-helpers/server';
import { handleNewsLetterSubscriptionRequest } from '@/utils/newsletter-helpers/client';

export function NewsLetterForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Here you would typically handle the form submission,
    // such as sending the data to your API
    setIsLoading(true);
    const success = await handleNewsLetterSubscriptionRequest(event, subscribeToNewsLetter);
    setIsLoading(false);
    setIsSubmitted(success);
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Thank You!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-black mb-4" />
          <p>You&apos;ve successfully subscribed to our newsletter.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto my-4">
      <CardHeader>
        <CardTitle className="text-lg">Subscribe to Our Newsletter</CardTitle>
        <CardDescription>
          Get notified when we release new architectural guides!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@gmail.com"
              required
            />
          </div>
          <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
            {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
            Get Weekly Insights
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        {/* <p className="text-sm text-muted-foreground">
          No spam, just valuable content. Get weekly tips and insights from the best
          open-source projects.
        </p> */}
        {/* <p className="text-sm text-muted-foreground">
          Plus, 
        </p> */}
      </CardFooter>
    </Card>
  );
}
