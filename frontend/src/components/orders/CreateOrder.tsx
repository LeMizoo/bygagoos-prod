// frontend/src/components/orders/CreateOrder.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useForm,
  useFieldArray,
  SubmitHandler
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { Save, Trash2 } from 'lucide-react';

import { useOrderStore } from '../../stores/orderStore';
import { useClientStore } from '../../stores/clientStore';
import { useDesignStore } from '../../stores/designStore';
import { useAuthStore } from '../../stores/authStore';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';

import { formatPrice } from '../../utils/formatters';
import { uploadFile } from '../../api/upload';

// ==================
// ✅ ZOD SCHEMA SAFE
// ==================
const orderSchema = z.object({
  client: z.string().min(1, 'Client requis'),
  title: z.string().min(3, 'Min 3 caractères'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  requestedDate: z.string().min(1, 'Date requise'),

  designs: z.array(
    z.object({
      design: z.string().min(1, 'Design requis'),
      quantity: z.number().min(1, 'Min 1'),
      price: z.number().optional(),
      modifications: z.string().optional(),
      previewFile: z.string().optional(),
      existingPreview: z.string().optional()
    })
  ).min(1, 'Au moins un design'),

  taxRate: z.number(),

  discount: z.object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number(),
    reason: z.string().optional()
  }).partial().optional(),

  tags: z.array(z.string())
});

type OrderFormData = z.infer<typeof orderSchema>;

// ==================
// COMPONENT
// ==================
export const CreateOrder: React.FC = () => {
  const navigate = useNavigate();

  const [uploadingPreviews, setUploadingPreviews] = useState<Record<number, boolean>>({});

  const { createOrder, isLoading } = useOrderStore();
  const { clients, fetchClients } = useClientStore();
  const { designs, fetchDesigns } = useDesignStore();
  const { user } = useAuthStore();

  // ==================
  // ✅ FORM CLEAN
  // ==================
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      client: '',
      title: '',
      description: '',
      priority: 'MEDIUM',
      requestedDate: '',
      designs: [{ design: '', quantity: 1 }],
      taxRate: 20,
      discount: undefined,
      tags: []
    }
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = form;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'designs'
  });

  // ==================
  // LOAD DATA
  // ==================
  useEffect(() => {
    fetchClients(1, 100);
    fetchDesigns(1, 100);
  }, [fetchClients, fetchDesigns]);

  // ==================
  // TOTALS
  // ==================
  const watchedDesigns = watch('designs');
  const watchedDiscount = watch('discount');
  const taxRate = watch('taxRate');

  const totals = useMemo(() => {
    const subtotal =
      watchedDesigns?.reduce((sum, item) => {
        const design = designs.find(d => d._id === item.design);
        const price = item.price ?? design?.price ?? 0;
        return sum + price * item.quantity;
      }, 0) ?? 0;

    let afterDiscount = subtotal;

    if (watchedDiscount?.type && watchedDiscount.value) {
      afterDiscount =
        watchedDiscount.type === 'percentage'
          ? subtotal * (1 - watchedDiscount.value / 100)
          : Math.max(0, subtotal - watchedDiscount.value);
    }

    const tax = afterDiscount * (taxRate / 100);
    const total = afterDiscount + tax;

    return { subtotal, afterDiscount, tax, total };
  }, [watchedDesigns, watchedDiscount, taxRate, designs]);

  // ==================
  // UPLOAD
  // ==================
  const handlePreviewUpload = async (index: number, file: File) => {
    try {
      setUploadingPreviews(p => ({ ...p, [index]: true }));

      const url = await uploadFile(file, 'previews');

      update(index, {
        ...getValues(`designs.${index}`),
        previewFile: url
      });

      toast.success('Upload OK');
    } catch {
      toast.error('Erreur upload');
    } finally {
      setUploadingPreviews(p => ({ ...p, [index]: false }));
    }
  };

  // ==================
  // SUBMIT
  // ==================
  const onSubmit: SubmitHandler<OrderFormData> = async (data) => {
    try {
      const payload = {
        ...data,
        designs: data.designs.map(d => ({
          design: d.design,
          quantity: d.quantity,
          modifications: d.modifications,
          previewUrl: d.previewFile || d.existingPreview
        }))
      };

      const order = await createOrder(payload);

      toast.success('Commande créée');

      navigate(
        `/${user?.role === 'CLIENT' ? 'client' : 'admin'}/orders/${order._id}`
      );
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur inconnue';
      toast.error(message);
    }
  };

  // ==================
  // UI
  // ==================
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* INFOS */}
      <Card className="p-6 space-y-4">

        <div>
          <label className="block text-sm font-medium">Titre</label>
          <Input {...register('title')} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Priorité</label>
          <Select {...register('priority')}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium">Date demandée</label>
          <Input type="date" {...register('requestedDate')} />
        </div>

      </Card>

      {/* DESIGNS */}
      <Card className="p-6 space-y-4">

        <Button
          type="button"
          onClick={() => append({ design: '', quantity: 1 })}
        >
          Ajouter design
        </Button>

        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded space-y-3">

            <div>
              <label className="text-sm">Design</label>
              <Select {...register(`designs.${index}.design`)}>
                <option value="">Choisir</option>
                {designs.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.title}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-sm">Quantité</label>
              <Input
                type="number"
                {...register(`designs.${index}.quantity`, { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="text-sm">Preview</label>
              <input
                type="file"
                aria-label="Upload preview"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePreviewUpload(index, file);
                }}
              />
            </div>

            <Button
              type="button"
              variant="danger"
              onClick={() => remove(index)}
            >
              <Trash2 size={16} className="mr-2" />
              Supprimer
            </Button>

          </div>
        ))}

      </Card>

      {/* TOTAL */}
      <Card className="p-6">
        <p className="text-lg font-semibold">
          Total : {formatPrice(totals.total)}
        </p>
      </Card>

      {/* SUBMIT */}
      <Button type="submit" isLoading={isLoading}>
        <Save size={18} className="mr-2" />
        Créer
      </Button>

    </form>
  );
};