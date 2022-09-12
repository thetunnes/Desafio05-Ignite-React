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
import { ptBR } from 'date-fns/locale';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState([]);
  const [nextPage, setNextPage] = useState('');

  async function getMorePosts() {
    try {
      if (postsPagination?.next_page) {
        await fetch(postsPagination.next_page).then(async resp => {
          const data = await resp.json();
          const formattedPosts = data.results.map(post => ({
            uid: post.uid,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy'
            ),
          }));
          setNextPage(data.next_page);
          setPosts(prev => [...prev, ...formattedPosts]);
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    setPosts(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, []);

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
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <span>
                    <BsCalendar2Day />{' '}
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </span>
                  <span>
                    <BiUser /> {post.data.author}
                  </span>
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
    pageSize: 2,
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => ({
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    })),
  };

  return {
    props: {
      postsPagination,
    },
  };
};
