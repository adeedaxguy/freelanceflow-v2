export const seoRedirects = [
  ["/resources/google-maps-leads-for-web-designers", "/resources/google-maps-lead-generation-for-freelancers"],
  ["/resources/google-maps-prospecting-for-web-designers", "/resources/google-maps-prospecting-tool-for-freelancers"],
  ["/resources/freelance-sales-pipeline-from-google-maps", "/resources/google-maps-lead-generation-for-freelancers"],
] as const;

export const redirectedResourceSlugs = new Set(seoRedirects.map(([source]) => source.split("/").at(-1)));
