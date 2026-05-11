import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Bike, Plus, RefreshCw, Search, Trash2, Wrench, Fuel, ShieldCheck } from "lucide-react";
import taxiVehiclesApi from "../../api/taxiVehicles.api";
import type { CreateTaxiVehicleDto, TaxiVehicle, TaxiVehicleStats, TaxiVehicleStatus } from "../../types/taxi";
import dev from "../../utils/devLogger";

const statusLabels: Record<TaxiVehicleStatus, string> = {
  AVAILABLE: "Disponible",
  IN_SERVICE: "En service",
  MAINTENANCE: "Maintenance",
  RENTED: "Loué",
  OFFLINE: "Hors ligne",
};

const statusClasses: Record<TaxiVehicleStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  IN_SERVICE: "bg-blue-100 text-blue-800",
  MAINTENANCE: "bg-amber-100 text-amber-800",
  RENTED: "bg-purple-100 text-purple-800",
  OFFLINE: "bg-gray-100 text-gray-800",
};

const emptyForm: CreateTaxiVehicleDto = {
  plateNumber: "",
  brand: "",
  model: "",
  color: "",
  year: undefined,
  status: "AVAILABLE",
  currentMileage: undefined,
  notes: "",
};

export default function TaxiVehiclesPage() {
  const [vehicles, setVehicles] = useState<TaxiVehicle[]>([]);
  const [stats, setStats] = useState<TaxiVehicleStats>({ total: 0, byStatus: {}, recent: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CreateTaxiVehicleDto>(emptyForm);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const [list, summary] = await Promise.all([
        taxiVehiclesApi.getAll({ limit: 100, sortBy: "createdAt", sortOrder: "desc" }),
        taxiVehiclesApi.getStats(),
      ]);
      setVehicles(list);
      setStats(summary);
    } catch (error) {
      dev.error("Erreur chargement véhicules taxi:", error);
      setVehicles([]);
      setStats({ total: 0, byStatus: {}, recent: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vehicles;

    return vehicles.filter((vehicle) =>
      [vehicle.plateNumber, vehicle.brand, vehicle.model, vehicle.color, vehicle.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [search, vehicles]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      await taxiVehiclesApi.create({
        ...form,
        year: form.year ? Number(form.year) : undefined,
        currentMileage: form.currentMileage ? Number(form.currentMileage) : undefined,
      });
      setForm(emptyForm);
      await loadVehicles();
    } catch (error) {
      dev.error("Erreur création véhicule taxi:", error);
      alert("Impossible de créer le véhicule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Désactiver ce véhicule ?")) return;

    try {
      await taxiVehiclesApi.delete(id);
      await loadVehicles();
    } catch (error) {
      dev.error("Erreur suppression véhicule taxi:", error);
      alert("Impossible de supprimer le véhicule");
    }
  };

  const handleStatusChange = async (vehicle: TaxiVehicle, status: TaxiVehicleStatus) => {
    try {
      await taxiVehiclesApi.update(vehicle.id, { status });
      await loadVehicles();
    } catch (error) {
      dev.error("Erreur mise à jour véhicule taxi:", error);
      alert("Impossible de mettre à jour le statut");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
            <Bike className="h-4 w-4" />
            Taxi-Moto
          </p>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Gestion de flotte</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Gérez les véhicules de la flotte Taxi-Moto dans un module isolé du reste de l’activité sérigraphie.
          </p>
        </div>

        <button
          type="button"
          onClick={loadVehicles}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Véhicules" value={stats.total} icon={<Bike className="h-5 w-5 text-amber-600" />} />
        <StatCard label="Disponibles" value={stats.byStatus.AVAILABLE || 0} icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />} />
        <StatCard label="En service" value={stats.byStatus.IN_SERVICE || 0} icon={<Fuel className="h-5 w-5 text-blue-600" />} />
        <StatCard label="Ajouts récents" value={stats.recent} icon={<Wrench className="h-5 w-5 text-purple-600" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Véhicules</h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une plaque, marque, modèle..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-0 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-600">Chargement des véhicules...</div>
            ) : filteredVehicles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun véhicule trouvé. Créez le premier véhicule de la flotte.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Véhicule</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">État</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Km</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{vehicle.plateNumber}</p>
                            <p className="text-sm text-gray-600">
                              {vehicle.brand} {vehicle.model}
                              {vehicle.color ? ` · ${vehicle.color}` : ""}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {vehicle.year ? `${vehicle.year} · ` : ""}
                              {vehicle.notes || "Aucune note"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={vehicle.status}
                            onChange={(e) => handleStatusChange(vehicle, e.target.value as TaxiVehicleStatus)}
                            className={`rounded-full border-0 px-3 py-2 text-xs font-semibold ${statusClasses[vehicle.status]}`}
                          >
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {vehicle.currentMileage ? `${vehicle.currentMileage.toLocaleString()} km` : "N/A"}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleDelete(vehicle.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Désactiver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Nouveau véhicule</h2>
          <p className="mt-2 text-sm text-gray-600">
            Premier pas du module taxi: ajoutez une plaque, une marque et un modèle, puis pilotez la flotte depuis ici.
          </p>

          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <InputField
              label="Plaque"
              value={form.plateNumber}
              onChange={(value) => setForm((prev) => ({ ...prev, plateNumber: value }))}
              placeholder="TG-123-AB"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Marque"
                value={form.brand || ""}
                onChange={(value) => setForm((prev) => ({ ...prev, brand: value }))}
                placeholder="Honda"
                required
              />
              <InputField
                label="Modèle"
                value={form.model || ""}
                onChange={(value) => setForm((prev) => ({ ...prev, model: value }))}
                placeholder="Wave"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Couleur"
                value={form.color || ""}
                onChange={(value) => setForm((prev) => ({ ...prev, color: value }))}
                placeholder="Rouge"
              />
              <InputField
                label="Année"
                value={form.year ? String(form.year) : ""}
                onChange={(value) => setForm((prev) => ({ ...prev, year: value ? Number(value) : undefined }))}
                placeholder="2024"
                type="number"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Kilométrage"
                value={form.currentMileage ? String(form.currentMileage) : ""}
                onChange={(value) => setForm((prev) => ({ ...prev, currentMileage: value ? Number(value) : undefined }))}
                placeholder="12000"
                type="number"
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Statut</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as TaxiVehicleStatus }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={4}
                placeholder="Contrat, assurance, maintenance..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Création..." : "Ajouter le véhicule"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3">{icon}</div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
      />
    </div>
  );
}
