import Link from 'next/link'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RequestUpgrade() {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Upgrade your plan to continue</CardTitle>
                <CardDescription>
                    This content is available to premium members.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    By upgrading, you&apos;ll unlock:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                    <li>Full access to premium lessons</li>
                    <li>Advanced project walkthroughs</li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/upgrade">Upgrade Now</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
