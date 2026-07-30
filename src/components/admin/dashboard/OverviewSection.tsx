import { BlueprintCard, Kicker } from "@/components/admin/ui";

export function OverviewSection({
  quotesTotal,
  quotesWon,
  quotesOpen,
  upcomingCount,
  clientsCount,
  publishedCount,
  postsTotal,
}: {
  quotesTotal: number;
  quotesWon: number;
  quotesOpen: number;
  upcomingCount: number;
  clientsCount: number;
  publishedCount: number;
  postsTotal: number;
}) {
  const stats = [
    {
      kicker: "Quotes",
      value: quotesTotal,
      body: `${quotesWon} won · ${quotesOpen} open`,
    },
    {
      kicker: "Upcoming",
      value: upcomingCount,
      body: "Deadlines & deliverables",
    },
    {
      kicker: "Clients",
      value: clientsCount,
      body: "Active businesses on the books",
    },
    {
      kicker: "Blog",
      value: publishedCount,
      body: `Published of ${postsTotal} posts`,
    },
  ];

  return (
    <section id="overview" className="pb-2 pt-10">
      <Kicker>Overview</Kicker>
      <h1 className="mb-6 font-display text-3xl font-semibold uppercase tracking-wide md:text-4xl">
        Site control room
      </h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <BlueprintCard key={stat.kicker}>
            <Kicker>{stat.kicker}</Kicker>
            <p className="font-display text-3xl font-semibold text-accent-text">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted">{stat.body}</p>
          </BlueprintCard>
        ))}
      </div>
    </section>
  );
}
