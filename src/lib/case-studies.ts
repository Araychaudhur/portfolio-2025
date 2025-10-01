import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'src', 'content', 'case-studies');

export function getCaseStudyBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = path.join(contentDirectory, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return { slug: realSlug, frontmatter: data, content };
}

export function getAllCaseStudies() {
  const filenames = fs.readdirSync(contentDirectory);
  const caseStudies = filenames.map((filename) => {
    return getCaseStudyBySlug(filename);
  });
  return caseStudies;
}