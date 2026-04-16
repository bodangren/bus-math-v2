/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as api_ from "../api.js";
import type * as auth from "../auth.js";
import type * as component_approval_validators from "../component_approval_validators.js";
import type * as component_approvals from "../component_approvals.js";
import type * as dashboardHelpers from "../dashboardHelpers.js";
import type * as practice_submission from "../practice_submission.js";
import type * as public_ from "../public.js";
import type * as rateLimits from "../rateLimits.js";
import type * as seed from "../seed.js";
import type * as spreadsheet_validators from "../spreadsheet_validators.js";
import type * as srs from "../srs.js";
import type * as student from "../student.js";
import type * as study from "../study.js";
import type * as teacher from "../teacher.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  api: typeof api_;
  auth: typeof auth;
  component_approval_validators: typeof component_approval_validators;
  component_approvals: typeof component_approvals;
  dashboardHelpers: typeof dashboardHelpers;
  practice_submission: typeof practice_submission;
  public: typeof public_;
  rateLimits: typeof rateLimits;
  seed: typeof seed;
  spreadsheet_validators: typeof spreadsheet_validators;
  srs: typeof srs;
  student: typeof student;
  study: typeof study;
  teacher: typeof teacher;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
