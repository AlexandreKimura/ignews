import { render, screen } from '@testing-library/react'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { mocked } from 'ts-jest/utils';
import { getSession } from 'next-auth/client';
import { getPrismicClient } from '../../services/prismic';

const post = { 
    slug: "my-new-post", 
    title: "My New Post",
    content: '<p>Post test</p>',
    updatedAt: '30 de Abril'
}

jest.mock('next-auth/client')

jest.mock('../../services/prismic')

describe("Posts page", () => {
    it('renders correctly', () => {
        render(<Post post={post}/>)

        expect(screen.getByText('My New Post')).toBeInTheDocument()
        expect(screen.getByText('Post test')).toBeInTheDocument()
    })

    it("redirects user if no subscription is found", async () => {
        const getSessionMocked = mocked(getSession)

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: null
        })
       
        const response = await getServerSideProps({ params : { slug: 'my-new-post'}} as any)

        expect(response).toEqual(
            expect.objectContaining({
                redirect: expect.objectContaining({
                    destination: '/'
                })
            })
        )
    })

    it("loads initial data", async () => {
        const getPrismicClientMocked = mocked(getPrismicClient)
        const getSessionMocked = mocked(getSession)

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription'
        })

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                        {
                            type: 'heading', text: 'My New Post'
                        }
                    ],
                    content: [
                        {
                            type: 'paragraph', text: 'Post Test'
                        }
                    ]
                },
                last_publication_date: '04-30-2022'
            })
        } as any)

        const response = await getServerSideProps({ params : { slug: 'my-new-post'}} as any)

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'My New Post',
                        content: '<p>Post Test</p>',
                        updatedAt: '30 de abril de 2022'
                    }
                }
            })
        )
    })
})