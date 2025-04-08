import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
} from "@tremor/react";

export default function Dashboard() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Agent Performance Dashboard</Title>
      <Text>Track your performance metrics over time</Text>

      <TabGroup className="mt-6">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Close Rate</Tab>
          <Tab>Average Premium</Tab>
          <Tab>Place Rate</Tab>
          <Tab>CAP Score</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Performance Overview</Title>
                <Text>
                  Your overall performance metrics for the current period
                </Text>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <Title>Close Rate</Title>
                    <Text className="text-2xl font-bold">15.2%</Text>
                    <Text className="text-green-500">
                      +2.3% from last month
                    </Text>
                  </Card>
                  <Card>
                    <Title>Average Premium</Title>
                    <Text className="text-2xl font-bold">$1,250</Text>
                    <Text className="text-green-500">+$50 from last month</Text>
                  </Card>
                  <Card>
                    <Title>Place Rate</Title>
                    <Text className="text-2xl font-bold">68%</Text>
                    <Text className="text-green-500">+3% from last month</Text>
                  </Card>
                  <Card>
                    <Title>CAP Score</Title>
                    <Text className="text-2xl font-bold">120</Text>
                    <Text className="text-green-500">+5 from last month</Text>
                  </Card>
                </div>
              </Card>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Close Rate History</Title>
                <Text>Your close rate performance over time</Text>
                <div className="mt-4 h-72 bg-gray-100 flex items-center justify-center">
                  <Text>Chart will be displayed here</Text>
                </div>
              </Card>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Average Premium History</Title>
                <Text>Your average premium performance over time</Text>
                <div className="mt-4 h-72 bg-gray-100 flex items-center justify-center">
                  <Text>Chart will be displayed here</Text>
                </div>
              </Card>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Place Rate History</Title>
                <Text>Your place rate performance over time</Text>
                <div className="mt-4 h-72 bg-gray-100 flex items-center justify-center">
                  <Text>Chart will be displayed here</Text>
                </div>
              </Card>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>CAP Score History</Title>
                <Text>Your CAP score performance over time</Text>
                <div className="mt-4 h-72 bg-gray-100 flex items-center justify-center">
                  <Text>Chart will be displayed here</Text>
                </div>
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
