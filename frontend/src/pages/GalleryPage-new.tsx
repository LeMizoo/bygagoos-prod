// frontend/src/pages/GalleryPage-new.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Grid,
  List,
  X,
  Heart,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye,
  Star,
  ShoppingBag,
  Tag,
  Palette,
  MapPin,
  Cross,
  ArrowRight,
  Loader
} from "lucide-react";
import VaguesEmeraudeLogo from "../components/VaguesEmeraudeLogo";
import { useGallery } from "../hooks/useDesigns";
import { useAutoInvalidateQueries } from "../hooks/useAutoInvalidate";

// Type pour les designs de l'API (identique à celui de GalleryPage)
interface ApiDesign {
  _id: string;
  id?: string;
  title: string;
  name?: string;
  description?: string;
  category?: string;
  collection?: string;
  image?: string;
  thumbnail?: string;
  tags?: string[];
  price?: number;
  isActive: boolean;
  createdAt: string;
  likes?: number;
  artist?: string;
  featured?: boolean;
  new?: boolean;
  ethnicGroup?: string;
  colors?: string[];
}

interface Category {
  title: string;
  count: number;
  image: string;
  description: string;
  slug: string;
}

// Données des catégories (inchangées)
const categories: Category[] = [
  {
    title: "Tous",
    count: 0,
    image: "/production/atelier-serigraphie.jpg",
    description: "Toutes les créations uniques",
    slug: "all",
  },
  {
    title: "T-Shirts",
    count: 0,
    image: "/production/atelier-serigraphie.jpg",
    description: "Créations uniques sur textile inspirées des motifs traditionnels",
    slug: "t-shirts",
  },
  {
    title: "Lamba & Lambahoany",
    count: 0,
    image: "/production/equipe-serigraphie.jpg",
    description: "Tissages traditionnels revisités pour la mode contemporaine",
    slug: "lamba",
  },
  {
    title: "Art Mural",
    count: 0,
    image: "/production/marcel-prod.jpg",
    description: "Sérigraphie inspirée des symboles et fady malgaches",
    slug: "art-mural",
  },
  {
    title: "Édition Limitée",
    count: 0,
    image: "/production/marcelin-prod.jpg",
    description: "Collections exclusives hommage aux 18 ethnies",
    slug: "edition-limitee",
  },
];

const teamPhotos: string[] = [
  "/production/mbin-prod.jpg",
  "/production/miadrisoa-prod.jpg",
  "/production/ntsoa-prod.jpg",
  "/production/equipe-prod-02.jpg",
  "/production/equipe-prod-03.jpg",
  "/production/equipe-prod-04.jpg",
  "/production/equipe-prod-06.jpg",
  "/production/equipe-prod-07.jpg",
  "/production/equipe-prod-08.jpg",
];

type SortOption = "popular" | "recent" | "price-asc" | "price-desc";
type ViewMode = "grid" | "list";

export default function GalleryPageNew() {
  useAutoInvalidateQueries();
  const { data: galleryData, isLoading } = useGallery({ limit: 50 });

  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [selectedCollection, setSelectedCollection] = useState<string>("Tous");
  const [selectedEthnicGroup, setSelectedEthnicGroup] = useState<string>("Tous");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    featured: false,
    new: false,
    priceRange: [0, 100] as [number, number],
  });

  const backendDesigns: ApiDesign[] = useMemo(() => {
    return galleryData?.data?.designs || [];
  }, [galleryData]);

  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(backendDesigns.map((d: ApiDesign) => d.category).filter(Boolean))) as string[];
    return ["Tous", ...cats];
  }, [backendDesigns]);

  const collectionOptions = useMemo(() => {
    const collections = backendDesigns
      .filter((d: ApiDesign) => d.collection)
      .map((d: ApiDesign) => d.collection) as string[];
    return ["Tous", ...Array.from(new Set(collections))];
  }, [backendDesigns]);

  const ethnicGroupOptions = useMemo(() => {
    const groups = backendDesigns
      .filter((d: ApiDesign) => d.ethnicGroup)
      .map((d: ApiDesign) => d.ethnicGroup) as string[];
    return ["Tous", ...Array.from(new Set(groups))];
  }, [backendDesigns]);

  const filteredDesigns = useMemo(() => {
    let filtered = [...backendDesigns];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (design: ApiDesign) =>
          design.title?.toLowerCase().includes(searchLower) ||
          design.description?.toLowerCase().includes(searchLower) ||
          design.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (selectedCategory !== "Tous") {
      filtered = filtered.filter(
        (design: ApiDesign) => design.category === selectedCategory
      );
    }

    if (selectedCollection !== "Tous") {
      filtered = filtered.filter(
        (design: ApiDesign) => design.collection === selectedCollection
      );
    }

    if (selectedEthnicGroup !== "Tous") {
      filtered = filtered.filter(
        (design: ApiDesign) => design.ethnicGroup === selectedEthnicGroup
      );
    }

    if (filters.featured) {
      filtered = filtered.filter((design: ApiDesign) => design.featured);
    }
    if (filters.new) {
      filtered = filtered.filter((design: ApiDesign) => design.new);
    }

    switch (sortBy) {
      case "popular":
        filtered.sort((a: ApiDesign, b: ApiDesign) => (b.likes || 0) - (a.likes || 0));
        break;
      case "recent":
        filtered.sort((a: ApiDesign, b: ApiDesign) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "price-asc":
        filtered.sort((a: ApiDesign, b: ApiDesign) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        filtered.sort((a: ApiDesign, b: ApiDesign) => (b.price || 0) - (a.price || 0));
        break;
    }

    return filtered;
  }, [search, selectedCategory, selectedCollection, selectedEthnicGroup, filters, sortBy, backendDesigns]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("Tous");
    setSelectedCollection("Tous");
    setSelectedEthnicGroup("Tous");
    setFilters({ featured: false, new: false, priceRange: [0, 100] });
    setSortBy("popular");
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* En-tête décoratif */}
      <div className="relative h-56 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="relative h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/30">
              <Palette className="h-4 w-4 text-amber-200" />
              <span className="text-amber-100 text-sm">18 ethnies · 1 âme</span>
              <Palette className="h-4 w-4 text-amber-200" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-wide">
              Notre <span className="font-semibold">Galerie</span> Sacrée
            </h1>
            <p className="text-amber-100 mt-4 max-w-2xl mx-auto px-4">
              Chaque création raconte une histoire, celle de Madagascar et de ses traditions
            </p>
          </motion.div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Verset d'ouverture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-amber-50 px-8 py-4 rounded-full border border-amber-200 shadow-sm">
              <p className="text-amber-800 italic flex items-center gap-3">
                <Cross className="h-5 w-5 text-amber-600" />
                "L'Éternel a fait pour nous de grandes choses"
                <Cross className="h-5 w-5 text-amber-600" />
              </p>
              <p className="text-amber-600 text-sm mt-1">— Psaume 126:3</p>
            </div>
          </motion.div>

          {/* En-tête avec logo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-12 bg-white p-8 rounded-3xl shadow-lg border border-gray-100"
          >
            <div className="flex-shrink-0 w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40">
              <VaguesEmeraudeLogo />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-4">
                <span className="font-semibold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                  ByGagoos Ink
                </span>
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl leading-relaxed">
                Une fusion unique entre l'art textile traditionnel malgache et le design contemporain.
                Chaque pièce raconte une histoire, celle de nos racines et de notre créativité.
              </p>
              
              <div className="flex items-center gap-2 mt-4">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                <Heart className="h-4 w-4 text-amber-500" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              </div>
            </div>
          </motion.div>

          {/* Barre de contrôle */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mb-8 space-y-4"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <motion.div variants={fadeInUp} className="relative flex-1 max-w-2xl w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un design..."
                  className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    title="Effacer la recherche"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                )}
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center space-x-3 w-full lg:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-5 py-4 rounded-xl border transition-all ${
                    showFilters
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
                  } shadow-sm`}
                  title="Afficher les filtres"
                >
                  <Filter className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Filtres</span>
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-5 py-4 border border-gray-200 rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm appearance-none cursor-pointer"
                  title="Trier par"
                >
                  <option value="popular">Les plus populaires</option>
                  <option value="recent">Nouveautés</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>

                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-4 transition-colors ${
                      viewMode === "grid"
                        ? "bg-amber-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                    title="Vue grille"
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-4 transition-colors ${
                      viewMode === "list"
                        ? "bg-amber-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                    title="Vue liste"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-600" />
                        Caractéristiques
                      </h3>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.featured}
                          onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
                          className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <span className="text-gray-700 group-hover:text-amber-600 transition-colors">En vedette</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.new}
                          onChange={(e) => setFilters({ ...filters, new: e.target.checked })}
                          className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <span className="text-gray-700 group-hover:text-amber-600 transition-colors">Nouveautés</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-amber-600" />
                        Catégories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {categoryOptions.map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedCategory === category
                                ? "bg-amber-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-amber-600" />
                        Collections
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {collectionOptions.map((collection) => (
                          <button
                            key={collection}
                            onClick={() => setSelectedCollection(collection)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedCollection === collection
                                ? "bg-amber-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {collection}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-amber-600" />
                        Inspirations ethniques
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {ethnicGroupOptions.map((group) => (
                          <button
                            key={group}
                            onClick={() => setSelectedEthnicGroup(group)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedEthnicGroup === group
                                ? "bg-amber-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {group}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Réinitialiser tous les filtres
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fadeInUp} className="flex justify-between items-center text-sm">
              <p className="text-gray-600 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="font-medium text-amber-600">{filteredDesigns.length}</span>
                <span>design{filteredDesigns.length !== 1 ? "s" : ""} trouvé{filteredDesigns.length !== 1 ? "s" : ""}</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Designs Grid/List */}
          <AnimatePresence mode="wait">
            {filteredDesigns.length > 0 ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {viewMode === "grid" ? (
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                  >
                    {filteredDesigns.map((design: ApiDesign) => (
                      <DesignCard key={design._id} design={design} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6 mb-12"
                  >
                    {filteredDesigns.map((design: ApiDesign) => (
                      <DesignListItem key={design._id} design={design} />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <EmptyState onReset={resetFilters} />
            )}
          </AnimatePresence>

          <InspirationSection />
          <CategoriesSection categories={categories} />
          <StudioPhotosSection photos={teamPhotos} />
          <CTASection />
        </div>
      </div>
    </div>
  );
}

// Composant DesignCard
function DesignCard({ design }: { design: ApiDesign }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
      
      <div className="relative bg-white">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {design.featured && (
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
              <Sparkles className="h-3 w-3" />
              En vedette
            </span>
          )}
          {design.new && (
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
              <Star className="h-3 w-3" />
              Nouveau
            </span>
          )}
        </div>

        {design.collection && (
          <span className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm text-amber-700 px-3 py-1 rounded-full text-xs font-medium shadow-lg border border-amber-200">
            {design.collection}
          </span>
        )}

        <div className="aspect-square overflow-hidden">
          <img
            src={design.thumbnail || "/images/placeholder-tshirt.png"}
            alt={design.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
              {design.title}
            </h3>
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {design.category}
            </span>
          </div>
          
          {design.description && (
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {design.description}
            </p>
          )}

          {design.tags && (
            <div className="flex flex-wrap gap-1 mb-3">
              {design.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {design.ethnicGroup && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500">Inspiration:</span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
                {design.ethnicGroup}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-gray-500">
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">{design.likes || 0}</span>
              </div>
              {design.price && (
                <span className="text-sm font-bold text-gray-900">
                  {design.price} €
                </span>
              )}
            </div>
            <button className="text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors flex items-center gap-1 group/btn">
              Voir détails
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Composant DesignListItem
function DesignListItem({ design }: { design: ApiDesign }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ x: 5 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-48 overflow-hidden relative">
          <img
            src={design.thumbnail || "/images/placeholder-tshirt.jpg"}
            alt={design.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </div>

        <div className="flex-1 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                {design.title}
              </h3>
            </div>
            <div className="flex gap-2">
              <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">
                {design.category}
              </span>
              {design.collection && (
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                  {design.collection}
                </span>
              )}
            </div>
          </div>

          {design.description && (
            <p className="text-gray-600 mb-4">{design.description}</p>
          )}

          {design.ethnicGroup && (
            <div className="flex flex-wrap gap-4 mb-4">
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
                {design.ethnicGroup}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1 text-gray-500">
                <Heart className="h-4 w-4" />
                <span className="font-medium">{design.likes || 0}</span>
              </div>
              {design.price && (
                <span className="font-bold text-gray-900">
                  {design.price} €
                </span>
              )}
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              Voir les détails
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Composant InspirationSection
function InspirationSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-20 bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-3xl p-8 md:p-12 shadow-xl border border-amber-200"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
          <Heart className="h-4 w-4 text-amber-600" />
          <span className="text-amber-800 text-sm font-medium">L'âme de Madagascar</span>
          <Heart className="h-4 w-4 text-amber-600" />
        </div>
        <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
          <span className="font-semibold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
            L'âme malgache
          </span>{' '}
          dans chaque création
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Chaque motif raconte une histoire, respectueuse des traditions et des fady de chaque région
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <motion.div whileHover={{ y: -5 }} className="text-center group cursor-default">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <span className="text-4xl">🔄</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Lamba & Lambahoany</h3>
          <p className="text-gray-600 text-sm">Inspiré des tissages traditionnels des hauts-plateaux</p>
        </motion.div>
        
        <motion.div whileHover={{ y: -5 }} className="text-center group cursor-default">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <span className="text-4xl">🌊</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Vagues & Océan</h3>
          <p className="text-gray-600 text-sm">Motifs inspirés de l'océan Indien</p>
        </motion.div>
        
        <motion.div whileHover={{ y: -5 }} className="text-center group cursor-default">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <span className="text-4xl">🌿</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Flore endémique</h3>
          <p className="text-gray-600 text-sm">Baobabs, ravinala et plantes uniques</p>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Composant EmptyState
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20 bg-white rounded-3xl shadow-lg border border-gray-100"
    >
      <div className="text-amber-200 mb-6">
        <Search className="h-20 w-20 mx-auto" />
      </div>
      <h3 className="text-3xl font-light text-gray-900 mb-3">
        Aucun <span className="font-semibold">résultat</span> trouvé
      </h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Aucun design ne correspond à vos critères de recherche.
      </p>
      <button
        onClick={onReset}
        className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all font-medium shadow-lg"
      >
        Réinitialiser les filtres
      </button>
    </motion.div>
  );
}

// Composant CategoriesSection
function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-20"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full"></div>
        <h2 className="text-3xl md:text-4xl font-light text-gray-900">
          Nos <span className="font-semibold">Collections</span>
        </h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 to-amber-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
            
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-2xl font-bold mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-200 text-sm mb-3">
                  {category.description}
                </p>
                <span className="text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-full p-2 w-8 h-8 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// Composant StudioPhotosSection
function StudioPhotosSection({ photos }: { photos: string[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-20"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full"></div>
        <h2 className="text-3xl md:text-4xl font-light text-gray-900">
          Dans Notre <span className="font-semibold">Atelier</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            className="group relative aspect-square overflow-hidden rounded-xl shadow-md cursor-pointer"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 to-amber-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
            <img
              src={photo}
              alt={`Atelier ByGagoos-Ink ${index + 1}`}
              className="relative w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// Composant CTASection
function CTASection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative py-20 overflow-hidden rounded-3xl mb-12"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-800 to-amber-600"></div>
      
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="relative text-center text-white max-w-4xl mx-auto px-4">
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
          Envie d'une création <span className="font-semibold">personnalisée</span> ?
        </h3>
        
        <p className="text-lg md:text-xl mb-8 text-amber-100 max-w-2xl mx-auto">
          Discutons de votre projet et créons ensemble une pièce unique
        </p>
        
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/contact"
          className="inline-flex items-center px-10 py-5 bg-white text-amber-700 rounded-xl hover:bg-gray-100 font-semibold transition-all shadow-xl group"
        >
          <span>Demander un devis personnalisé</span>
          <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={20} />
        </motion.a>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-amber-200 text-sm">
          <Cross className="h-4 w-4" />
          <span>"Que la beauté de nos créations soit à la gloire de Dieu"</span>
          <Cross className="h-4 w-4" />
        </div>
      </div>
    </motion.section>
  );
}