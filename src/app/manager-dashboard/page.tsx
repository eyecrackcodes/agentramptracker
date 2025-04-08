import { Metadata } from "next";
import TeamOverview from "../../components/TeamOverview";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Manager Dashboard | Agent Ramp Tracker",
  description: "View and manage your teams' performance and development",
};

export default async function ManagerDashboard() {
  let teams = [];
  let error = null;

  try {
    const headersList = headers();
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = headersList.get("host") || "localhost:3000";

    console.log(`Fetching teams from ${protocol}://${host}/api/teams`);

    const response = await fetch(`${protocol}://${host}/api/teams`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Expected JSON but got ${contentType}`);
    }

    const text = await response.text();

    // Handle empty responses
    if (!text.trim()) {
      throw new Error("API returned empty response");
    }

    try {
      teams = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse JSON:", text.substring(0, 100) + "...");
      const errorMessage =
        parseError instanceof Error ? parseError.message : String(parseError);
      throw new Error(`Invalid JSON response: ${errorMessage}`);
    }
  } catch (err) {
    console.error("Error fetching teams:", err);
    error = err instanceof Error ? err.message : "Unknown error occurred";
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>

      {error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Error Loading Teams
          </h2>
          <p className="text-red-600">{error}</p>
          <p className="mt-4 text-gray-700">
            This could be due to missing API configuration or database
            connection issues. Please contact your administrator.
          </p>
        </div>
      ) : teams.length > 0 ? (
        <div className="grid gap-6">
          {teams.map((team: any) => (
            <TeamOverview key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-700 mb-2">
            No Teams Found
          </h2>
          <p className="text-gray-700">
            There are no teams configured in the system yet.
          </p>
        </div>
      )}
    </main>
  );
}
