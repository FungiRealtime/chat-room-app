import { createReactQueryHooks } from "@trpc/react";
import { AppRouter } from "../../pages/api/trpc/[trpc]";

export let trpc = createReactQueryHooks<AppRouter>();
