import React, { useState } from "react";
import { WithRepo } from "./hooks";
import { AutomergeUrl, Repo } from "@automerge/automerge-repo";
import { useCreateDocument } from "./hooks/useCreateDocument";
import { useDocument } from "./hooks/useDocument";

type DemoDocType = {
  createdAt: Date;
};

function App() {
  const repo = new Repo();

  return (
    <WithRepo repo={repo} loader="please wait">
      <Main />
    </WithRepo>
  );
}

function Main() {
  const [urls, setUrls] = useState<AutomergeUrl[]>([]);

  function handleCreateDocument(newUrl: AutomergeUrl) {
    setUrls((urls) => urls.concat(newUrl));
  }
  return (
    <>
      <CreateDoc onCreate={handleCreateDocument} />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          marginTop: "32px",
          gap: "16px",
        }}
      >
        {urls.length === 0
          ? "no documents"
          : urls.map((url) => <DocView key={url} url={url} />)}
      </div>
    </>
  );
}

function CreateDoc({ onCreate }: { onCreate: (url: AutomergeUrl) => void }) {
  const createDoc = useCreateDocument<DemoDocType>();
  function handleCreateDocument() {
    const newUrl = createDoc({
      createdAt: new Date(),
    });
    onCreate(newUrl);
  }

  return <button onClick={handleCreateDocument}>Create new document</button>;
}

function DocView({ url }: { url: AutomergeUrl }) {
  const doc = useDocument<DemoDocType>(url);
  return (
    <div style={{ border: "1px solid black", padding: "8px" }}>
      created {doc.createdAt.toLocaleString()}
    </div>
  );
}

export default App;
