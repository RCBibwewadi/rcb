"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2, RefreshCw, Users, UserX } from "lucide-react";

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  user1_status: string;
  user2_status: string;
  match_score: number | null;
  created_at: string;
  user1: {
    id: string;
    name: string;
    email: string;
  };
  user2: {
    id: string;
    name: string;
    email: string;
  };
  user1_profile?: {
    username: string | null;
  } | null;
  user2_profile?: {
    username: string | null;
  } | null;
}

interface UnmatchedUser {
  id: string;
  name: string;
  email: string;
  status: string;
  profile?: {
    username: string | null;
  } | null;
}

export default function MatchesSection() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [unmatchedUsers, setUnmatchedUsers] = useState<UnmatchedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/matchup/matches");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch matches");
      }

      setMatches(data.matches || []);
      setUnmatchedUsers(data.unmatchedUsers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const getCriteria = (match: Match): string => {
    if (match.status === "auto_matched") {
      return "Reconciled";
    }
    if (match.status === "confirmed") {
      return "Accepted Match";
    }
    return match.status;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-rose-tan" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (matches.length === 0 && unmatchedUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto mb-4 text-mauve-wine-light" />
        <p className="text-mauve-wine-light">No matches yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-mauve-wine">Matched Pairs</h3>
          <p className="text-sm text-mauve-wine-light">{matches.length} confirmed matches</p>
        </div>
        <button
          onClick={fetchMatches}
          className="flex items-center gap-2 px-3 py-2 text-sm text-black bg-white border border-rose-tan-light rounded-lg hover:bg-rose-tan-light/20"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {matches.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-rose-tan-light">
                <th className="text-left py-3 px-4 text-sm font-medium text-mauve-wine-light">User 1</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-mauve-wine-light"></th>
                <th className="text-left py-3 px-4 text-sm font-medium text-mauve-wine-light">User 2</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-mauve-wine-light">Score</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-mauve-wine-light">Criteria</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-mauve-wine-light">Date</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id} className="border-b border-rose-tan-light/30 hover:bg-rose-tan-light/10">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-mauve-wine">
                        {match.user1_profile?.username || match.user1.name}
                      </p>
                      <p className="text-xs text-mauve-wine-light">{match.user1.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Heart className="w-5 h-5 text-rose-tan mx-auto" />
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-mauve-wine">
                        {match.user2_profile?.username || match.user2.name}
                      </p>
                      <p className="text-xs text-mauve-wine-light">{match.user2.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {match.match_score !== null ? (
                      <span className="luxury-gradient text-white px-3 py-1 rounded-full text-sm font-medium">
                        {Math.round(match.match_score)}%
                      </span>
                    ) : (
                      <span className="text-mauve-wine-light text-sm">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {match.status === "auto_matched" ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        Reconciled
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Accepted Match
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-mauve-wine-light">
                      {formatDate(match.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {unmatchedUsers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-amber-600" />
            <h4 className="text-lg font-semibold text-mauve-wine">Unmatched Users</h4>
            <span className="text-sm text-mauve-wine-light">({unmatchedUsers.length} users without a match)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rose-tan-light">
                  <th className="text-left py-3 px-4 text-sm font-medium text-mauve-wine-light">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-mauve-wine-light">Email</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-mauve-wine-light">Status</th>
                </tr>
              </thead>
              <tbody>
                {unmatchedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-rose-tan-light/30 hover:bg-rose-tan-light/10">
                    <td className="py-3 px-4">
                      <p className="font-medium text-mauve-wine">
                        {user.profile?.username || user.name}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-mauve-wine-light">{user.email}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        No Match
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
