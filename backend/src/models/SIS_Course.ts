/**
 * SIS Course API is a huge pain in the ass so there's still tons of value in
 * converting their XML responses into a Mongo collection that we can use as
 * even if it's not inserted into GraphQL and even if it's just "raw data"
 */
import mongoose from "mongoose"
import timeMachine from "mongoose-time-machine"

const SIS_CourseSchema = new mongoose.Schema(
  {},
  {
    collection: "sis_course",
    minimize: false,
    strict: false,
    timestamps: { createdAt: "_created", updatedAt: "_updated" },
    toJSON: {
      /* Can use toJSON() as the method for public-facing responses */
      getters: true,
      transform: (doc, ret, options) => {
        delete ret._id
        delete ret._version
        delete ret.id
        delete ret._updated
        delete ret._created
        return ret
      },
    },
    versionKey: "_version",
  }
)

SIS_CourseSchema.plugin(timeMachine.plugin, { name: "sis_course_history" })

export const SIS_Course = mongoose.model("sis_course", SIS_CourseSchema)
