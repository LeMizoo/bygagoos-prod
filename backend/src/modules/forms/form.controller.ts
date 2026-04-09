import { Request, Response } from 'express';
import DynamicForm from './form.model';
import { catchAsync } from '../../core/utils/catchAsync'; // Utilise ton utilitaire existant
import { AppError } from '../../core/utils/errors/AppError'; // Utilise ton gestionnaire d'erreurs

/**
 * Récupère la configuration d'un formulaire par son slug (ex: contact, devis)
 * Accessible par TOUT LE MONDE (Public)
 */
export const getFormBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const form = await DynamicForm.findOne({ slug, isActive: true });

  if (!form) {
    throw new AppError(`Le formulaire '${slug}' n'existe pas ou est désactivé.`, 404);
  }

  res.status(200).json({
    status: 'success',
    data: form
  });
});

/**
 * Crée ou met à jour la structure d'un formulaire
 * RÉSERVÉ AUX ADMINS
 */
export const upsertFormConfig = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { title, description, fields, isActive } = req.body;

  // On utilise upsert: true pour créer le document s'il n'existe pas
  const form = await DynamicForm.findOneAndUpdate(
    { slug },
    { 
      title, 
      description, 
      fields, 
      isActive,
      slug // On s'assure que le slug reste correct
    },
    { 
      new: true, 
      upsert: true, 
      runValidators: true 
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Configuration du formulaire enregistrée avec succès',
    data: form
  });
});

/**
 * Liste tous les formulaires disponibles (pour l'admin)
 */
export const getAllForms = catchAsync(async (req: Request, res: Response) => {
  const forms = await DynamicForm.find().sort({ updatedAt: -1 });

  res.status(200).json({
    status: 'success',
    results: forms.length,
    data: forms
  });
});