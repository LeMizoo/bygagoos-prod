// frontend/src/pages/admin/StaffDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
// 🔥 CORRECTION: Importer l'objet API par défaut
import adminStaffApi, { StaffMember, StaffApiError } from '../../api/adminStaff.api';
import { Avatar } from '../../components/ui/Avatar';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  MapPin, 
  Globe, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Instagram,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';
// 🔥 CORRECTION: Importer les fonctions helper de roles
import { UserRole, hasPermission, canEdit, canDelete } from '../../types/roles';
import dev from '../../utils/devLogger';

const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // 🔥 CORRECTION: Utiliser les fonctions helper de roles.ts
  const userRole = user?.role as UserRole | undefined;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  
  const canEditStaff = userRole ? canEdit(userRole, 'staff') || isSuperAdmin : false;
  const canDeleteStaff = userRole ? canDelete(userRole, 'staff') || isSuperAdmin : false;

  useEffect(() => {
    if (id) {
      loadStaff(id);
    }
  }, [id]);

  const loadStaff = async (staffId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      dev.log(`📡 Loading staff details for ID: ${staffId}`);
      const data = await adminStaffApi.getById(staffId);
      
      setStaff(data);
      dev.log('✅ Staff details loaded:', data);
    } catch (err) {
      dev.error('❌ Error loading staff:', err);
      
      if (err instanceof StaffApiError) {
        if (err.isNotFound()) {
          setError('Membre non trouvé');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erreur de chargement');
      }
      
      toast.error('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !canDeleteStaff) return;

    try {
      await adminStaffApi.delete(id);
      
      toast.success('Membre supprimé avec succès');
      navigate('/admin/staff');
    } catch (err) {
      dev.error('❌ Error deleting staff:', err);
      
      if (err instanceof StaffApiError) {
        toast.error(err.message);
      } else {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !staff || !canEditStaff) return;

    try {
      const updated = await adminStaffApi.toggleStatus(id, staff.isActive);
      
      setStaff(updated);
      toast.success(`Membre ${updated.isActive ? 'activé' : 'désactivé'}`);
    } catch (err) {
      dev.error('❌ Error toggling status:', err);
      
      if (err instanceof StaffApiError) {
        toast.error(err.message);
      } else {
        toast.error('Erreur lors du changement de statut');
      }
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!id || !canEditStaff) return;

    try {
      const result = await adminStaffApi.uploadAvatar(id, file);
      
      setStaff(prev => prev ? { ...prev, avatar: result.avatarUrl } : null);
      toast.success('Avatar mis à jour');
    } catch (err) {
      dev.error('❌ Error uploading avatar:', err);
      
      if (err instanceof StaffApiError) {
        toast.error(err.message);
      } else {
        toast.error('Erreur lors de l\'upload');
      }
    }
  };

  const handleExport = async () => {
    if (!staff) return;

    try {
      const blob = await adminStaffApi.export({
        format: 'csv',
        ids: [staff._id],
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff-${staff.firstName}-${staff.lastName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export réussi');
    } catch (err) {
      dev.error('❌ Error exporting:', err);
      toast.error('Erreur lors de l\'export');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {error || 'Membre non trouvé'}
        </h3>
        <p className="text-gray-600 mb-6">
          Le membre que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Link
          to="/admin/staff"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/staff"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Retour à la liste"
            title="Retour à la liste"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Profil de {staff.firstName} {staff.lastName}
          </h1>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            staff.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {staff.isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            title="Exporter"
            aria-label="Exporter les données"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          
          {canEditStaff && (
            <>
              <button
                onClick={() => navigate(`/admin/staff/edit/${staff._id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                title="Modifier"
                aria-label="Modifier le membre"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
              
              {canDeleteStaff && (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  title="Supprimer"
                  aria-label="Supprimer le membre"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Supprimer</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer {staff.firstName} {staff.lastName} ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                title="Annuler"
                aria-label="Annuler"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                title="Confirmer la suppression"
                aria-label="Confirmer la suppression"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carte principale */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* En-tête avec avatar */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 gap-4">
            <Avatar
              src={staff.avatar}
              name={`${staff.firstName} ${staff.lastName}`}
              size="xl"
              editable={canEditStaff}
              onUpload={handleAvatarUpload}
              className="border-4 border-white shadow-lg"
            />
            
            <div className="flex-1 mt-4 sm:mt-0 sm:ml-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {staff.firstName} {staff.lastName}
              </h2>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Briefcase className="h-4 w-4" />
                {staff.position || 'Poste non défini'}
                {staff.department && ` · ${staff.department}`}
              </p>
            </div>
            
            <button
              onClick={handleToggleStatus}
              disabled={!canEditStaff}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                staff.isActive
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              } ${!canEditStaff && 'opacity-50 cursor-not-allowed'}`}
              title={staff.isActive ? 'Désactiver le membre' : 'Activer le membre'}
              aria-label={staff.isActive ? 'Désactiver le membre' : 'Activer le membre'}
            >
              {staff.isActive ? (
                <>
                  <XCircle className="h-4 w-4" />
                  Désactiver
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Activer
                </>
              )}
            </button>
          </div>

          {/* Grille d'informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Colonne gauche */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Informations personnelles
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${staff.email}`} className="text-blue-600 hover:underline">
                      {staff.email}
                    </a>
                  </div>
                </div>
                
                {staff.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <a href={`tel:${staff.phone}`} className="text-gray-900 hover:underline">
                        {staff.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {staff.birthday && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Date de naissance</p>
                      <p className="text-gray-900">{formatDate(staff.birthday)}</p>
                    </div>
                  </div>
                )}
                
                {staff.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Adresse</p>
                      <p className="text-gray-900">{staff.address}</p>
                      {staff.city && <p className="text-gray-600">{staff.city}, {staff.country}</p>}
                    </div>
                  </div>
                )}
              </div>

              {staff.socialLinks && Object.values(staff.socialLinks).some(Boolean) && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Réseaux sociaux</h4>
                  <div className="flex gap-3">
                    {staff.socialLinks.linkedin && (
                      <a 
                        href={staff.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="LinkedIn"
                        aria-label="Profil LinkedIn"
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {staff.socialLinks.twitter && (
                      <a 
                        href={staff.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="Twitter"
                        aria-label="Profil Twitter"
                        className="text-gray-600 hover:text-blue-400 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {staff.socialLinks.facebook && (
                      <a 
                        href={staff.socialLinks.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="Facebook"
                        aria-label="Profil Facebook"
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {staff.socialLinks.instagram && (
                      <a 
                        href={staff.socialLinks.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="Instagram"
                        aria-label="Profil Instagram"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Informations professionnelles
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Poste</p>
                    <p className="text-gray-900">{staff.position || 'Non défini'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Rôle</p>
                    <p className="text-gray-900">{staff.role}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date d'embauche</p>
                    <p className="text-gray-900">{staff.hireDate ? formatDate(staff.hireDate) : 'Non spécifiée'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Type de contrat</p>
                    <p className="text-gray-900">{staff.contractType || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>

              {staff.skills && staff.skills.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Compétences</h4>
                  <div className="flex flex-wrap gap-2">
                    {staff.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {staff.responsibilities && staff.responsibilities.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Responsabilités</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {staff.responsibilities.map((resp, index) => (
                      <li key={index} className="text-gray-700">{resp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Notes si présentes */}
          {staff.notes && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{staff.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDetailPage;