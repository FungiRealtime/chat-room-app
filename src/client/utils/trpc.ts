import { createReactQueryHooks } from "@trpc/react";
import type { AppRouter } from "../../server/utils/trpc/router";

export let trpc = createReactQueryHooks<AppRouter>();
