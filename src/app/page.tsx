import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/home/navbar";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Features } from "@/components/home/features";
import { TechStack } from "@/components/home/tech-stack";
import { Footer } from "@/components/home/footer";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} />
      <main>
        <Hero session={session} error={error} />
        <HowItWorks />
        <Features />
        <TechStack />
      </main>
      <Footer />
    </div>
  );
}
