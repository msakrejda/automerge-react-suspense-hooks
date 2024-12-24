import { Repo } from "@automerge/automerge-repo";
import React from "react";

type Props = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

export class ErrorBoundary extends React.Component<
  Props,
  { error: Error | undefined }
> {
  constructor(props: Props) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export function makeRepo() {
  return new Repo({});
}
