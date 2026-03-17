declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

/** Ensures JSX is valid when @types/react is not yet installed (e.g. before npm install). */
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }
}
