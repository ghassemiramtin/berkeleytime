// https://dev.to/smithg09/building-graphql-api-with-nodejs-typegraphql-typegoose-and-troubleshooting-common-challenges-9oa
// https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/commit/06ee5fb8a1e50d434b5001e796b0b8d181daf874
// https://github.com/typestack/typedi/issues/173
import "apollo-cache-control";
import { RedisCache } from "apollo-server-cache-redis";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import passport from "passport";
import { dirname } from "path";
import { buildSchema } from "type-graphql";
import { MiddlewareFn } from "type-graphql";
import { Container } from "typedi";
import { URL } from "url";

import { URL_REDIS } from "#src/config";
import {
  CalAnswers_GradeResolver,
  SIS_ClassResolver,
  SIS_Class_SectionResolver,
  SIS_CourseResolver,
  UserResolver,
} from "#src/graphql/resolvers/_index";

import { getClassForDocument } from "@typegoose/typegoose";

const currentDir = dirname(new URL(import.meta.url).pathname);

const documentToObject = (doc: mongoose.Document) =>
  Object.setPrototypeOf(doc.toObject(), getClassForDocument(doc)!.prototype);
const TypegooseMiddleware: MiddlewareFn = async ({}, next) => {
  const result = await next();
  if (Array.isArray(result)) {
    return result.map((item) =>
      item instanceof mongoose.Model ? documentToObject(item) : item
    );
  } else {
    return result instanceof mongoose.Model ? documentToObject(result) : result;
  }
};

export default async (app) => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        CalAnswers_GradeResolver,
        SIS_ClassResolver,
        SIS_Class_SectionResolver,
        SIS_CourseResolver,
        UserResolver,
      ],
      authChecker: passport.authenticate("jwt", { session: false }),
      globalMiddlewares: [TypegooseMiddleware],
      emitSchemaFile: {
        path: `${currentDir}/schema.gql`,
        commentDescriptions: true,
        sortedSchema: true,
      },
      container: Container, // typedi Container: https://typegraphql.com/docs/dependency-injection.html --- https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/blob/9b6d4ba96e7f6be80d39d28bbb0aaba7670d04e5/apps/api/src/app/loaders/dependencyInjector.ts
      nullableByDefault: true,
    }),

    cache: new RedisCache(URL_REDIS),
    cacheControl: {
      defaultMaxAge: 5,
    },
    introspection: true,
    playground: process.env.NODE_ENV != "prod",
    tracing: false,
  });
  apolloServer.applyMiddleware({ app, path: "/api/graphql" });
};