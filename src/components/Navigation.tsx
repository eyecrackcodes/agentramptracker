"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTeamAgent } from "../context/TeamAgentContext";
import { PlusCircle, Users, BarChart } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const { selectedAgent } = useTeamAgent();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                Agent Ramp Tracker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/")
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <BarChart className="h-4 w-4 mr-1" /> Dashboard
              </Link>
              <Link
                href="/metrics"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/metrics")
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Metrics
              </Link>
              <Link
                href="/teams"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/teams")
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Teams
              </Link>
              <Link
                href="/agent-status"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/agent-status")
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Users className="h-4 w-4 mr-1" /> Agent Status
              </Link>
              <Link
                href="/quick-add"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/quick-add")
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Quick Add
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {selectedAgent && (
              <div className="text-sm text-gray-500">
                {selectedAgent.firstName} {selectedAgent.lastName}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
