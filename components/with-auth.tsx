import { useRouter } from "next/router";
import { ComponentType, useEffect } from "react";
import { useAuth } from "./auth-provider";
import { LoadingAuth } from "./loading-auth";

const defaultOnAuthenticating = () => <LoadingAuth />;

interface WithAuthenticationRequiredOptions {
  /**
   * ```js
   * withAuthenticationRequired(Profile, {
   *   onAuthenticating: () => <div>Redirecting you to the login...</div>
   * })
   * ```
   *
   * Render a message to show that the user is being redirected to the login.
   */
  onAuthenticating?: () => JSX.Element;
}

export let withAuthenticationRequired = <P extends object>(
  Component: ComponentType<P>,
  options: WithAuthenticationRequiredOptions = {}
) => {
  return function WithAuthenticationRequired(props: P) {
    let { user, loading } = useAuth();
    let { onAuthenticating = defaultOnAuthenticating } = options;
    let router = useRouter();

    useEffect(() => {
      if (loading) return;

      if (!user) {
        router.push("/login");
      }
    }, [loading, router, user]);

    let success = !!user && !loading;
    return success ? <Component {...props} /> : onAuthenticating();
  };
};
