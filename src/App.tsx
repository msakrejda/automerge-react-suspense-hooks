import React, { useState } from "react";
import { WithRepo } from "./hooks";
import { AutomergeUrl, Repo } from "@automerge/automerge-repo";
import { useCreateDocument } from "./hooks/useCreateDocument";
import { useDocument } from "./hooks/useDocument";


type DemoDocType = {
  serial: number;
  createdAt: Date;
}

function App () {
  const [urls, setUrls] = useState<AutomergeUrl[]>([]);
  const createDoc = useCreateDocument<DemoDocType>();

  const repo = new Repo();

  function handleCreateDocument() {
    const newDoc = createDoc({
      serial: urls.length,
      createdAt: new Date(),
    });
    setUrls(docs => docs.concat(newDoc));
  }

  return (
    <WithRepo repo={repo} loader="please wait">
      <button onClick={handleCreateDocument}>
        Create new document
      </button>
      <div>
        {urls.length === 0 ? (
          "no documents"
        ) : urls.map((url) => <DocView key={url} url={url} />)
        }

      </div>
    </WithRepo>
  );
};

function DocView({url}: {url: AutomergeUrl}) {
  const doc = useDocument<DemoDocType>(url);
  return (
    <div>
      <pre>
        #{doc.serial}
        created {doc.createdAt.toLocaleString()}
      </pre>
    </div>
  );
}

export default App;
