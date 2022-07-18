import { render, screen } from '@testing-library/react'
import Posts, { getStaticProps } from '../../pages/posts'
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic'

const posts = [
    { slug: "my-new-post", title: "My New Post", excerpt: 'Post test', updatedAt: '30 de Abril'}
]

jest.mock('../../services/prismic')

describe("Posts page", () => {
    it('renders correctly', () => {
        render(<Posts posts={posts}/>)

        expect(screen.getByText('My New Post')).toBeInTheDocument()
    })

    it("loads initial data", async () => {
        const getPrismicClientMocked = mocked(getPrismicClient)

        getPrismicClientMocked.mockReturnValueOnce({
            query: jest.fn().mockResolvedValueOnce({
                results: [
                    {
                        uid: 'my-new-post',
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
                    }
                ]
            })
        } as any)

        const response = await getStaticProps({})

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    posts: [{
                        slug: 'my-new-post',
                        title: 'My New Post',
                        excerpt: 'Post Test',
                        updatedAt: '30 de abril de 2022'
                    }]
                }
            })
        )
    })
})