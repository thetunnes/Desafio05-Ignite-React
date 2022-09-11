import React, { useEffect, useMemo, useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import { format } from 'date-fns';

import { BiUser } from 'react-icons/bi';
import { BsCalendar2Day } from 'react-icons/bs';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  updateAt: string | null;
  // data: {
  title: string;
  subtitle: string;
  author: string;
  //};
}

interface PostPagination {
  next_page: string;
  posts: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  let test = false;

  const [posts, setPosts] = useState([]);
  const [nextPage, setNextPage] = useState('');
  const [loading, setLoading] = useState(false);
  async function getMorePosts() {
    try {
      await fetch(nextPage).then(async resp => {
        const data = await resp.json();
        console.log(data.results);
        setLoading(true);
        setNextPage(data.next_page);
        const formattedPosts = data.results.map(post => ({
          uid: post.slugs[0],
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
          updateAt: format(new Date(post.last_publication_date), 'dd MMM yyyy'),
        }));
        setPosts(prev => [...prev, ...formattedPosts]);
      });
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    setPosts(postsPagination.posts);
    setNextPage(postsPagination.next_page);
  }, []);

  useMemo(() => {
    setLoading(false);
  }, [posts]);

  console.log(posts);
  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      <header className={styles.header}>
        <img src="/Logo.svg" alt="logo" />
      </header>
      <main className={styles.content}>
        {posts &&
          posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.post}>
                <h1>{post.title}</h1>
                <p>{post.subtitle}</p>
                <div>
                  <span>
                    <BsCalendar2Day /> {post.updateAt}
                  </span>
                  <span>
                    <BiUser /> {post.author}
                  </span>
                  {loading && <div>Loading...</div>}
                </div>
              </a>
            </Link>
          ))}

        {nextPage && (
          <button onClick={getMorePosts} className={styles.loadMore}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    posts: postsResponse.results.map(post => ({
      uid: post.slugs[0],
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
      updateAt: format(new Date(post.last_publication_date), 'dd MMM yyyy'),
    })),
  };

  console.log(postsPagination);

  return {
    props: {
      postsPagination,
    },
  };
};
