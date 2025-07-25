import { z } from 'zod';
import { createPendidikanSchema } from './create-pendidikan.dto';

export const updatePendidikanSchema = createPendidikanSchema.partial();
export type UpdatePendidikanDto = z.infer<typeof updatePendidikanSchema>;