'use client'

import { Button } from "@thinkthroo/ui/components/components/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
  } from "@thinkthroo/ui/components/components/dropdown-menu"
import { handleRequest } from "@/utils/auth-helpers/client"
import { SignOut } from "@/utils/auth-helpers/server"
import { getRedirectMethod } from "@/utils/auth-helpers/settings"
  import { CreditCard, LogOut, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export function AccountMenu(props: {fullName: string}) {

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = getRedirectMethod() === 'client' ? useRouter() : null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">{props.fullName}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
                    <button type="submit" className="w-full">
                        <DropdownMenuItem>
                            <input type="hidden" name="pathName" value={usePathname()} />
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </button>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}