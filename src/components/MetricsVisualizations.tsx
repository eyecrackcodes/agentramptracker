"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Grid,
  LineChart,
  BarChart,
  DonutChart,
  TabGroup,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Metric,
  Flex,
  Badge,
  Bold,
} from "@tremor/react";
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";

interface Metric {
  id: string;
  agentId: string;
  month: number;
  week: number;
  closeRate: number;
  averagePremium: number;
  placeRate: number;
  capScore: number;
  leadsPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MetricsVisualizationsProps {
  agentId: string;
  metrics: Metric[];
  agentName?: string;
}

export function MetricsVisualizations({
  agentId,
  metrics,
  agentName,
}: MetricsVisualizationsProps) {
  // Format metrics for visualization
  const sortedMetrics = [...metrics].sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.week - b.week;
  });

  // Calculate performance changes
  const getChange = (metrics: Metric[], key: keyof Metric): number => {
    if (metrics.length < 2) return 0;
    const latest = metrics[metrics.length - 1][key] as number;
    const previous = metrics[metrics.length - 2][key] as number;
    if (previous === 0) return 0;
    return ((latest - previous) / previous) * 100;
  };

  // Format change indicator
  const formatChangeIndicator = (
    value: number,
    positive: "up" | "down" = "up"
  ) => {
    const isPositive = value >= 0;
    const Icon = isPositive ? ChevronUp : ChevronDown;
    const color =
      (isPositive && positive === "up") || (!isPositive && positive === "down")
        ? "emerald"
        : "red";

    return (
      <Badge color={color} icon={Icon}>
        {Math.abs(value).toFixed(1)}%
      </Badge>
    );
  };

  // Calculate averages
  const calculateAverage = (
    arr: Metric[],
    key: keyof Metric
  ): number => {
    if (arr.length === 0) return 0;
    return (
      arr.reduce((sum, item) => sum + (item[key] as number), 0) / arr.length
    );
  };

  const avgCloseRate = calculateAverage(metrics, "closeRate");
  const avgPremium = calculateAverage(metrics, "averagePremium");
  const avgPlaceRate = calculateAverage(metrics, "placeRate");
  const avgCapScore = calculateAverage(metrics, "capScore");
  const avgLeadsPerDay = calculateAverage(metrics, "leadsPerDay");

  // Calculate trend change
  const closeRateChange = getChange(sortedMetrics, "closeRate");
  const premiumChange = getChange(sortedMetrics, "averagePremium");
  const placeRateChange = getChange(sortedMetrics, "placeRate");
  const capScoreChange = getChange(sortedMetrics, "capScore");

  // Prepare data for charts
  const timeSeriesData = sortedMetrics.map((metric) => ({
    month: `Month ${metric.month}-W${metric.week}`,
    closeRate: metric.closeRate * 100,
    averagePremium: metric.averagePremium,
    placeRate: metric.placeRate * 100,
    capScore: metric.capScore * 10,
    leadsPerDay: metric.leadsPerDay,
  }));

  const donutData = [
    { name: "Close Rate", value: avgCloseRate * 100 },
    { name: "Place Rate", value: avgPlaceRate * 100 },
  ];

  if (metrics.length === 0) {
    return (
      <Card>
        <Title>Metrics Visualizations</Title>
        <Text className="mt-2">No metrics data available for this agent.</Text>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Title>
          {agentName
            ? `${agentName}'s Metrics Dashboard`
            : "Agent Metrics Dashboard"}
        </Title>
        <Text className="mt-2">
          Performance metrics visualization and insights
        </Text>
      </Card>

      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Text>Close Rate</Text>
          <Flex
            justifyContent="start"
            alignItems="baseline"
            className="space-x-1"
          >
            <Metric>{(avgCloseRate * 100).toFixed(1)}%</Metric>
            {closeRateChange !== 0 &&
              formatChangeIndicator(closeRateChange, "up")}
          </Flex>
          <Text className="mt-2">Average across {metrics.length} entries</Text>
        </Card>

        <Card decoration="top" decorationColor="green">
          <Text>Average Premium</Text>
          <Flex
            justifyContent="start"
            alignItems="baseline"
            className="space-x-1"
          >
            <Metric>${Math.round(avgPremium).toLocaleString()}</Metric>
            {premiumChange !== 0 && formatChangeIndicator(premiumChange, "up")}
          </Flex>
          <Text className="mt-2">Average across {metrics.length} entries</Text>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <Text>Place Rate</Text>
          <Flex
            justifyContent="start"
            alignItems="baseline"
            className="space-x-1"
          >
            <Metric>{(avgPlaceRate * 100).toFixed(1)}%</Metric>
            {placeRateChange !== 0 &&
              formatChangeIndicator(placeRateChange, "up")}
          </Flex>
          <Text className="mt-2">Average across {metrics.length} entries</Text>
        </Card>

        <Card decoration="top" decorationColor="indigo">
          <Text>Cap Score</Text>
          <Flex
            justifyContent="start"
            alignItems="baseline"
            className="space-x-1"
          >
            <Metric>{avgCapScore.toFixed(1)}</Metric>
            {capScoreChange !== 0 &&
              formatChangeIndicator(capScoreChange, "up")}
          </Flex>
          <Text className="mt-2">Average across {metrics.length} entries</Text>
        </Card>
      </Grid>

      <TabGroup>
        <TabList>
          <Tab>Trends Over Time</Tab>
          <Tab>Comparisons</Tab>
          <Tab>Performance Insights</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Grid numItems={1} numItemsSm={2} className="gap-6 mt-6">
              <Card className="min-h-[400px]">
                <Title>Close Rate History</Title>
                <LineChart
                  className="mt-6 h-[300px]"
                  data={timeSeriesData}
                  index="month"
                  categories={["closeRate"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value.toFixed(1)}%`}
                  showLegend={false}
                  yAxisWidth={40}
                  showAnimation={true}
                />
              </Card>

              <Card className="min-h-[400px]">
                <Title>Premium History</Title>
                <LineChart
                  className="mt-6 h-[300px]"
                  data={timeSeriesData}
                  index="month"
                  categories={["averagePremium"]}
                  colors={["green"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  showLegend={false}
                  yAxisWidth={60}
                  showAnimation={true}
                />
              </Card>

              <Card className="min-h-[400px]">
                <Title>Place Rate History</Title>
                <LineChart
                  className="mt-6 h-[300px]"
                  data={timeSeriesData}
                  index="month"
                  categories={["placeRate"]}
                  colors={["amber"]}
                  valueFormatter={(value) => `${value.toFixed(1)}%`}
                  showLegend={false}
                  yAxisWidth={40}
                  showAnimation={true}
                />
              </Card>

              <Card className="min-h-[400px]">
                <Title>Leads Per Day History</Title>
                <BarChart
                  className="mt-6 h-[300px]"
                  data={timeSeriesData}
                  index="month"
                  categories={["leadsPerDay"]}
                  colors={["indigo"]}
                  valueFormatter={(value) => `${value.toFixed(1)}`}
                  showLegend={false}
                  yAxisWidth={40}
                  showAnimation={true}
                />
              </Card>
            </Grid>
          </TabPanel>

          <TabPanel>
            <Grid numItems={1} numItemsSm={2} className="gap-6 mt-6">
              <Card>
                <Title>Close Rate vs Place Rate</Title>
                <DonutChart
                  className="mt-6 h-80"
                  data={donutData}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value.toFixed(1)}%`}
                  colors={["blue", "amber"]}
                  showAnimation={true}
                />
              </Card>

              <Card>
                <Title>Metrics Comparison</Title>
                <BarChart
                  className="mt-6 h-80"
                  data={[
                    {
                      metric: "Close Rate",
                      value: avgCloseRate * 100,
                      target: 25, // Example targets
                    },
                    {
                      metric: "Place Rate",
                      value: avgPlaceRate * 100,
                      target: 65,
                    },
                    {
                      metric: "Cap Score",
                      value: avgCapScore * 10,
                      target: 80,
                    },
                  ]}
                  index="metric"
                  categories={["value", "target"]}
                  colors={["blue", "gray"]}
                  valueFormatter={(value) => `${value.toFixed(1)}%`}
                  showLegend={true}
                  yAxisWidth={40}
                  showAnimation={true}
                />
              </Card>
            </Grid>
          </TabPanel>

          <TabPanel>
            <Card className="mt-6">
              <Title>Performance Insights</Title>
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-md bg-gray-50">
                  <Flex>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <Bold>Close Rate Analysis</Bold>
                      <Text>
                        {closeRateChange > 0
                          ? `Close rate has improved by ${closeRateChange.toFixed(
                              1
                            )}% since the last measurement.`
                          : `Close rate has decreased by ${Math.abs(
                              closeRateChange
                            ).toFixed(1)}% since the last measurement.`}
                        {avgCloseRate > 0.2
                          ? " Current close rate is above target!"
                          : " Current close rate is below target of 20%."}
                      </Text>
                    </div>
                  </Flex>
                </div>

                <div className="p-4 rounded-md bg-gray-50">
                  <Flex>
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <Bold>Premium Analysis</Bold>
                      <Text>
                        {premiumChange > 0
                          ? `Average premium has increased by ${premiumChange.toFixed(
                              1
                            )}%.`
                          : `Average premium has decreased by ${Math.abs(
                              premiumChange
                            ).toFixed(1)}%.`}
                        {avgPremium > 1000
                          ? " Current premium is above target!"
                          : " Current premium is below target of $1,000."}
                      </Text>
                    </div>
                  </Flex>
                </div>

                <div className="p-4 rounded-md bg-gray-50">
                  <Flex>
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <Bold>Place Rate Analysis</Bold>
                      <Text>
                        {placeRateChange > 0
                          ? `Place rate has improved by ${placeRateChange.toFixed(
                              1
                            )}% since the last measurement.`
                          : `Place rate has decreased by ${Math.abs(
                              placeRateChange
                            ).toFixed(1)}% since the last measurement.`}
                        {avgPlaceRate > 0.5
                          ? " Current place rate is above target!"
                          : " Current place rate is below target of 50%."}
                      </Text>
                    </div>
                  </Flex>
                </div>
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
