import * as GQL from "type-graphql";

import { User } from "#src/models/_index";

import Typegoose, { prop } from "@typegoose/typegoose";

declare namespace Express {
  interface Request {
    user?: User;
  }
}

// https://stackoverflow.com/questions/34508081/how-to-add-typescript-definitions-to-express-req-res
type TypedRequest<
  ReqBody = Record<string, unknown>,
  QueryString = Record<string, unknown>
> = Request<
  Record<string, unknown>,
  Record<string, unknown>,
  Partial<ReqBody>,
  Partial<QueryString>
>;
export type ExpressMiddleware<
  ReqBody = Record<string, unknown>,
  Res = Record<string, unknown>,
  QueryString = Record<string, unknown>
> = (
  req: TypedRequest<ReqBody, QueryString>,
  res: Response<Res>,
  next: NextFunction
) => Promise<void> | void;

export type ENUM_IDENTIFIER_TYPES =
  | "cs-course-id"
  | "cms-version-independent-id"
  | "cms-id";
