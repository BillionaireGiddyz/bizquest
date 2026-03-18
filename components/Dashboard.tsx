import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, BarChart3, Compass, Radio, Store } from 'lucide-react';
import { AnalysisResult } from '../types';
import { AnalysisEmptyState } from './AnalysisEmptyState';
import { BuildBusinessSection } from './BuildBusinessSection';
import { CollapsibleInsightSection } from './CollapsibleInsightSection';
import { ExpandableMetricCard, MetricTone } from './ExpandableMetricCard';
import { RecommendationBlock } from './RecommendationBlock';
import { VerdictCard } from './VerdictCard';

interface DashboardProps {
  data: AnalysisResult | null;
}

type MetricKey = 'demand' | 'saturation' | 'competition' | 'timing';

function stripMarkdown(input: string) {
  return input
    .replace(/[*_`>#-]/g, ' ')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function takeFirstSentence(text: string) {
  const clean = stripMarkdown(text);
  const match = clean.match(/.*?[.!?](?:\s|$)/);
  return (match?.[0] || clean).trim();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getConfidence(data: AnalysisResult) {
  const recommendationBias = data.recommendation === 'GO' ? 82 : data.recommendation === 'BE CAREFUL' ? 68 : 57;
  const trendBias = data.trendDirection === 'rising' ? 6 : data.trendDirection === 'declining' ? -6 : 0;
  const timingBias = data.timingStatus === 'Early' ? 6 : data.timingStatus === 'Late' ? -6 : 0;
  const competitionBias = data.competitionLevel === 'Low' ? 5 : data.competitionLevel === 'High' ? -5 : 0;
  return clamp(recommendationBias + trendBias + timingBias + competitionBias, 42, 94);
}

function getMetricTone(key: MetricKey, data: AnalysisResult): MetricTone {
  if (key === 'demand') return data.demandScore >= 65 ? 'emerald' : data.demandScore < 40 ? 'rose' : 'amber';
  if (key === 'saturation') return data.saturationLevel === 'Low' ? 'emerald' : data.saturationLevel === 'High' ? 'rose' : 'amber';
  if (key === 'competition') return data.competitionLevel === 'Low' ? 'emerald' : data.competitionLevel === 'High' ? 'rose' : 'amber';
  return data.timingStatus === 'Early' ? 'emerald' : data.timingStatus === 'Late' ? 'rose' : 'blue';
}

function getMetricDetails(data: AnalysisResult) {
  const demandSummary =
    data.demandScore >= 70
      ? 'Interest is already present, so discovery should not rely on pure education.'
      : data.demandScore >= 45
        ? 'Demand exists, but positioning and execution quality will matter more.'
        : 'Demand is not naturally carrying this idea yet, so traction will require more work.';

  const saturationSummary =
    data.saturationLevel === 'Low'
      ? 'The market still has room, which gives a cleaner entry point.'
      : data.saturationLevel === 'Medium'
        ? 'The market is active, so you need a sharper hook to stand out.'
        : 'The market is crowded, making acquisition and pricing pressure more difficult.';

  const competitionSummary =
    data.competitionLevel === 'Low'
      ? 'You are not walking into heavy local pressure yet.'
      : data.competitionLevel === 'Medium'
        ? 'Competition is present, but not overwhelming if the offer is clearer.'
        : 'Direct competitive pressure is already high, which narrows margin for error.';

  const timingSummary =
    data.timingStatus === 'Early'
      ? 'Timing is favorable, so a focused launch can capture attention sooner.'
      : data.timingStatus === 'On-time'
        ? 'The market is viable now, but speed and execution discipline matter.'
        : 'Timing looks late, so the current window may be less forgiving.';

  return {
    demand: {
      title: 'Demand',
      value: `${data.demandScore}/100`,
      eyebrow: data.trendDirection === 'rising' ? 'Rising' : data.trendDirection === 'declining' ? 'Cooling' : 'Stable',
      summary: demandSummary,
      explanation: `BizQuest is reading a ${data.demandScore}/100 demand signal from live search activity, pricing context, and query momentum around ${data.productName.toLowerCase()} in ${data.location}.`,
      signals: [`${data.googleTrendsAvg}/100 average search interest`, `${data.trendDirection} trend direction`, data.priceRange],
      implication:
        data.demandScore >= 65
          ? 'Lead with a focused launch and validate conversion quickly.'
          : data.demandScore >= 45
            ? 'Refine the offer and test positioning before scaling spend.'
            : 'Validate demand with a smaller pilot before committing meaningful capital.',
    },
    saturation: {
      title: 'Saturation',
      value: data.saturationLevel,
      summary: saturationSummary,
      explanation: 'Saturation reflects how crowded the market feels once BizQuest weighs visible supply pressure, competitor presence, and how distinct the idea is likely to appear.',
      signals: [
        `${data.competitorCount} visible nearby competitors`,
        data.relatedSearches[0] || 'Related demand exists',
        data.saturationLevel === 'Low' ? 'Clearer whitespace' : 'More offer overlap',
      ],
      implication:
        data.saturationLevel === 'Low'
          ? 'You can enter with a simpler offer and still look distinct.'
          : data.saturationLevel === 'Medium'
            ? 'Differentiation in packaging, messaging, or convenience is important.'
            : 'You need a narrower niche or materially better economics to win.',
    },
    competition: {
      title: 'Competition',
      value: data.competitionLevel,
      eyebrow: data.competitorCount > 0 ? `${data.competitorCount} nearby` : undefined,
      summary: competitionSummary,
      explanation: 'Competition captures how much local pressure a new entrant should expect based on nearby operators, category overlap, and the strength of visible substitutes.',
      signals: [
        `${data.competitorCount} mapped competitors`,
        data.nearbyCompetitors[0] || 'No major named competitor surfaced',
        data.bestSellingChannels[0] || 'Channel competition still matters',
      ],
      implication:
        data.competitionLevel === 'Low'
          ? 'A clean launch with fast execution can establish presence early.'
          : data.competitionLevel === 'Medium'
            ? 'Compete on clarity, convenience, and first-impression trust.'
            : 'Avoid generic entry and only proceed with a sharper wedge.',
    },
    timing: {
      title: 'Market timing',
      value: data.timingStatus,
      summary: timingSummary,
      explanation: 'Timing tells you whether this is a favorable moment to move, based on demand direction, competitive pressure, and how early the opportunity still feels.',
      signals: [
        `${data.trendDirection} demand momentum`,
        `${data.timingStatus} window`,
        data.keyInsights[0] || 'Current market window assessed',
      ],
      implication:
        data.timingStatus === 'Early'
          ? 'Move while discovery costs and positioning complexity are still manageable.'
          : data.timingStatus === 'On-time'
            ? 'Launch in a disciplined way and watch early conversion closely.'
            : 'Delay or reposition unless you have a structural edge.',
    },
  };
}

function getRecommendationSummary(data: AnalysisResult) {
  if (data.recommendation === 'GO') {
    return `The signal supports moving forward in ${data.location}, but with a focused offer instead of a broad launch. Demand and timing are doing enough work that your next step should be execution, not more abstract debate.`;
  }
  if (data.recommendation === 'BE CAREFUL') {
    return 'This is not a clear no, but it does need discipline. The opportunity is there, yet the market pressure suggests you should validate the offer in a smaller, cheaper way before expanding.';
  }
  return 'The current setup looks too risky relative to the payoff. Treat this as a prompt to reposition the idea or narrow the segment before committing inventory, rent, or acquisition budget.';
}

function getRecommendationBullets(data: AnalysisResult) {
  const bullets = [
    data.keyInsights[0] || 'Start with one narrow offer instead of a broad catalog.',
    data.bestSellingChannels[0]
      ? `Use ${data.bestSellingChannels[0]} as the first traction channel and keep the message specific.`
      : 'Lead with one channel first so the signal stays easy to read.',
    data.trendDirection === 'rising'
      ? 'Move quickly enough to capture current momentum, but keep the first launch small.'
      : data.trendDirection === 'declining'
        ? 'Lower your initial risk and test a tighter position before spending aggressively.'
        : 'Use a short pilot to validate conversion before scaling the business further.',
  ];

  return bullets.slice(0, 3);
}

function parsePriceRange(priceRange: string) {
  const values = Array.from(priceRange.matchAll(/\d[\d,.]*/g)).map((match) => Number(match[0].replace(/,/g, '')));
  return {
    low: values[0] ?? null,
    high: values[1] ?? values[0] ?? null,
  };
}

function formatCurrency(value: number | null, priceRange: string) {
  if (value == null) return 'Modest initial setup';
  const currency = priceRange.includes('KES') ? 'KES ' : priceRange.includes('$') ? '$' : '';
  return `${currency}${Math.round(value).toLocaleString()}`;
}

function getBuildBusinessData(data: AnalysisResult) {
  const parsed = parsePriceRange(data.priceRange);
  const baseLow = parsed.low ? parsed.low * 10 : data.recommendation === 'GO' ? 18000 : 12000;
  const baseHigh = parsed.high ? parsed.high * 22 : data.recommendation === 'GO' ? 50000 : 32000;
  const competitionFactor = data.competitionLevel === 'High' ? 1.25 : data.competitionLevel === 'Low' ? 0.9 : 1;

  return {
    startupCost: `${formatCurrency(baseLow * competitionFactor, data.priceRange)}-${formatCurrency(baseHigh * competitionFactor, data.priceRange)}`,
    pricingHint:
      parsed.low && parsed.high
        ? `Anchor near ${data.priceRange} and differentiate with packaging or convenience.`
        : 'Price close to the strongest visible market expectation, then test for lift.',
    firstMarketingAngle: data.targetDemographic
      ? `Speak directly to ${data.targetDemographic.toLowerCase()} with a practical outcome.`
      : 'Lead with the clearest practical benefit instead of a generic product pitch.',
    checklist: [
      `Test one offer in ${data.location} before widening the assortment.`,
      `Validate demand on ${data.bestSellingChannels[0] || 'your first traction channel'} with a short launch sprint.`,
      `Benchmark against ${Math.max(data.competitorCount, 3)} visible alternatives before committing more spend.`,
      data.recommendation === 'GO'
        ? 'Move into a controlled launch and monitor repeat purchase signals quickly.'
        : 'Treat the first launch as a low-risk validation round, not a full rollout.',
    ],
  };
}

function getTrendSnapshot(data: AnalysisResult) {
  const points = data.trendData?.slice(-6) || [];
  const max = Math.max(...points.map((point) => point.interestLevel), 1);
  return points.map((point) => ({
    ...point,
    height: `${Math.max(18, Math.round((point.interestLevel / max) * 100))}%`,
  }));
}

function getRationale(data: AnalysisResult) {
  const primary = takeFirstSentence(data.chatResponse || data.explanation);
  return primary.length > 160 ? `${primary.slice(0, 157).trimEnd()}...` : primary;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [openMetric, setOpenMetric] = React.useState<MetricKey | null>(null);

  React.useEffect(() => {
    setOpenMetric(null);
  }, [data?.productName, data?.location]);

  if (!data) {
    return <AnalysisEmptyState />;
  }

  const confidence = getConfidence(data);
  const rationale = getRationale(data);
  const metrics = getMetricDetails(data);
  const buildBusiness = getBuildBusinessData(data);
  const trendSnapshot = getTrendSnapshot(data);

  return (
    <div className="h-full overflow-y-auto pr-2 pb-10 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
      <div className="space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.26)] sm:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1.5">{data.location === 'General' ? 'Global market' : data.location}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                <span className="rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">{data.priceRange}</span>
              </div>

              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{data.productName}</h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{rationale}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                  <Radio className="h-4 w-4 text-emerald-600" />
                  Verified by live market signals
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                  <Compass className="h-4 w-4 text-indigo-600" />
                  One glance, one answer, confidence
                </div>
              </div>
            </div>

            <div className="w-full max-w-sm xl:min-w-[320px]">
              <VerdictCard recommendation={data.recommendation} confidence={confidence} rationale={rationale} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(metrics) as MetricKey[]).map((key) => {
            const metric = metrics[key];
            return (
              <ExpandableMetricCard
                key={key}
                title={metric.title}
                value={metric.value}
                eyebrow={metric.eyebrow}
                summary={metric.summary}
                explanation={metric.explanation}
                signals={metric.signals}
                implication={metric.implication}
                tone={getMetricTone(key, data)}
                isOpen={openMetric === key}
                onToggle={() => setOpenMetric((current) => (current === key ? null : key))}
              />
            );
          })}
        </section>

        <RecommendationBlock
          heading={data.recommendation === 'GO' ? 'Move into a focused launch' : data.recommendation === 'BE CAREFUL' ? 'Validate carefully before scaling' : 'Reposition before committing'}
          summary={getRecommendationSummary(data)}
          bullets={getRecommendationBullets(data)}
        />

        <BuildBusinessSection
          startupCost={buildBusiness.startupCost}
          pricingHint={buildBusiness.pricingHint}
          firstMarketingAngle={buildBusiness.firstMarketingAngle}
          checklist={buildBusiness.checklist}
        />

        <CollapsibleInsightSection title="Advanced insights" subtitle="Open the deeper market context only when you want supporting detail.">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Extended rationale</p>
                <div className="prose prose-sm prose-slate mt-4 max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
                  <ReactMarkdown>{data.explanation}</ReactMarkdown>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Audience angle</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{data.targetDemographic || 'General urban buyers with immediate need signals.'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Signal sources</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.dataSources.slice(0, 6).map((source) => (
                      <span key={source} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Trend snapshot</p>
                    <p className="mt-2 text-sm text-slate-600">A lightweight read on recent market interest.</p>
                  </div>
                  <div className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">{data.googleTrendsAvg}/100 avg</div>
                </div>
                <div className="mt-5 flex h-28 items-end gap-2">
                  {trendSnapshot.length > 0 ? (
                    trendSnapshot.map((point) => (
                      <div key={`${point.period}-${point.interestLevel}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                        <div className="flex h-20 w-full items-end">
                          <div className="w-full rounded-t-2xl bg-slate-900/80" style={{ height: point.height }} />
                        </div>
                        <span className="truncate text-[11px] font-medium text-slate-500">{point.period}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full items-center text-sm text-slate-500">Trend data becomes visible after analysis.</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Related searches</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.relatedSearches.slice(0, 8).map((term) => (
                    <span key={term} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Competitive context</p>
                    <p className="mt-2 text-sm text-slate-600">Visible nearby pressure and market alternatives.</p>
                  </div>
                  <div className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">{data.competitorCount} nearby</div>
                </div>
                <div className="mt-4 space-y-2">
                  {data.nearbyCompetitors.slice(0, 5).map((competitor) => (
                    <div key={competitor} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                      <Store className="h-4 w-4 text-slate-400" />
                      {competitor}
                    </div>
                  ))}
                  {data.nearbyCompetitors.length === 0 && (
                    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-600">No major named nearby competitors surfaced in this pass.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleInsightSection>

        <section className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Decision frame</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                BizQuest keeps the top line visible first: verdict, confidence, four essential signals, then optional execution depth when you ask for it.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              Minimal by default, deeper on demand
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
