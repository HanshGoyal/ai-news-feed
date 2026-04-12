import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, Filter, Rss } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Rss className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">AI News Feed</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/feed")}>
              View Feed
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Stay Updated with AI & ML News
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Aggregated content from top AI/ML sources, GitHub trending repositories, and leading AI researchers on Twitter. All in one unified feed.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/feed")}
            className="gap-2"
          >
            Explore Feed <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold mb-8">Features</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <Rss className="h-8 w-8 text-primary mb-4" />
            <h4 className="font-semibold mb-2">Multiple Sources</h4>
            <p className="text-sm text-muted-foreground">
              Content from Towards Data Science, arXiv, DeepLearning.AI, Emergent Mind, and more.
            </p>
          </Card>
          <Card className="p-6">
            <Filter className="h-8 w-8 text-primary mb-4" />
            <h4 className="font-semibold mb-2">Smart Filtering</h4>
            <p className="text-sm text-muted-foreground">
              Filter by content type, source, or search keywords to find exactly what you need.
            </p>
          </Card>
          <Card className="p-6">
            <Zap className="h-8 w-8 text-primary mb-4" />
            <h4 className="font-semibold mb-2">Real-time Updates</h4>
            <p className="text-sm text-muted-foreground">
              Feed refreshes every 30 minutes with the latest articles, tweets, and discoveries.
            </p>
          </Card>
        </div>
      </section>

      {/* Sources Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold mb-8">Included Sources</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-3">News & Articles</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Towards Data Science</li>
              <li>• arXiv cs.AI</li>
              <li>• DeepLearning.AI The Batch</li>
              <li>• Emergent Mind</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Tools & Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• GitHub Trending (AI repos)</li>
              <li>• There's An AI For That</li>
              <li>• Twitter/X (AI researchers)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 mb-8">
        <Card className="p-8 text-center bg-primary/5 border-primary/20">
          <h3 className="text-2xl font-bold mb-4">Ready to explore?</h3>
          <Button
            size="lg"
            onClick={() => navigate("/feed")}
            className="gap-2"
          >
            Go to Feed <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </section>
    </div>
  );
}
