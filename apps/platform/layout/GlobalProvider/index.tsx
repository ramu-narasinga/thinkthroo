import { ReactNode } from "react";
import QueryProvider from "./Query"

interface GlobalLayoutProps {
  children: ReactNode;
}

const GlobalLayout = async ({children}: GlobalLayoutProps) => {
    return (
        <QueryProvider>{children}</QueryProvider>
    )
} 

export default GlobalLayout