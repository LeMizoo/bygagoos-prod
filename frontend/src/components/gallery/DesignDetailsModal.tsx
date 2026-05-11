import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Tag, Palette, Sparkles, X, Eye, Heart } from "lucide-react";
import { normalizeImageUrl } from "../../utils/imageUrl";

export interface GalleryDesignDetails {
  _id?: string;
  id?: string | number;
  title: string;
  description?: string;
  category?: string;
  collection?: string;
  image?: string;
  thumbnail?: string;
  tags?: string[];
  price?: number;
  likes?: number;
  artist?: string;
  ethnicGroup?: string;
  colors?: string[];
  createdAt?: string;
  isActive?: boolean;
  featured?: boolean;
  new?: boolean;
}

interface DesignDetailsModalProps {
  open: boolean;
  design: GalleryDesignDetails | null;
  onClose: () => void;
}

const formatDate = (value?: string) => {
  if (!value) return "Date non disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date non disponible";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatPrice = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "Prix sur demande";
  return new Intl.NumberFormat("fr-FR").format(value) + " Ar";
};

export default function DesignDetailsModal({
  open,
  design,
  onClose,
}: DesignDetailsModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && design ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Détails du design ${design.title}`}
        >
          <motion.div
            className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ scale: 0.95, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 24, opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
              aria-label="Fermer les détails"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid max-h-[90vh] grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[320px] bg-gradient-to-br from-amber-950 via-amber-900 to-gray-950 p-4 sm:p-6 lg:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(251,191,36,0.15),transparent_30%)]" />
                <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  <img
                    src={normalizeImageUrl(design.thumbnail || design.image)}
                    alt={design.title}
                    className="h-full w-full object-contain bg-black/10"
                  />
                </div>
                <div className="relative mt-4 flex flex-wrap gap-2">
                  {design.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                      En vedette
                    </span>
                  )}
                  {design.new && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      Nouveau
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${design.isActive === false ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    <Eye className="h-3.5 w-3.5" />
                    {design.isActive === false ? "Inactif" : "Visible"}
                  </span>
                </div>
              </div>

              <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-6 lg:p-8">
                <div className="mb-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {design.category && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {design.category}
                      </span>
                    )}
                    {design.collection && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {design.collection}
                      </span>
                    )}
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {formatPrice(design.price)}
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                    {design.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Par {design.artist || "ByGagoos Ink"} · Publié le {formatDate(design.createdAt)}
                  </p>
                </div>

                {design.description && (
                  <div className="mb-6 rounded-2xl bg-gray-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Description
                    </p>
                    <p className="mt-3 leading-7 text-gray-700">
                      {design.description}
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Tag className="h-4 w-4 text-amber-600" />
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {design.tags && design.tags.length > 0 ? (
                        design.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Aucun tag</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Palette className="h-4 w-4 text-amber-600" />
                      Couleurs
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {design.colors && design.colors.length > 0 ? (
                        design.colors.map((color) => (
                          <span
                            key={color}
                            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700"
                          >
                            {color}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Aucune couleur renseignée</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-900">Image principale</p>
                    <p className="mt-1 text-sm text-gray-500">
                      La miniature affichée dans la galerie et le dashboard.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-900">Statistiques rapides</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-4 w-4 text-rose-500" />
                        {design.likes ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4 text-gray-500" />
                        {formatDate(design.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
