import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ExternalLink, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Feed() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [offset, setOffset] = useState<number>(0);
  const limit = 20;

  // Fetch feed items
  const { data: feedData, isLoading: isFeedLoading } = trpc.feed.list.useQuery({
    limit,
    offset,
    type: activeTab === "all" ? undefined : activeTab,
    source: selectedSource === "all" ? undefined : selectedSource,
    search: searchQuery || undefined,
  });

  // Fetch available sources
  const { data: sources } = trpc.feed.sources.useQuery();

  const items = feedData?.items || [];
  const total = feedData?.total || 0;
  const hasMore = offset + limit < total;

  const getSourceBadgeColor = (source: string) => {
    const colors: Record<string, string> = {
      tds: "bg-blue-900 text-blue-100",
      arxiv: "bg-purple-900 text-purple-100",
      deeplearning: "bg-orange-900 text-orange-100",
      emergent_mind: "bg-green-900 text-green-100",
      github: "bg-gray-700 text-gray-100",
      ai_tools: "bg-pink-900 text-pink-100",
      twitter: "bg-cyan-900 text-cyan-100",
    };
    return colors[source] || "bg-gray-700 text-gray-100";
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      article: "📄",
      tweet: "𝕏",
      github: "⭐",
      ai_tool: "🤖",
    };
    return icons[type] || "📌";
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setOffset(0);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setOffset(0);
  };

  const handleSourceChange = (value: string) => {
    setSelectedSource(value);
    setOffset(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI News Feed</h1>
                <p className="text-sm text-muted-foreground">Aggregated content from AI/ML sources</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles, tweets, tools..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <Select value={selectedSource} onValueChange={handleSourceChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources?.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="article">Articles</TabsTrigger>
            <TabsTrigger value="tweet">Twitter/X</TabsTrigger>
            <TabsTrigger value="github">GitHub</TabsTrigger>
            <TabsTrigger value="ai_tool">AI Tools</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {isFeedLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No items found. Try adjusting your filters.</p>
              </Card>
            ) : (
              <>
                {/* Feed Items */}
                <div className="space-y-4">
                  {items.map((item: any) => (
                    <Card
                      key={item.id}
                      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex gap-4">
                        {/* Type Icon */}
                        <div className="text-2xl flex-shrink-0 pt-1">{getTypeIcon(item.type)}</div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title and Link */}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link"
                          >
                            <h3 className="font-semibold text-base leading-tight mb-2 group-hover/link:text-primary transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                          </a>

                          {/* Description */}
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-2 items-center text-xs">
                            <Badge variant="secondary" className={getSourceBadgeColor(item.source)}>
                              {sources?.find((s) => s.id === item.source)?.name || item.source}
                            </Badge>

                            {item.author && (
                              <span className="text-muted-foreground">by {item.author}</span>
                            )}

                            <span className="text-muted-foreground">
                              {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                            </span>

                            {item.metrics && (
                              <span className="text-muted-foreground">
                                {JSON.parse(item.metrics).stars && `⭐ ${JSON.parse(item.metrics).stars}`}
                              </span>
                            )}

                            {/* External Link */}
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto text-muted-foreground hover:text-primary transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-3 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground">
                    {offset + 1} - {Math.min(offset + limit, total)} of {total}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setOffset(offset + limit)}
                    disabled={!hasMore}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
