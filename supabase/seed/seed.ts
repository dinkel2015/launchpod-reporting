/**
 * Recreates the MWCN June 2026 report from supabase/seed/reference/ — this is
 * the MVP acceptance test described in the project brief: the app should be
 * able to reproduce this report's structure from verified metrics + human
 * context + the report editor. Run with `npm run seed` after migrations.
 */
import { config } from "dotenv";
import { createClient, type WebSocketLikeConstructor } from "@supabase/supabase-js";
import ws from "ws";
import type { Database } from "../../types/database";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as unknown as WebSocketLikeConstructor },
});

async function main() {
  console.log("Seeding MWCN client…");
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .upsert(
      {
        name: "MountainWest Capital Network",
        podcast_name: "Welcome to the Winners' Circle",
        internal_slug: "mwcn",
        active: true,
      },
      { onConflict: "internal_slug" },
    )
    .select()
    .single();

  if (clientError || !client) throw clientError ?? new Error("Client upsert failed");
  console.log(`  client id: ${client.id}, private link token: ${client.private_access_token}`);

  console.log("Seeding June 2026 report…");
  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq("client_id", client.id)
    .eq("report_month", "June 2026")
    .maybeSingle();

  if (existing) {
    await supabase.from("report_sections").delete().eq("report_id", existing.id);
    await supabase.from("report_metrics").delete().eq("report_id", existing.id);
    await supabase.from("recommendations").delete().eq("report_id", existing.id);
    await supabase.from("report_uploads").delete().eq("report_id", existing.id);
  }

  const { data: report, error: reportError } = existing
    ? await supabase
        .from("reports")
        .update({
          title: "MountainWest Capital Network — June 2026",
          status: "published",
          published_at: new Date().toISOString(),
          human_context:
            "Two episodes in June: a FranklinCovey guest episode (Paul Walker) and a 'Best of' compilation. Amanda Wallman joined in March 2026 to manage social/promo. Apple flagged a playback-tracking bug this month that undercounts plays — does not affect Spotify.",
          expected_episode_frequency: 2,
        })
        .eq("id", existing.id)
        .select()
        .single()
    : await supabase
        .from("reports")
        .insert({
          client_id: client.id,
          title: "MountainWest Capital Network — June 2026",
          reporting_period_start: "2026-06-01",
          reporting_period_end: "2026-06-30",
          report_month: "June 2026",
          expected_episode_frequency: 2,
          status: "published",
          published_at: new Date().toISOString(),
          human_context:
            "Two episodes in June: a FranklinCovey guest episode (Paul Walker) and a 'Best of' compilation. Amanda Wallman joined in March 2026 to manage social/promo. Apple flagged a playback-tracking bug this month that undercounts plays — does not affect Spotify.",
        })
        .select()
        .single();

  if (reportError || !report) throw reportError ?? new Error("Report upsert failed");
  const reportId = report.id;
  console.log(`  report id: ${reportId}`);

  console.log("Seeding verified metrics…");
  const metric = (
    partial: Partial<Database["public"]["Tables"]["report_metrics"]["Insert"]> &
      Pick<Database["public"]["Tables"]["report_metrics"]["Insert"], "source_type" | "original_label" | "metric_key" | "display_label" | "value">,
  ): Database["public"]["Tables"]["report_metrics"]["Insert"] => ({
    report_id: reportId,
    unit: "count",
    authority_level: "manual_verified",
    verification_status: "verified",
    included_in_report: true,
    snapshot_date: "2026-06-30",
    ...partial,
  });

  const metrics: Database["public"]["Tables"]["report_metrics"]["Insert"][] = [
    metric({
      source_type: "apple",
      original_label: "Plays",
      metric_key: "apple_plays",
      display_label: "Apple Plays",
      value: "342",
      previous_value: 171,
      calculated_delta: 171,
      source_reference: "Apple Podcasts Connect — Overview tab",
    }),
    metric({
      source_type: "spotify",
      original_label: "Plays",
      metric_key: "spotify_plays",
      display_label: "Spotify Plays",
      value: "20",
      previous_value: 86,
      calculated_delta: -66,
      source_reference: "Spotify for Creators — Analytics Overview",
    }),
    metric({
      source_type: "apple",
      original_label: "Listeners",
      metric_key: "apple_listeners",
      display_label: "Apple Listeners",
      value: "28",
      previous_value: 26,
      calculated_delta: 2,
      source_reference: "Apple Podcasts Connect — Overview tab",
    }),
    metric({
      source_type: "apple",
      original_label: "Followers",
      metric_key: "apple_followers",
      display_label: "Apple Followers",
      value: "66",
      previous_value: 65,
      calculated_delta: 1,
      source_reference: "Apple Podcasts Connect — Overview tab",
    }),
    metric({
      source_type: "spotify",
      original_label: "Followers",
      metric_key: "spotify_new_followers",
      display_label: "New Spotify Followers",
      value: "2",
      previous_value: 0,
      calculated_delta: 2,
      source_reference: "Spotify for Creators — Home",
    }),
    metric({
      source_type: "apple",
      original_label: "Time Listened",
      metric_key: "apple_time_listened_hours",
      display_label: "Total Listen Time",
      value: "18",
      unit: "hours",
      source_reference: "Apple Podcasts Connect — Overview tab",
    }),
    metric({
      source_type: "apple",
      original_label: "Ratings",
      metric_key: "apple_ratings_count",
      display_label: "Apple Ratings",
      value: "23",
      previous_value: 23,
      calculated_delta: 0,
      source_reference: "PodSEO Ratings & Reviews · Apple Podcasts Connect",
    }),
    metric({
      source_type: "apple",
      original_label: "Rating average",
      metric_key: "apple_ratings_average",
      display_label: "Apple Rating",
      value: "5.0",
      unit: "score",
      source_reference: "PodSEO Ratings & Reviews · Apple Podcasts Connect",
    }),
    metric({
      source_type: "spotify",
      original_label: "Ratings",
      metric_key: "spotify_ratings_count",
      display_label: "Spotify Ratings",
      value: "9",
      previous_value: 9,
      calculated_delta: 0,
      source_reference: "PodSEO Ratings & Reviews",
    }),
    metric({
      source_type: "spotify",
      original_label: "Rating average",
      metric_key: "spotify_ratings_average",
      display_label: "Spotify Rating",
      value: "5.0",
      unit: "score",
      source_reference: "PodSEO Ratings & Reviews",
    }),
    metric({
      source_type: "podseo",
      original_label: "Apple Top 50 Results",
      metric_key: "apple_top50_keyword_count",
      display_label: "Apple Search Rankings",
      value: "159",
      previous_value: 126,
      calculated_delta: 33,
      source_reference: "PodSEO — Organic Visibility + Keyword Tracker",
    }),
    metric({
      source_type: "podseo",
      original_label: "Spotify Top 50 Results",
      metric_key: "spotify_top50_keyword_count",
      display_label: "Spotify Search Rankings",
      value: "87",
      previous_value: 110,
      calculated_delta: -23,
      source_reference: "PodSEO — Organic Visibility + Keyword Tracker",
    }),
    metric({
      source_type: "podseo",
      original_label: "Total Top 50 Visibility",
      metric_key: "podseo_top50_total_results",
      display_label: "Total Top 50 Results",
      value: "221",
      source_reference: "PodSEO — Organic Visibility + Keyword Tracker",
    }),
    metric({
      source_type: "podseo",
      original_label: "Overall Visibility Score",
      metric_key: "podseo_visibility_score",
      display_label: "Overall Visibility Score",
      value: "4.6",
      unit: "score",
      source_reference: "PodSEO — Traction Overview",
    }),
    metric({
      source_type: "podseo",
      original_label: "Visibility Rank",
      metric_key: "podseo_visibility_rank",
      display_label: "Visibility Rank",
      value: "362198",
      unit: "rank",
      previous_value: 364743,
      calculated_delta: 2545,
      source_reference: "PodSEO — Traction Overview",
    }),
    metric({
      source_type: "spotify",
      original_label: "Male",
      metric_key: "spotify_gender_male_pct",
      display_label: "Gender — Male",
      value: "77.4",
      unit: "percent",
      authority_level: "verified_screenshot",
      source_reference: "Spotify for Creators — Audience Demographics (All-Time)",
    }),
    metric({
      source_type: "spotify",
      original_label: "Female",
      metric_key: "spotify_gender_female_pct",
      display_label: "Gender — Female",
      value: "21.5",
      unit: "percent",
      authority_level: "verified_screenshot",
      source_reference: "Spotify for Creators — Audience Demographics (All-Time)",
    }),
    metric({
      source_type: "spotify",
      original_label: "Not Specified",
      metric_key: "spotify_gender_not_specified_pct",
      display_label: "Gender — Not Specified",
      value: "1.1",
      unit: "percent",
      authority_level: "verified_screenshot",
      source_reference: "Spotify for Creators — Audience Demographics (All-Time)",
    }),
    ...[
      ["18-22", "3.8"],
      ["23-27", "10.9"],
      ["28-34", "31.1"],
      ["35-44", "22.4"],
      ["45-59", "27.9"],
      ["60+", "3.0"],
    ].map(([bucket, pct]) =>
      metric({
        source_type: "spotify",
        original_label: bucket,
        metric_key: `spotify_age_${bucket.replace(/[^0-9a-z+]/gi, "")}`,
        display_label: `Age — ${bucket}`,
        value: pct,
        unit: "percent",
        authority_level: "verified_screenshot",
        source_reference: "Spotify for Creators — Audience Demographics (All-Time)",
      }),
    ),
  ];

  const { error: metricsError } = await supabase.from("report_metrics").insert(metrics);
  if (metricsError) throw metricsError;
  console.log(`  inserted ${metrics.length} metrics`);

  console.log("Seeding report sections…");
  const sections: Database["public"]["Tables"]["report_sections"]["Insert"][] = [
    {
      report_id: reportId,
      section_type: "cover",
      display_order: 0,
      content_json: {
        clientName: "MountainWest Capital Network",
        podcastName: "Welcome to the Winners' Circle",
        tagline: "Welcome to the Winners' Circle",
        hosts: "Cheri Waldron & Jason Roberts",
        reportMonth: "June 2026",
        totalEpisodes: 31,
      },
    },
    {
      report_id: reportId,
      section_type: "month_over_month_snapshot",
      display_order: 1,
      content_json: {
        stats: [
          { value: "362", label: "Total downloads", delta: "+41% vs May (256)", deltaDirection: "positive" },
          { value: "28", label: "Apple listeners", delta: "+8% vs May (26)", deltaDirection: "positive" },
          { value: "9", label: "Spotify ratings", delta: "No change", deltaDirection: "neutral" },
          { value: "23", label: "Apple ratings", delta: "No change", deltaDirection: "neutral" },
          { value: "159", label: "Apple search rankings", delta: "+33 vs May (126)", deltaDirection: "positive" },
          { value: "87", label: "Spotify search rankings", delta: "-23 vs May (110)", deltaDirection: "negative" },
          { value: "20", label: "Spotify plays", sublabel: "Spotify only" },
          { value: "342", label: "Apple plays", sublabel: "Apple only" },
        ],
        appleNote:
          "Apple flagged a playback tracking bug this month. Its known effect is to undercount plays, not inflate them — so June's Apple jump (+100%) reads as real growth, not a glitch. Spotify's drop is unrelated (tracked independently) and reads as a real decline; it's also always been our smaller platform here, so its swings show up as bigger percentages on a smaller base. Worth watching: if Apple numbers come in unusually low next month, that's the pattern the bug would actually cause.",
        whatThisMeans:
          "Downloads hit 362, up 41% from May — a strong Apple month (plays and search visibility both up) offsetting a soft Spotify month (plays and consumption both down, likely tied to lower impressions and the compilation episode). Ratings held flat on both platforms; no new reviews in June.",
        sourceLine:
          "Spotify for Creators + Apple Podcasts Connect · Downloads = Apple Plays + Spotify Plays only · Apple noted a play-count tracking issue this month",
      },
    },
    {
      report_id: reportId,
      section_type: "whats_working_focus",
      display_order: 2,
      content_json: {
        whatsWorking:
          "Apple search visibility hit its best month yet — 159 Top 50 rankings, up 33 from May — plus a new #1 on Spotify for \"capital network.\" Core branded terms still hold #1 across platforms, and Apple listeners ticked up to 28.",
        whereToFocus:
          "Spotify plays fell to 20 (-76.7%). June's two releases were a compilation episode and a strong guest episode (FranklinCovey's Paul Walker) — the compilation came in softer, consistent with clip-shows generally underperforming fresh guest content.",
        bigPicture:
          "Strong Apple month, soft Spotify month — two separate stories, since Apple's bug doesn't touch Spotify's numbers. What's real: branded search keeps strengthening (9 unique #1 keywords, up from 8), and FranklinCovey outperformed the compilation on every metric. Same pattern as before — guest profile and promotion drive the swings, not any structural issue with the show.",
      },
    },
    {
      report_id: reportId,
      section_type: "download_history",
      display_order: 3,
      content_json: {
        threeMonth: [
          { label: "Apr '26", value: 453 },
          { label: "May '26", value: 256 },
          { label: "Jun '26", value: 362 },
        ],
        elevenMonth: [
          { label: "Aug '25", value: 141 },
          { label: "Sep '25", value: 113 },
          { label: "Oct '25", value: 148 },
          { label: "Nov '25", value: 238 },
          { label: "Dec '25", value: 149 },
          { label: "Jan '26", value: 246 },
          { label: "Feb '26", value: 212 },
          { label: "Mar '26", value: 244 },
          { label: "Apr '26", value: 453 },
          { label: "May '26", value: 256 },
          { label: "Jun '26", value: 362 },
        ],
        whatThisShows:
          "June's 362 lands between April's all-time high (453) and May's dip back to baseline (256) — a partial recovery, mainly Apple-driven. Apple's tracking bug undercounts rather than inflates, so we're reading this growth as real.",
        quarterlyNote:
          "Quarterly averages have roughly doubled since Q4 2025 — 178/mo (Oct-Dec) → 234/mo (Jan-Mar) → 357/mo (Apr-Jun). Amanda Wallman joined in March 2026 to manage social/promo.",
        sourceLine: "Apple Podcasts Connect + Spotify for Creators · Aug 2025-Jun 2026 monthly totals",
      },
    },
    {
      report_id: reportId,
      section_type: "publishing_day_trends",
      display_order: 4,
      content_json: {
        days: [
          { day: "MON", level: "low", isPublishDay: false },
          { day: "TUE", level: "moderate", isPublishDay: false },
          { day: "WED", level: "moderate", isPublishDay: false },
          { day: "THU", level: "strong", isPublishDay: true },
          { day: "FRI", level: "strong", isPublishDay: false },
          { day: "SAT", level: "moderate", isPublishDay: false },
          { day: "SUN", level: "low", isPublishDay: false },
        ],
        note:
          "Both June episodes went out on Thursday (June 4 and June 18), consistent with the show's cadence every month since launch. We don't have a fresh June-specific day-of-week export this cycle, but nothing in this month's data suggests a change from the established Thursday-peak pattern. No change recommended.",
        sourceLine: "Apple Podcasts Connect + Spotify for Creators · Established publishing-day trend",
      },
    },
    {
      report_id: reportId,
      section_type: "audience",
      display_order: 5,
      content_json: {
        stats: [
          { value: "66", label: "Apple followers", delta: "+2% vs May (65)", deltaDirection: "positive" },
          { value: "2", label: "New Spotify followers", sublabel: "41 → 43 in June" },
          { value: "28", label: "Apple listeners", delta: "+8% vs May (26)", deltaDirection: "positive" },
          { value: "18 hrs", label: "Total listen time", sublabel: "Apple — June 2026" },
        ],
        gender: [
          { label: "Male", percent: 77.4 },
          { label: "Female", percent: 21.5 },
          { label: "Not Specified", percent: 1.1 },
        ],
        age: [
          { label: "18-22", percent: 3.8 },
          { label: "23-27", percent: 10.9 },
          { label: "28-34", percent: 31.1 },
          { label: "35-44", percent: 22.4 },
          { label: "45-59", percent: 27.9 },
          { label: "60+", percent: 3.0 },
        ],
        coreListenerNote:
          "Predominantly male (77.4%) and Utah business-focused, based on all-time data. The audience skews toward established professionals — 28-34 (31.1%) and 45-59 (27.9%) are the two largest brackets, with 35-44 close behind (22.4%). A small remainder (0.9% combined) falls in 0-17 or unspecified-age buckets, too small to matter. Apple followers keep climbing (66, +2% vs. May).",
        sourceLine:
          "Spotify for Creators — Audience Demographics (All-Time) · Apple Podcasts Connect — Overview (June 2026)",
      },
    },
    {
      report_id: reportId,
      section_type: "episode_performance",
      display_order: 6,
      content_json: {
        windowNote:
          "Apple listeners in the first few days after each episode, vs. the show's ~15-listener median. Snapshot taken July 6, 2026 — live figures will keep climbing. Apple's tracking bug undercounts rather than inflates, so these figures are, if anything, conservative.",
        episodes: [
          {
            title: "Leadership Principles Built to Last | The Story Behind FranklinCovey with Paul Walker",
            releasedDate: "Jun 18",
            listeners: 12,
            stayed: 9,
            completionPercent: 74,
            vsTypicalPercent: -20,
            isBest: true,
          },
          {
            title: "The Best of The Winners' Circle | A Compilation of Utah's Top Founders",
            releasedDate: "Jun 4",
            listeners: 11,
            stayed: 7,
            completionPercent: 66,
            vsTypicalPercent: -27,
          },
        ],
        driverNote:
          "FranklinCovey outperformed the compilation on every metric — more listeners, more stay-through, stronger completion. It's a nationally recognized brand, which likely helped both discovery and follow-through. Compilations tend to draw from the existing audience rather than pull in new listeners.",
        completionNote:
          "74% and 66% completion are both strong — above the show's typical range and above Spotify's 50% average this month. Both episodes came in a bit below the ~15-listener median for reach, but people who pressed play stayed. The opportunity is the same one we've flagged before: get more people to start, not keep them once they do.",
        sourceLine:
          "Apple Podcasts Connect — Episode Performance Tab · Snapshot taken July 6, 2026 · Apple noted a play-count tracking issue this month",
      },
    },
    {
      report_id: reportId,
      section_type: "ratings_reviews",
      display_order: 7,
      content_json: {
        apple: { rating: 5.0, count: 23, writtenReviews: 12 },
        spotify: { rating: 5.0, count: 9 },
        reviews: [
          {
            stars: 5,
            title: "Amazing podcast",
            body: "I love listening to these stories, they give real insight to leaders who are solving business problems. It is such an informative platform highlighting the top leaders in the business community.",
            author: "Dads Rock100",
            platform: "Apple Podcasts",
            date: "May 6, 2026",
          },
          {
            stars: 5,
            title: "Winners Circle",
            body: "Authentic stories, great job!",
            author: "Magee0505",
            platform: "Apple Podcasts",
            date: "Feb 4, 2026",
          },
          {
            stars: 5,
            title: "A Must-Listen for Utah's Business Community",
            body: "Fantastic podcast. The interviews spotlight some of Utah's most impressive leaders, and the stories of perseverance and success keep me coming back. Highly recommend!",
            author: "ClubFinley",
            platform: "Apple Podcasts",
            date: "Nov 14, 2025",
          },
        ],
        sourceLine: "PodSEO Ratings & Reviews · Apple Podcasts Connect · July 6, 2026",
      },
    },
    {
      report_id: reportId,
      section_type: "chart_rankings",
      display_order: 8,
      content_json: {
        currentStatus:
          "No chart appearances detected on Apple, Spotify, or Amazon Music in June. MowPod confirmed no chart data for June.",
        isCurrentlyCharting: false,
        historicalPeak: {
          rank: 183,
          category: "Entrepreneurship",
          platform: "Apple Podcasts",
          market: "Sweden",
          period: "2026",
        },
        note:
          "No change from last month — charting takes a concentrated burst of new listeners or ratings, usually following a guest with real reach. FranklinCovey is a good candidate if paired with a direct ratings ask in the next few episodes.",
        sourceLine: "PodSEO Charts · MowPod Chart Rankings · July 6, 2026",
      },
    },
    {
      report_id: reportId,
      section_type: "discovery_impressions",
      display_order: 9,
      content_json: {
        impressions: 374,
        plays: 20,
        conversionRatePercent: 5.3,
        completionRatePercent: 50,
        whatThisMeans:
          "Impressions fell to 374 (-42.5% vs. May) and plays fell to 20 (-76.7%), tracking with the softer Spotify month from the snapshot. But completion rate doubled to 50% — the smaller group who did listen stuck around. The bottleneck is reach, not follow-through.",
        breakdown: [
          { channel: "Search", count: 229 },
          { channel: "Home Feed", count: 120 },
          { channel: "Library", count: 25 },
        ],
        breakdownNote:
          "Search stayed the dominant discovery channel at 61% of impressions (229 of 374) — lines up with the Apple keyword gains. Home Feed impressions (120) grew as a share of the mix, a mild positive for algorithmic discovery even as raw totals fell.",
        history: [
          { month: "March 2026", shown: 295, interested: 108, consumed: 13 },
          { month: "April 2026", shown: 455, interested: 128, consumed: 37 },
          { month: "May 2026", shown: 639, interested: 40, consumed: 25 },
          { month: "June 2026", shown: 374, interested: null, consumed: 20 },
        ],
        sourceLine: "Spotify for Creators — Discovery Tab · June 2026",
      },
    },
    {
      report_id: reportId,
      section_type: "search_visibility",
      display_order: 10,
      content_json: {
        stats: [
          { value: "221", label: "Total Top 50 results you rank for" },
          { value: "159", label: "Apple Top 50 results", delta: "+33 vs May", deltaDirection: "positive" },
          { value: "87", label: "Spotify Top 50 results", delta: "-23 vs May", deltaDirection: "negative" },
          { value: "4.6", label: "Overall visibility score", sublabel: "Out of 10 · Top 9.1% on PodSEO" },
        ],
        rankedNumberOne: [
          "mountainwest capital network (Apple + Spotify)",
          "mountainwest capital (Apple + Spotify)",
          "cheri waldron (Apple + Spotify)",
          "utah 100 winners (Apple + Spotify)",
          "winners circle utah (Apple + Spotify)",
          "business networking utah (Apple)",
          "utah success circle (Apple)",
          "mountainwest network (Spotify)",
          "capital network (Spotify) — new this month",
        ],
        primaryKeywords: ["ceos and founders", "company founders", "mountain west"],
        secondaryKeywords: [
          "business leadership utah",
          "ceo stories",
          "local economy",
          "local leaders interview",
          "local utah businesses",
          "mountainwest",
          "mountainwest capital network",
          "salt lake city",
          "utah 100",
          "winners circle",
        ],
        growingKeywords: [
          "capital network (new #1, Spotify)",
          "utah 100 (up to #3, Spotify)",
          "protiviti consulting (new entry, #4 Spotify)",
          "jason roberts (up, Spotify)",
          "utah entrepreneurship / utah entrepreneurs (up, Spotify)",
        ],
        brightSpotNote:
          "Apple's Top 50 count jumped 33 terms — the show's strongest Apple search showing yet — while \"capital network\" reached #1 on Spotify. A few co-host and topical terms are also on the move (\"jason roberts,\" \"utah entrepreneurship\"), worth watching as they mature. Spotify's dip (-23) looks like a normal correction after several elevated months, not a structural loss — branded #1 positions are unaffected.",
        sourceLine: "PodSEO — Organic Visibility + Keyword Tracker · Pulled July 6, 2026",
      },
    },
    {
      report_id: reportId,
      section_type: "competitor_comparison",
      display_order: 11,
      content_json: {
        competitors: [
          {
            name: "Utah's Morning News",
            visibilityRank: 98016,
            trend: "gaining",
            recentEpisodes: "203 in 30 days",
            notes:
              "Daily news show with a large volume advantage; not a direct content competitor, but the most visible show in this set.",
          },
          {
            name: "Silicon Slopes | Leaders Interviewing Leaders",
            visibilityRank: 182990,
            trend: "gaining",
            recentEpisodes: "0 in 30 days",
            notes: "Best-positioned direct content competitor, though its rank has softened notably since May. Not publishing.",
          },
          {
            name: "KSL's Inside Sources",
            visibilityRank: 338688,
            trend: "losing",
            recentEpisodes: "174 in 30 days",
            notes: "Local news/affairs. High publishing volume but losing visibility ground this period.",
          },
          {
            name: "Small Lake City",
            visibilityRank: 353614,
            trend: "gaining",
            recentEpisodes: "9 in 30 days",
            notes: "Local interest, overlapping audience. Still gaining with modest publishing frequency.",
          },
          {
            name: "MountainWest Capital Network (You)",
            visibilityRank: 362198,
            trend: "gaining",
            recentEpisodes: "2 in 30 days",
            notes: "Holding a steady mid-pack position with consistent biweekly cadence.",
            isClient: true,
          },
          {
            name: "Utah Business",
            visibilityRank: 560669,
            trend: "losing",
            recentEpisodes: "1 in 30 days",
            notes: "Barely publishing, and now losing rank as a result — a reversal from May's algorithm-driven bump.",
          },
        ],
        takeaway:
          "MWCN is holding mid-pack, gaining slightly while Silicon Slopes and Utah Business lose ground due to inconsistent publishing. Utah's Morning News and KSL's Inside Sources remain more visible, but both are high-volume daily news shows, not direct content competitors. Consistent biweekly cadence — the same edge flagged in past reports — remains MWCN's main structural advantage.",
        sourceLine: "PodSEO — Competitive Analysis · Pulled July 1, 2026",
      },
    },
    {
      report_id: reportId,
      section_type: "geography",
      display_order: 12,
      content_json: {
        countries: [{ name: "United States", percent: 100 }],
        note:
          "June's Spotify audience was 100% U.S.-based — tighter than May's small international tail (Israel, Australia, Peru, UK). Apple also shows Salt Lake City as the top listening city. With a small audience, geographic swings like this are expected; the strategy should stay Utah-anchored.",
        sourceLine:
          "Spotify for Creators — Audience Tab — Geo Location (June 2026) · Apple Podcasts Connect — Top Countries/Cities",
      },
    },
    {
      report_id: reportId,
      section_type: "recommendations",
      display_order: 13,
      content_json: {},
    },
  ];

  const { error: sectionsError } = await supabase.from("report_sections").insert(sections);
  if (sectionsError) throw sectionsError;
  console.log(`  inserted ${sections.length} sections`);

  console.log("Seeding recommendations…");
  const recommendations: Database["public"]["Tables"]["recommendations"]["Insert"][] = [
    {
      report_id: reportId,
      text:
        "Watch next month's Apple numbers for pattern — but read June's growth as real. Apple's bug undercounts (episodes marked \"played\" too early, plays missing the 5-second threshold), so June's Apple growth (+100% plays, +33 Top 50 keywords) is likely genuine, possibly conservative. Spotify's decline is unrelated and reads as a real soft month. Worth watching: if a future month's Apple numbers come in unusually low, that's the pattern to check.",
      owner: "lpm",
      display_order: 0,
    },
    {
      report_id: reportId,
      text:
        "Nationally-recognized guests may extend reach beyond Utah. FranklinCovey outperformed the compilation on every metric this month. Worth watching as a pattern, not a strategy to chase — guests are still booked from the Utah Top 100 list, not selected for national name recognition. It's also not yet clear this means international reach: June's Spotify audience was 100% U.S.-based, so any expansion so far looks domestic rather than global.",
      owner: "shared",
      display_order: 1,
    },
    {
      report_id: reportId,
      text:
        "Consistency is still the show's biggest competitive advantage — keep it. Two close competitors (Silicon Slopes, Utah Business) lost visibility this month due to inconsistent publishing. MWCN's biweekly Thursday cadence remains the structural edge that compounds over time — no change needed, just keep it going.",
      owner: "lpm",
      display_order: 2,
    },
  ];

  const { error: recError } = await supabase.from("recommendations").insert(recommendations);
  if (recError) throw recError;
  console.log(`  inserted ${recommendations.length} recommendations`);

  console.log("\nDone.");
  console.log(`Client private report link: ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/r/${client.private_access_token}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
