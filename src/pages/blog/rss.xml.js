import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../../lib/site.ts';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
  return rss({
    title: `Blog ${SITE.name} | Mudanzas Cusco`,
    description:
      'Consejos, guías y novedades sobre mudanzas, fletes y almacenaje en Cusco y el sur del Perú.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id.replace(/\.(md|mdx)$/, '')}/`,
      categories: [post.data.category, ...post.data.tags],
      author: post.data.author,
    })),
    customData: `<language>es-PE</language>`,
    stylesheet: false,
  });
}
