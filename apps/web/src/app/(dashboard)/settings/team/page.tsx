"use client";

import AddTesterMember from "./add-tester-member";
import InviteTeamMember from "./invite-team-member";
import TeamMembersList from "./team-members-list";

export default function TeamsPage() {
  return (
    <div>
      <div className="flex justify-end gap-2">
        <AddTesterMember />
        <InviteTeamMember />
      </div>
      <TeamMembersList />
    </div>
  );
}
