import { relations } from "drizzle-orm";
import { 
  classifications, 
  classificationJobs, 
  collectionCategories, 
  inputs 
} from "./resources";

export const classificationsRelations = relations(classifications, ({ one }) => ({
  job: one(classificationJobs, {
    fields: [classifications.jobId],
    references: [classificationJobs.id],
  }),
  input: one(inputs, {
    fields: [classifications.inputId],
    references: [inputs.id],
  }),
  category: one(collectionCategories, {
    fields: [classifications.categoryId],
    references: [collectionCategories.id],
  }),
}));

export const classificationJobsRelations = relations(classificationJobs, ({ one, many }) => ({
  input: one(inputs, {
    fields: [classificationJobs.inputId],
    references: [inputs.id],
  }),
  classifications: many(classifications),
}));

export const inputsRelations = relations(inputs, ({ many }) => ({
  jobs: many(classificationJobs),
  classifications: many(classifications),
}));

export const collectionCategoriesRelations = relations(collectionCategories, ({ one, many }) => ({
  classifications: many(classifications),
  parent: one(collectionCategories, {
    fields: [collectionCategories.parentId],
    references: [collectionCategories.id],
    relationName: "category_parent",
  }),
  children: many(collectionCategories, {
    relationName: "category_parent",
  }),
}));
