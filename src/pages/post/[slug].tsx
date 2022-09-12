import { useMemo } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import { BiUser } from 'react-icons/bi';
import { BsCalendar2Day } from 'react-icons/bs';
import { FiClock } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
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
  };
  // timeToRead: number;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const timeToRead = useMemo(() => {
    const allLetters = post.data.content.reduce((acc, content) => {
      let arr = acc;
      const letterHeading = content.heading.split(' ');
      const letterBody = content.body.map(({ text }) => text.split(' '));
      let arrayBody = [];
      for (let x of letterBody) {
        arrayBody.push(...x);
      }
      arr = [...arr, ...letterHeading, ...arrayBody];
      return arr;
    }, []);
    return Math.ceil(allLetters.length / 200);
  }, [post]);

  if (router.isFallback) {
    return (
      <>
        <Header />
        <p className={styles.postIsLoading}>Carregando...</p>
      </>
    );
  }
  return (
    <>
      <Header />

      <main className={styles.post}>
        <img
          className={styles.banner}
          src={post?.data.banner?.url}
          alt={post?.data.banner?.alt ?? 'Banner do Post'}
        />

        <section className={styles.content}>
          <h1>{post?.data.title}</h1>
          <div className={styles.about}>
            <span>
              <BsCalendar2Day />{' '}
              {format(new Date(post?.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
            <span>
              <BiUser /> {post?.data.author}
            </span>
            <span>
              <FiClock /> {`${timeToRead} min`}
            </span>
          </div>

          <article>
            {post?.data.content &&
              post.data.content?.map((body, index) => (
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
  const staticPosts = posts.reduce((acc, post) => {
    const object = {
      params: { slug: post.uid },
    };
    acc.push(object);
    return acc;
  }, []);

  return {
    paths: staticPosts,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});

  // const allLetters = response.data.content.reduce((acc, content) => {
  //   let arr = acc;
  //   const letterHeading = content.heading.split(' ');
  //   const letterBody = content.body.map(({ text }) => text.split(' '));
  //   let arrayBody = [];
  //   for (let x of letterBody) {
  //     arrayBody.push(...x);
  //   }
  //   arr = [...arr, ...letterHeading, ...arrayBody];
  //   return arr;
  // }, []);

  const postBySlug = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      banner: response.data.banner,
      title: response.data.title,
      subtitle: response.data.subtitle,
      content: response.data.content,
      author: response.data.author,
    },
    // timeToRead: Number((allLetters.length / 200).toFixed(0)),
  };
  return {
    props: {
      post: postBySlug,
      revalidate: 60 * 60 * 10, // 10 hours
    },
  };
};
