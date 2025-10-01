import { defineDocumentType, makeSource } from 'contentlayer/source-files'

const CaseStudy = defineDocumentType(() => ({
  name: 'CaseStudy',
  filePathPattern: `case-studies/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    client: { type: 'string', required: true },
    year: { type: 'number', required: true },
    role: { type: 'string', required: true },
    stack: { type: 'list', of: { type: 'string' }, required: true },
    metrics: {
      type: 'list',
      of: { type: 'json' },
      required: true,
    },
    coverImage: { type: 'string', required: true },
    // The following fields are optional for now
    problems: { type: 'list', of: { type: 'string' } },
    actions: { type: 'list', of: { type: 'string' } },
    testimonial: { type: 'string' },
    artifacts: { type: 'list', of: { type: 'string' } },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('case-studies/', ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/case-studies/${doc._raw.flattenedPath.replace('case-studies/', '')}`,
    },
  },
}));

export default makeSource({
  contentDirPath: 'src/content',
  documentTypes: [CaseStudy],
});