import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import { BiUser } from 'react-icons/bi';
import { BsCalendar2Day } from 'react-icons/bs';
import { FiClock } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { format } from 'date-fns';

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
  console.log(post.content);
  return (
    <>
      <Header />

      <main className={styles.post}>
        <img
          className={styles.banner}
          src={post?.banner.url}
          alt={post?.banner?.alt ?? 'Banner do Post'}
        />

        <section className={styles.content}>
          <h1>{post.title}</h1>
          <div className={styles.about}>
            <span>
              <BsCalendar2Day /> {post.first_publication_date}
            </span>
            <span>
              <BiUser /> {post.author}
            </span>
            <span>
              <FiClock /> {post.first_publication_date}
            </span>
          </div>

          <article>
            {post.content.map((body, index) => (
              <div className={styles.wrapperContent} key={index}>
                <h3>{body.heading}</h3>
                {body.body.map((x, i) => (
                  <p key={i}>{x.text}</p>
                ))}
              </div>
            ))}
          </article>
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const { results: posts } = await prismic.getByType('posts');
  console.log('AllPosts', posts);
  // TODO
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const postBySlug = {
    banner: response.data.banner,
    title: response.data.title,
    content: response.data.content,
    author: response.data.author,
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy'
    ),
  };
  return {
    props: {
      post: postBySlug,
    },
  };
};
