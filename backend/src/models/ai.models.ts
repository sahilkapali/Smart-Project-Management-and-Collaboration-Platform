import { Schema, model, Types, Document } from 'mongoose';


// =====================================================
// AI OUTPUT TYPES
// =====================================================

export enum AIOutputType {
  INSIGHT = 'INSIGHT',
  TASK_PRIORITY = 'TASK_PRIORITY',
  MEETING_SUMMARY = 'MEETING_SUMMARY',
  ACTION_ITEMS = 'ACTION_ITEMS'
}


// =====================================================
// AI OUTPUT INTERFACE
// =====================================================

export interface IAIOutput extends Document {
  type: AIOutputType;

  user: Types.ObjectId;

  project?: Types.ObjectId;

  task?: Types.ObjectId;

  meeting?: Types.ObjectId;

  prompt: string;

  output: string;

  createdAt: Date;

  updatedAt: Date;
}


// =====================================================
// AI OUTPUT SCHEMA
// =====================================================

const aiOutputSchema = new Schema<IAIOutput>(
  {
    type: {
      type: String,
      enum: Object.values(AIOutputType),
      required: true,
      index: true
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project'
    },

    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    },

    meeting: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting'
    },

    prompt: {
      type: String,
      required: true
    },

    output: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);


export default model<IAIOutput>(
  'AIOutput',
  aiOutputSchema
);