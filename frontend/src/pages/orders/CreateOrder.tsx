// frontend/src/pages/orders/CreateOrder.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save,
  Plus,
  Trash2,
  Search,
  Calendar,
  Check
} from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { useClientStore } from '../../stores/clientStore';
import { useDesignStore } from '../../stores/designStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { Stepper } from '../../components/ui/Stepper';
import { ClientSearch } from '../../components/clients/ClientSearch';
import { DesignSelector } from '../../components/designs/DesignSelector';
import { formatPrice } from '../../utils/formatters';
import dev from '../../utils/devLogger';

// Schéma de validation
const orderSchema = z.object({
  client: z.string().min(1, 'Le client est requis'),
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  requestedDate: z.string().min(1, 'La date souhaitée est requise'),
  designs: z.array(z.object({
    design: z.string().min(1, 'Design requis'),
    quantity: z.number().min(1, 'Quantité minimum 1'),
    modifications: z.string().optional()
  })).min(1, 'Au moins un design est requis'),
  taxRate: z.number().default(20),
  discount: z.object({
    type: z.enum(['percentage', 'fixed']).optional(),
    value: z.number().optional(),
    reason: z.string().optional()
  }).optional(),
  tags: z.array(z.string()).default([])
});

type OrderFormData = z.infer<typeof orderSchema>;

const steps = [
  { label: 'Client', description: 'Sélectionner le client' },
  { label: 'Designs', description: 'Choisir les designs' },
  { label: 'Détails', description: 'Informations complémentaires' },
  { label: 'Récapitulatif', description: 'Vérifier et valider' }
];

export const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchClient, setSearchClient] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  
  const { createOrder, isLoading } = useOrderStore();
  const { clients, fetchClients } = useClientStore();
  const { designs, fetchDesigns } = useDesignStore();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema) as any,
    defaultValues: {
      priority: 'MEDIUM',
      taxRate: 20,
      designs: [],
      tags: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'designs'
  });

  const watchedDesigns = watch('designs');
  const watchedDiscount = watch('discount');

  // Calculer les totaux
  const calculateTotals = () => {
    const subtotal = watchedDesigns?.reduce((sum, item) => {
      const design = designs.find(d => d._id === item.design);
      return sum + (design?.price || 0) * (item.quantity || 1);
    }, 0) || 0;

    let afterDiscount = subtotal;
    if (watchedDiscount?.type && watchedDiscount.value) {
      if (watchedDiscount.type === 'percentage') {
        afterDiscount = subtotal * (1 - watchedDiscount.value / 100);
      } else {
        afterDiscount = Math.max(0, subtotal - watchedDiscount.value);
      }
    }

    const tax = afterDiscount * (0.20); // TVA 20%
    const total = afterDiscount + tax;

    return { subtotal, afterDiscount, tax, total };
  };

  const totals = calculateTotals();

  // Charger les données initiales
  useEffect(() => {
    fetchClients(1, 100);
    fetchDesigns(1, 100);
  }, []);

  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
    setValue('client', client._id);
    setCurrentStep(2);
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      const order = await createOrder(data);
      navigate(`/orders/${order._id}`);
    } catch (error) {
      dev.error('Erreur création commande:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="relative">
              <Input
                placeholder="Rechercher un client par nom, email ou entreprise..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                icon={<Search size={20} />}
              />
            </div>

            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {clients
                .filter(client => 
                  client.firstName.toLowerCase().includes(searchClient.toLowerCase()) ||
                  client.lastName.toLowerCase().includes(searchClient.toLowerCase()) ||
                  client.email.toLowerCase().includes(searchClient.toLowerCase()) ||
                  client.company?.toLowerCase().includes(searchClient.toLowerCase())
                )
                .map(client => (
                  <Card
                    key={client._id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedClient?._id === client._id 
                        ? 'border-dark-teal bg-antique-white' 
                        : 'hover:border-dim-grey'
                    }`}
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-dark-teal text-white rounded-full flex items-center justify-center text-lg font-semibold">
                        {client.firstName[0]}{client.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {client.firstName} {client.lastName}
                        </h3>
                        <p className="text-sm text-dim-grey">{client.email}</p>
                        {client.company && (
                          <p className="text-sm text-dim-grey">{client.company}</p>
                        )}
                      </div>
                      {client._id === selectedClient?._id && (
                        <div className="text-dark-teal">
                          <Check size={24} />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold">Design #{index + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Design"
                    {...register(`designs.${index}.design`)}
                    error={errors.designs?.[index]?.design?.message}
                  >
                    <option value="">Sélectionner un design</option>
                    {designs.map(design => (
                      <option key={design._id} value={design._id}>
                        {design.title} - {formatPrice(design.price || 0)}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Quantité"
                    type="number"
                    min="1"
                    {...register(`designs.${index}.quantity`, { valueAsNumber: true })}
                    error={errors.designs?.[index]?.quantity?.message}
                  />

                  <div className="col-span-2">
                    <Textarea
                      label="Modifications souhaitées"
                      placeholder="Décrivez les modifications à apporter..."
                      {...register(`designs.${index}.modifications`)}
                    />
                  </div>
                </div>
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={() => append({ design: '', quantity: 1 })}
              className="w-full"
            >
              <Plus size={18} className="mr-2" />
              Ajouter un design
            </Button>

            {errors.designs?.message && (
              <p className="text-red-600 text-sm">{errors.designs.message}</p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Titre de la commande"
                placeholder="Ex: Création logo entreprise"
                {...register('title')}
                error={errors.title?.message}
              />

              <Select
                label="Priorité"
                {...register('priority')}
                error={errors.priority?.message}
              >
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
                <option value="URGENT">Urgente</option>
              </Select>

              <div className="col-span-2">
                <Textarea
                  label="Description"
                  placeholder="Description détaillée de la commande..."
                  {...register('description')}
                  error={errors.description?.message}
                />
              </div>

              <Input
                label="Date souhaitée"
                type="datetime-local"
                {...register('requestedDate')}
                error={errors.requestedDate?.message}
                icon={<Calendar size={18} />}
              />

              <Input
                label="TVA (%)"
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...register('taxRate', { valueAsNumber: true })}
                error={errors.taxRate?.message}
              />

              <div className="col-span-2">
                <Card className="bg-antique-white p-4">
                  <h4 className="font-semibold mb-3">Réduction</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Type"
                      {...register('discount.type')}
                    >
                      <option value="">Sans réduction</option>
                      <option value="percentage">Pourcentage</option>
                      <option value="fixed">Montant fixe</option>
                    </Select>

                    <Input
                      label="Valeur"
                      type="number"
                      min="0"
                      {...register('discount.value', { valueAsNumber: true })}
                    />

                    <div className="col-span-2">
                      <Input
                        label="Raison"
                        placeholder="Ex: Promotion fidélité"
                        {...register('discount.reason')}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="col-span-2">
                <Input
                  label="Tags"
                  placeholder="Séparés par des virgules"
                  {...register('tags')}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(t => t.trim());
                    setValue('tags', tags);
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Récapitulatif</h3>
              
              <div className="space-y-4">
                {/* Client */}
                <div>
                  <p className="text-sm text-dim-grey">Client</p>
                  <p className="font-medium">
                    {selectedClient?.firstName} {selectedClient?.lastName}
                  </p>
                  {selectedClient?.company && (
                    <p className="text-sm">{selectedClient.company}</p>
                  )}
                </div>

                {/* Designs */}
                <div>
                  <p className="text-sm text-dim-grey mb-2">Designs</p>
                  <div className="space-y-2">
                    {watchedDesigns?.map((item, index) => {
                      const design = designs.find(d => d._id === item.design);
                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {design?.title} x{item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatPrice((design?.price || 0) * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Prix */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{formatPrice(totals.subtotal)}</span>
                    </div>
                    
                    {watchedDiscount?.type && watchedDiscount.value && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Réduction ({watchedDiscount.type === 'percentage' 
                            ? `${watchedDiscount.value}%` 
                            : formatPrice(watchedDiscount.value)})
                        </span>
                        <span>
                          -{formatPrice(totals.subtotal - totals.afterDiscount)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>TVA (20%)</span>
                      <span>{formatPrice(totals.tax)}</span>
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total TTC</span>
                      <span className="text-dark-teal">
                        {formatPrice(totals.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Détails */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-dim-grey">Priorité</p>
                      <p className="font-medium capitalize">
                        {watch('priority')?.toLowerCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-dim-grey">Date souhaitée</p>
                      <p className="font-medium">
                        {new Date(watch('requestedDate')).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-black mb-2">
          Nouvelle commande
        </h1>
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)}>
        <Card className="p-6 mb-6">
          {renderStepContent()}
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft size={18} className="mr-2" />
            Précédent
          </Button>

          {currentStep < steps.length ? (
            <Button type="button" onClick={handleNext}>
              Suivant
              <ChevronRight size={18} className="ml-2" />
            </Button>
          ) : (
            <Button type="submit" isLoading={isLoading}>
              <Save size={18} className="mr-2" />
              Créer la commande
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};