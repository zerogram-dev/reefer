export type Ref = {
  url: URL;
  timestamp: Date;
};

export type RefWithLine = Ref & {
  line: number;
};

export type FileRefs = {
  filepath: string;
  refs: RefWithLine[];
};

export type RefsMap = Map<
  string,
  ({ timestamp: Date; line: number; filepath: string })[]
>;

export type FetchedRefsMap = Map<
  string,
  {
    latestCommit: Commit;
    refs: {
      filepath: string;
      line: number;
      timestamp: Date;
      commit: Commit;
    }[];
  }
>;

export type Commit = {
  date: Date;
  hash: string;
};
