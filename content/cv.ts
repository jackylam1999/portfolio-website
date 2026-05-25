// CV types — content lives in content/cv.json (read from disk at request time).

export interface CvEntry {
  year: string;
  title: string;
  subtitle?: string;
}

export interface CvSection {
  heading: string;
  entries: CvEntry[];
}

export interface CvContent {
  sections: CvSection[];
}
