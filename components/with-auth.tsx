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
    let router = useRouter();
    let { onAuthenticating = defaultOnAuthenticating } = options;
    let { user } = useAuth();

    useEffect(() => {
      if (!user) {
        router.push("/login");
      }
    }, [router, user]);

    let success = !!user;
    return success ? <Component {...props} /> : onAuthenticating();
  };
};
