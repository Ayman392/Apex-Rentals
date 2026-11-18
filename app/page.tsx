import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="glass max-w-md rounded-3xl p-8 text-center">
        <h1 className="text-3xl font-semibold">Apex Rentals</h1>
        <p className="mt-2 text-muted-foreground">Theme check</p>
        <Button className="mt-6">Primary button</Button>
      </div>
    </main>
  );
}