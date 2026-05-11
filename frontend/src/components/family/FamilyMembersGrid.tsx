import { Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { familyMembers } from "../../data/family";

export default function FamilyMembersGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {familyMembers.map((member) => (
        <div key={member.email} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className={`inline-flex rounded-2xl bg-gradient-to-r ${member.accent} px-4 py-3 text-lg font-black text-white`}>
            {member.initials}
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">{member.name}</h3>
          <p className="mt-1 text-sm font-semibold text-amber-700">{member.title}</p>
          <p className="mt-3 text-sm leading-6 text-gray-600">{member.task}</p>

          <div className="mt-4 space-y-2 rounded-2xl bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>{member.moduleAccess.length === 4 ? "Accès complet" : "Accès dédié"}</span>
            </div>
          </div>

          <Link
            to={member.dashboardPath}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-700"
          >
            Ouvrir son dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ))}
    </div>
  );
}
