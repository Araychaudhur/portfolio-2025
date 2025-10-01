import { getCaseStudyBySlug, getAllCaseStudies } from '@/lib/case-studies';
import { MDXRemote } from 'next-mdx-remote/rsc';

export async function generateStaticParams() {
  const caseStudies = getAllCaseStudies();
  return caseStudies.map((study) => ({ slug: study.slug }));
}

// This is the correct pattern: an async Server Component directly rendering the RSC-compatible MDXRemote.
export default async function CaseStudyPage({ params }: { params: { slug: string } }) {
  const { frontmatter, content } = getCaseStudyBySlug(params.slug);

  return (
    <article>
      <h1 className="text-4xl font-bold mb-2">{frontmatter.title}</h1>
      <p className="text-muted-foreground mb-8">
        {frontmatter.client} &bull; {frontmatter.year}
      </p>

      <div className="prose dark:prose-invert max-w-none">
        <MDXRemote source={content} />
      </div>
    </article>
  );
}