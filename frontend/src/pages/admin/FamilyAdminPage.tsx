import { useState } from "react";
import {
  Check,
  Edit2,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  ShieldOff,
  Trash2,
  X,
} from "lucide-react";
import { familyMembers } from "../../data/family";
import { FamilyModuleKey } from "../../data/family";

interface EditingMember {
  email: string;
  moduleAccess: FamilyModuleKey[];
}

const modulesList: { key: FamilyModuleKey; label: string; icon: React.ReactNode }[] = [
  { key: "prod", label: "ByGagoos Prod", icon: "🏢" },
  { key: "ink", label: "ByGagoos Ink", icon: "🎨" },
  { key: "trans", label: "ByGagoos Trans", icon: "🏍️" },
  { key: "cda", label: "ByGagoos CDA", icon: "🍽️" },
];

export default function FamilyAdminPage() {
  const [editing, setEditing] = useState<EditingMember | null>(null);
  const [members, setMembers] = useState(familyMembers);

  const handleEditClick = (email: string) => {
    const member = members.find((m) => m.email === email);
    if (member) {
      setEditing({
        email,
        moduleAccess: member.moduleAccess,
      });
    }
  };

  const handleToggleModule = (module: FamilyModuleKey) => {
    if (!editing) return;

    setEditing({
      ...editing,
      moduleAccess: editing.moduleAccess.includes(module)
        ? editing.moduleAccess.filter((m) => m !== module)
        : [...editing.moduleAccess, module],
    });
  };

  const handleSave = () => {
    if (!editing) return;

    setMembers(
      members.map((m) =>
        m.email === editing.email
          ? { ...m, moduleAccess: editing.moduleAccess }
          : m
      )
    );
    setEditing(null);
  };

  const handleCancel = () => {
    setEditing(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-[2rem] bg-gradient-to-r from-purple-950 via-slate-900 to-stone-900 p-8 text-white shadow-2xl">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Gouvernance
          </div>
          <h1 className="text-4xl font-black sm:text-5xl">Direction Générale & Famille</h1>
          <p className="max-w-3xl text-lg leading-8 text-white/85">
            Gérez les accès des 4 membres de la direction générale à tous les modules
            de ByGagoos. Chaque membre a un rôle défini et des accès dédiés à ses
            responsabilités.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Membres", value: members.length, icon: "👥" },
          {
            label: "Super Admin",
            value: members.filter((m) => m.role === "SUPER_ADMIN").length,
            icon: "👑",
          },
          {
            label: "Admins",
            value: members.filter((m) => m.role === "ADMIN").length,
            icon: "🔐",
          },
          { label: "Modules", value: modulesList.length, icon: "🎯" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Members Grid */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-700">
              Équipe de direction
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {members.length} Membres
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {members.map((member) => {
            const isEditing = editing?.email === member.email;

            return (
              <div
                key={member.email}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  {/* Member Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${member.accent} text-lg font-bold text-white`}
                      >
                        {member.initials}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {member.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          {member.role === "SUPER_ADMIN" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                              <Lock className="h-3 w-3" />
                              Super Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                              <Shield className="h-3 w-3" />
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {member.title}
                      </p>
                      <p className="text-sm text-gray-600">{member.task}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="h-4 w-4" />
                        {member.email}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                        Module principal
                      </p>
                      <div className="inline-flex rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900">
                        {modulesList.find((m) => m.key === member.primaryModule)?.label}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => handleEditClick(member.email)}
                        className="rounded-lg bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-700"
                        title="Modifier les accès"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Module Access */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                    Accès aux modules
                  </p>

                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        {modulesList.map((module) => (
                          <button
                            key={module.key}
                            onClick={() => handleToggleModule(module.key)}
                            className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all ${
                              editing.moduleAccess.includes(module.key)
                                ? "border-purple-300 bg-purple-50"
                                : "border-gray-200 bg-gray-50 hover:border-gray-300"
                            }`}
                          >
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                                editing.moduleAccess.includes(module.key)
                                  ? "border-purple-600 bg-purple-600"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {editing.moduleAccess.includes(module.key) && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900">
                                {module.label}
                              </div>
                            </div>
                            <span className="text-lg">{module.icon}</span>
                          </button>
                        ))}
                      </div>

                      <div className="mt-6 flex gap-2">
                        <button
                          onClick={handleSave}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-700"
                        >
                          <Check className="h-4 w-4" />
                          Valider
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
                        >
                          <X className="h-4 w-4" />
                          Annuler
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {member.moduleAccess.map((moduleKey) => {
                        const module = modulesList.find((m) => m.key === moduleKey);
                        return (
                          <span
                            key={moduleKey}
                            className="inline-flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-2 text-sm font-semibold text-purple-700"
                          >
                            {module?.icon} {module?.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Info Box */}
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex gap-4">
          <ShieldCheck className="h-6 w-6 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-bold text-blue-900">À propos des accès</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• Chaque membre a un rôle (Super Admin ou Admin) assigné</li>
              <li>• Les accès aux modules peuvent être ajustés selon les responsabilités</li>
              <li>• Le Super Admin a accès à tous les modules par défaut</li>
              <li>• Les changements sont appliqués immédiatement</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
