import { Logo } from "@/components/icons/logo";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
        <div className="flex items-center gap-2">
          <Logo className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            EmotiGuard
          </h1>
        </div>
      </div>
    </header>
  );
}
