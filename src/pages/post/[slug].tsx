import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import { BiUser } from 'react-icons/bi';
import { BsCalendar2Day } from 'react-icons/bs';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  // data: {
    title: string;
    banner: {
      url: string;
      alt?: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  // };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  console.log(post)
  return (
    <>
      <Header />

      <main className={styles.post}>
        <img className={styles.banner} src={post.banner.url} alt={post.banner?.alt ?? 'Banner do Post'} />

        <section className={styles.content}>
          <h1>{post.title}</h1>
          <div><span></span></div>
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  // const posts = await prismic.getByType(TODO);

  // TODO
  return {
    paths: [],
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;

  console.log(slug)
  const response = await prismic.getByUID("posts", String(slug), {});

  console.log(response)

  const postBySlug = {
    banner: response.data.banner,
    title: response.data.title,
    content: response.data.content,
    author: response.data.author,
    first_publication_date: response.first_publication_date
  }
  // TODO
  return {
    props: {
      post: postBySlug
    }
  }
};
