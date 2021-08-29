/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { AxiosResponse } from 'axios';
import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface ImageResponse {
  after?: number;
  data?: [
    {
      id: string;
      title: string;
      description: string;
      url: string;
      ts: number;
    }
  ];
}

export default function Home(): JSX.Element {
  const fetchImages = async ({
    pageParam = null,
  }): Promise<AxiosResponse<ImageResponse>> =>
    api.get<ImageResponse>(`/api/images`, {
      params: {
        after: pageParam,
      },
    });

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<AxiosResponse<ImageResponse>>('images', fetchImages, {
    getNextPageParam: lastPage => lastPage.data.after,
  });

  const formattedData = useMemo(() => {
    const formatted = data?.pages.flatMap(imageData => {
      return imageData.data.data.flat();
    });
    return formatted;
  }, [data]);

  if (isLoading && !isError) return <Loading />;

  if (isError && !isLoading) return <Error />;

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {hasNextPage && (
          <Button mt="4" onClick={() => fetchNextPage()}>
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </Button>
        )}
      </Box>
    </>
  );
}
