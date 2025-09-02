import { model, Schema, Types } from "mongoose";

export interface INote {
  content: string;
  type: 'general' | 'meeting' | 'call' | 'email';
  companyId: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

const noteSchema = new Schema<INote>({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  createdBy:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  }
},
 { timestamps: true });

export const Note = model<INote>('Note', noteSchema);   