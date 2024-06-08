/** @jsxImportSource hastscript */
import type { Nodes } from "hast";
import { u } from "unist-builder";

interface LayoutProps {
  /**
   * URL to redirect to.
   */
  url: string;

  /**
   * Children added to `<head>`.
   */
  children?: Nodes | Nodes[];
}

export function makeRedirect({ url, children }: LayoutProps) {
  return (
    <>
      {u("doctype")}
      <html>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <link rel="canonical" href={url} />
        {children}
        <meta http-equiv="refresh" content={`0;url=${url}`} />
      </html>
      <body>
        <script>{`location.href = ${JSON.stringify(url)};`}</script>
      </body>
    </>
  );
}
